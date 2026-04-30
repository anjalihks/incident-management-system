import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [incidents, setIncidents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [signals, setSignals] = useState([]);
  const [rcaForm, setRcaForm] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/incidents");
      const data = await res.json();

      const order = { P0: 1, P1: 2, P2: 3, P3: 4 };

      data.sort((a, b) => {
        return (order[a.severity || "P3"] - order[b.severity || "P3"]);
      });

      setIncidents(data);

      // keep selected updated
      setSelected(prev => {
        if (!prev) return prev;
        const updated = data.find(i => i.id === prev.id);
        return updated || prev;
      });

    } catch (err) {
      console.error(err);
    }
  };

  const loadSignals = async (componentId) => {
    const res = await fetch(`http://localhost:5000/api/signals/${componentId}`);
    const data = await res.json();
    setSignals(data);
  };

  const selectIncident = (inc) => {
    setSelected(inc);
    loadSignals(inc.component_id);
    setFormError("");
  };

  const handleChange = (field, value) => {
    setRcaForm(prev => ({ ...prev, [field]: value }));
    setFormError("");
  };

  const submitRCA = async () => {
    const missing = [];
    if (!rcaForm.start_time) missing.push("start time");
    if (!rcaForm.end_time) missing.push("end time");
    if (!rcaForm.category) missing.push("category");
    if (!rcaForm.fix || !rcaForm.fix.trim()) missing.push("fix");
    if (!rcaForm.prevention || !rcaForm.prevention.trim()) missing.push("prevention");

    if (missing.length) {
      setFormError(`Please fill: ${missing.join(", ")}`);
      return;
    }

    if (new Date(rcaForm.end_time) <= new Date(rcaForm.start_time)) {
      setFormError("End time must be after start time");
      return;
    }

    const res = await fetch(`http://localhost:5000/api/incidents/${selected.id}/rca`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(rcaForm)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      setFormError(errorData.error || "Failed to submit RCA");
      return;
    }

    setSelected(null);
    setRcaForm({});
    setFormError("");
    fetchIncidents();
  };

  const nextState = async (id) => {
    await fetch(`http://localhost:5000/api/incidents/${id}/next`, {
      method: "PATCH"
    });

    fetchIncidents();
  };

  const getNextLabel = (status) => {
    switch (status) {
      case "OPEN":
        return "Start Investigation";
      case "INVESTIGATING":
        return "Mark Resolved";
      case "RESOLVED":
        return "Close Incident";
      default:
        return null;
    }
  };

  const getIncidentMttr = (incident) => {
    if (!incident) return null;

    if (incident.mttr !== null && incident.mttr !== undefined) {
      return Number(incident.mttr);
    }

    if (!incident.rca) return null;

    try {
      const rcaData =
        typeof incident.rca === "string" ? JSON.parse(incident.rca) : incident.rca;

      if (rcaData?.mttr !== null && rcaData?.mttr !== undefined) {
        return Number(rcaData.mttr);
      }
    } catch (err) {
      console.error("Failed to parse RCA JSON:", err);
    }

    return null;
  };

  const getMttrDisplay = (incident, mttr) => {
    if (!incident) return "-";
    if (mttr !== null) return `${mttr} min`;
    if (incident.status === "INVESTIGATING") return "Pending RCA";
    if (incident.status === "OPEN") return "Not available";
    return "-";
  };

  const getRcaData = (incident) => {
    if (!incident?.rca) return null;
    if (typeof incident.rca === "string") {
      try {
        return JSON.parse(incident.rca);
      } catch (err) {
        console.error("Failed to parse RCA JSON:", err);
        return null;
      }
    }
    return incident.rca;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const selectedMttr = getIncidentMttr(selected);
  const selectedRca = getRcaData(selected);
  const isInvestigating = selected?.status === "INVESTIGATING";
  return (
    <div className="app">
      <h1>🚨 Incident Management System</h1>

      <div className="layout">

        {/* LEFT PANEL */}
        <div className="list">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className={`card ${selected?.id === inc.id ? "active" : ""}`}
            >
              <div className="row">
                <span>#{inc.id}</span>
                <span className={`severity ${inc.severity || "P3"}`}>
                  {inc.severity || "P3"}
                </span>
              </div>

              <p className="component">{inc.component_id}</p>
              <p className="status">{inc.status}</p>

              <p className="preview">
                {inc.latest_signal || "No signals yet"}
              </p>

              <p className="count">
                Signals: {inc.signal_count || 0}
              </p>

              {/* 🔥 BUTTON */}
              <button
                className="view-btn"
                onClick={() => selectIncident(inc)}
              >
                View Details →
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        {selected && (
          <div className="details">

            <h2>Incident #{selected.id}</h2>

            <p>Status: {selected.status}</p>
            <p>Severity: {selected.severity || "P3"}</p>
            <p>MTTR: {getMttrDisplay(selected, selectedMttr)}</p>

            {selectedRca && (
              <div className="rca-card">
                <div className="rca-header">
                  <h3>RCA Report</h3>
                  <span className="rca-badge">{selected.status}</span>
                </div>

                <div className="rca-grid">
                  <p><strong>Category:</strong> {selectedRca.category || "-"}</p>
                  <p><strong>Start:</strong> {formatDateTime(selectedRca.start_time)}</p>
                  <p><strong>End:</strong> {formatDateTime(selectedRca.end_time)}</p>
                  <p><strong>MTTR:</strong> {selectedMttr !== null ? `${selectedMttr} min` : "-"}</p>
                </div>

                <div className="rca-block">
                  <p className="rca-label">Fix Applied</p>
                  <pre className="rca-text">{selectedRca.fix || "-"}</pre>
                </div>

                <div className="rca-block">
                  <p className="rca-label">Prevention Plan</p>
                  <pre className="rca-text">{selectedRca.prevention || "-"}</pre>
                </div>
              </div>
            )}

            {/* SIGNALS */}
            <h3>Signals</h3>
            <div className="signals">
              {signals.map((s, i) => (
                <div key={i} className="signal">
                  {s.message}
                </div>
              ))}
            </div>

            {/* RCA FORM */}
            {isInvestigating && (
              <div className="form-card">
              <h3>RCA Form</h3>

                <input
                  type="datetime-local"
                  value={rcaForm.start_time || ""}
                  onChange={(e) =>
                    handleChange("start_time", e.target.value)
                  }
                />

                <input
                  type="datetime-local"
                  value={rcaForm.end_time || ""}
                  onChange={(e) =>
                    handleChange("end_time", e.target.value)
                  }
                />

                <select
                  value={rcaForm.category || ""}
                  onChange={(e) =>
                    handleChange("category", e.target.value)
                  }
                >
                  <option value="">Select Category</option>
                  <option>Infrastructure</option>
                  <option>Application</option>
                  <option>Network</option>
                </select>

                <textarea
                  placeholder="Fix applied"
                  value={rcaForm.fix || ""}
                  onChange={(e) =>
                    handleChange("fix", e.target.value)
                  }
                />

                <textarea
                  placeholder="Prevention"
                  value={rcaForm.prevention || ""}
                  onChange={(e) =>
                    handleChange("prevention", e.target.value)
                  }
                />

                  <button
                    className="primary-btn"
                    onClick={submitRCA}
                  >
                    Submit RCA
                  </button>
                  {formError && <p className="form-note error">{formError}</p>}
              </div>
            )}

            {/* NEXT BUTTON */}
            {getNextLabel(selected.status) && (
              <button
                className="primary-btn"
                onClick={() => nextState(selected.id)}
              >
                {getNextLabel(selected.status)}
              </button>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default App;