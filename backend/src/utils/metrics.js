let totalSignals = 0;
let totalIncidents = 0;

function incrementSignals() {
  totalSignals++;
}

function incrementIncidents() {
  totalIncidents++;
}

function getMetrics() {
  return {
    totalSignals,
    totalIncidents,
    timestamp: Date.now()
  };
}

module.exports = {
  incrementSignals,
  incrementIncidents,
  getMetrics
};