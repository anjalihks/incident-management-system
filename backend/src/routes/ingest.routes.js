const express = require('express');
const router = express.Router();

const { ingestSignal } = require('../controllers/ingest.controller');

router.post('/ingest', ingestSignal);

module.exports = router;