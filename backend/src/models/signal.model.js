const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  componentId: String,
  type: String,
  severity: String,
  message: String,
  timestamp: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Signal', signalSchema);