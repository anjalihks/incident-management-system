const AlertStrategy = require('./alert.strategy');

class RDBMSStrategy extends AlertStrategy {
  sendAlert(signal) {
    console.log("🚨 P0 ALERT (RDBMS): Paging on-call engineer");
  }
}

module.exports = RDBMSStrategy;