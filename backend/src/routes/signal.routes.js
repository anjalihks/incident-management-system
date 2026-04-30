const express = require('express');
const router = express.Router();

const Signal = require('../models/signal.model');

router.get('/:componentId', async (req, res) => {
  const { componentId } = req.params;

  const signals = await Signal.find({ componentId }).sort({ timestamp: -1 });

  res.json(signals);
});

module.exports = router;