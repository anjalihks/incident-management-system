const IncidentState = require('./incident.state');

class OpenState extends IncidentState {
  next() {
    return "INVESTIGATING";
  }
}

module.exports = OpenState;