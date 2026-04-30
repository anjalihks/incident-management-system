const express = require('express');
const router = express.Router();

const { getMetrics } = require('../utils/metrics');

router.get('/', (req, res) => {
  res.json(getMetrics());
});

module.exports = router;