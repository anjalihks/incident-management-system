const RDBMSStrategy = require('./rdbms.strategy');
const CacheStrategy = require('./cache.strategy');

function getStrategy(componentId) {
  if (componentId.includes("RDBMS")) return new RDBMSStrategy();
  if (componentId.includes("CACHE")) return new CacheStrategy();

  return {
    sendAlert: () => console.log("ℹ️ Default alert")
  };
}

module.exports = getStrategy;