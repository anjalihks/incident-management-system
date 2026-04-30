const express = require("express");
const router = express.Router();

const {
  getAllIncidents,
  addRCA,
  nextState
} = require("../controllers/incident.controller");

// ✅ GET all incidents
router.get("/", getAllIncidents);

// ✅ Add RCA
router.post("/:id/rca", addRCA);

// ✅ Move to next state
router.patch("/:id/next", nextState);

module.exports = router;