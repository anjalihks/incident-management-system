const Incident = require("../models/incident.model");
const Signal = require("../models/signal.model");

/**
 * 📥 Get ALL incidents + enrich with Mongo signals
 */
async function getAllIncidents(req, res) {
  try {
    const incidents = await Incident.getAllIncidents();

    // 🔥 Enrich with signals from Mongo
    const enriched = await Promise.all(
      incidents.map(async (inc) => {
        const signals = await Signal.find({
          componentId: inc.component_id
        }).sort({ timestamp: -1 });

        return {
          ...inc,
          latest_signal: signals[0]?.message || null,
          signal_count: signals.length
        };
      })
    );

    res.json(enriched);

  } catch (err) {
    console.error("❌ Error fetching incidents:", err);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
}

/**
 * 🧠 Add RCA + Calculate MTTR
 */
async function addRCA(req, res) {
  try {
    const { id } = req.params;
    const rcaData = req.body;

    if (
      !rcaData.start_time ||
      !rcaData.end_time ||
      !rcaData.category ||
      !rcaData.fix ||
      !rcaData.prevention
    ) {
      return res.status(400).json({
        error: "RCA incomplete"
      });
    }

    const start = new Date(rcaData.start_time);
    const end = new Date(rcaData.end_time);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        error: "Invalid RCA time format"
      });
    }

    if (end <= start) {
      return res.status(400).json({
        error: "RCA end_time must be after start_time"
      });
    }

    const updated = await Incident.addRCA(id, rcaData);

    res.json(updated);

  } catch (err) {
    console.error("❌ RCA error:", err);
    res.status(500).json({ error: "Failed to add RCA" });
  }
}

/**
 * 🔁 State Machine: OPEN → INVESTIGATING → RESOLVED → CLOSED
 */
async function nextState(req, res) {
  try {
    const { id } = req.params;

    const incidents = await Incident.getAllIncidents();
    const incident = incidents.find(i => i.id == id);

    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    let next;

    if (incident.status === "OPEN") {
      next = "INVESTIGATING";

    } else if (incident.status === "INVESTIGATING") {
      next = "RESOLVED";

    } else if (incident.status === "RESOLVED") {
      // 🔥 Mandatory RCA check before closing
      if (!incident.rca) {
        return res.status(400).json({
          error: "Cannot CLOSE without RCA"
        });
      }
      next = "CLOSED";

    } else {
      return res.status(400).json({
        error: "Invalid transition"
      });
    }

    const updated = await Incident.updateStatus(id, next);

    res.json(updated);

  } catch (err) {
    console.error("❌ State error:", err);
    res.status(500).json({ error: "Failed to update state" });
  }
}

module.exports = {
  getAllIncidents,
  addRCA,
  nextState
};