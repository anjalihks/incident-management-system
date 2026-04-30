const Redis = require('ioredis');

// Writer (API)
const redisClient = new Redis({
  host: '127.0.0.1',
  port: 6379
});

// Reader (Worker)
const redisSubscriber = new Redis({
  host: '127.0.0.1',
  port: 6379
});

redisClient.on('connect', () => {
  console.log('✅ Redis Client Connected');
});

redisSubscriber.on('connect', () => {
  console.log('✅ Redis Worker Connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisSubscriber.on('error', (err) => {
  console.error('❌ Redis Worker Error:', err);
});

module.exports = {
  redisClient,
  redisSubscriber
};