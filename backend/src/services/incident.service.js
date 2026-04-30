const pool = require('../config/postgres');

// Create incident
async function createIncidentDB(componentId) {
  const result = await pool.query(
    `INSERT INTO incidents (component_id, status, created_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [componentId, 'OPEN', Date.now()]
  );

  return result.rows[0];
}

// Get active (non-closed) incident
async function getActiveIncident(componentId) {
  const result = await pool.query(
    `SELECT * FROM incidents
     WHERE component_id = $1 AND status != 'CLOSED'
     ORDER BY created_at DESC
     LIMIT 1`,
    [componentId]
  );

  return result.rows[0];
}

// Add RCA (block if CLOSED)
async function addRCA(id, rca) {
  const existing = await pool.query(
    `SELECT * FROM incidents WHERE id = $1`,
    [id]
  );

  if (existing.rows.length === 0) return null;

  const incident = existing.rows[0];

  if (incident.status === 'CLOSED') {
    throw new Error('Cannot modify RCA after incident is CLOSED');
  }

  const result = await pool.query(
    `UPDATE incidents
     SET rca = $1, status = 'RESOLVED'
     WHERE id = $2
     RETURNING *`,
    [rca, id]
  );

  return result.rows[0];
}

// Close incident (require RCA)
async function updateIncidentStatus(id, status) {
  if (status === 'CLOSED') {
    const check = await pool.query(
      `SELECT rca FROM incidents WHERE id = $1`,
      [id]
    );

    if (!check.rows[0] || !check.rows[0].rca) {
      throw new Error('RCA required before closing incident');
    }
  }

  const result = await pool.query(
    `UPDATE incidents
     SET status = $1,
         resolved_at = CASE WHEN $1 = 'CLOSED' THEN $2 ELSE resolved_at END
     WHERE id = $3
     RETURNING *`,
    [status, Date.now(), id]
  );

  return result.rows[0];
}

module.exports = {
  createIncidentDB,
  getActiveIncident,
  addRCA,
  updateIncidentStatus
};