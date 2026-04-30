require('dotenv').config();
const app = require('./src/app');
const startWorker = require('./src/workers/signal.worker');
const connectMongo = require('./src/config/mongo');

const PORT = process.env.PORT || 5000;

// Connect Mongo
connectMongo();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Start worker
startWorker();