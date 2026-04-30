const { redisSubscriber } = require('../config/redis');
const Signal = require('../models/signal.model');

const {
  createIncident,
  getActiveIncident
} = require('../models/incident.model');

const getStrategy = require('../strategies/alert.factory');
const { incrementIncidents } = require('../utils/metrics');

async function startWorker() {
  console.log("🚀 Worker started...");

  await redisSubscriber.xgroup(
    "CREATE",
    "signals_stream",
    "incident_group",
    "$",
    "MKSTREAM"
  ).catch(() => {});

  while (true) {
    try {
      const response = await redisSubscriber.xreadgroup(
        "GROUP",
        "incident_group",
        "worker_1",
        "BLOCK",
        5000,
        "COUNT",
        1,
        "STREAMS",
        "signals_stream",
        ">"
      );

      if (!response) continue;

      const [, messages] = response[0];

      for (const [id, fields] of messages) {
        const signal = JSON.parse(fields[1]);

        console.log("📩 Processing:", signal);

        const { componentId, severity } = signal;

        // 🔥 Save raw signal (Mongo)
        await Signal.create(signal);

        // 🔥 Check existing incident
        let incident = await getActiveIncident(componentId);

        if (incident) {
          console.log("🔁 Existing incident:", incident.id);
        } else {
          // 🔥 FIX: PASS SEVERITY HERE
          incident = await createIncident(componentId, severity);
          incrementIncidents();

          console.log("🚨 New INCIDENT:", incident.id, "Severity:", severity);
        }

        // 🔥 Alert Strategy
        const strategy = getStrategy(componentId);
        strategy.sendAlert(signal);

        // ACK
        await redisSubscriber.xack(
          "signals_stream",
          "incident_group",
          id
        );
      }

    } catch (err) {
      console.error("❌ Worker error:", err);
    }
  }
}

module.exports = startWorker;