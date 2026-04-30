const IncidentState = require('./incident.state');

class InvestigatingState extends IncidentState {
  next() {
    return "RESOLVED";
  }
}

module.exports = InvestigatingState;