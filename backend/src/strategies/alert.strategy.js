class AlertStrategy {
  sendAlert(signal) {
    throw new Error("sendAlert must be implemented");
  }
}

module.exports = AlertStrategy;