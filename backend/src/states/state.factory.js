const OpenState = require('./open.state');
const InvestigatingState = require('./investigating.state');
const ResolvedState = require('./resolved.state');

function getState(status) {
  switch (status) {
    case "OPEN": return new OpenState();
    case "INVESTIGATING": return new InvestigatingState();
    case "RESOLVED": return new ResolvedState();
    default: return null;
  }
}

module.exports = getState;