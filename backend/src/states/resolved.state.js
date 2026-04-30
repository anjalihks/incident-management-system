const IncidentState = require('./incident.state');

class ResolvedState extends IncidentState {
  next() {
    return "CLOSED";
  }
}

module.exports = ResolvedState;