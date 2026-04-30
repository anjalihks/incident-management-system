const AlertStrategy = require('./alert.strategy');

class CacheStrategy extends AlertStrategy {
  sendAlert(signal) {
    console.log("⚠️ P2 ALERT (CACHE): Slack notification");
  }
}

module.exports = CacheStrategy;