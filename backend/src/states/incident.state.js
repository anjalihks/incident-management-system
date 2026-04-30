class IncidentState {
  next() {
    throw new Error("Must implement next()");
  }
}

module.exports = IncidentState;