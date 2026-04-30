const { redisClient } = require('../config/redis');
const { incrementSignals } = require('../utils/metrics');

exports.ingestSignal = async (req, res) => {
  try {
    const { componentId, severity, message } = req.body;

    // 🔥 VALIDATION
    if (!componentId || !message) {
      return res.status(400).json({
        error: "componentId and message required"
      });
    }

    // default severity if not provided
    const finalSeverity = severity || "P3";

    const signal = {
      componentId,
      severity: finalSeverity,
      message,
      timestamp: Date.now()
    };

    // 🔥 push to Redis stream
    await redisClient.xadd(
      "signals_stream",
      "*",
      "data",
      JSON.stringify(signal)
    );

    incrementSignals();

    console.log("📥 Signal ingested:", signal);

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Ingest error:", err);
    res.status(500).json({ error: err.message });
  }
};