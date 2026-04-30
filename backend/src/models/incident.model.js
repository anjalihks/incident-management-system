const pool = require('../config/postgres');
let incidentColumnCache = null;

async function getIncidentColumns() {
  if (incidentColumnCache) return incidentColumnCache;

  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = 'incidents'`
  );

  incidentColumnCache = new Set(result.rows.map((r) => r.column_name));
  return incidentColumnCache;
}

/**
 * 🔥 Create Incident
 */
async function createIncident(componentId, severity = "P3") {
  const result = await pool.query(
    `INSERT INTO incidents (component_id, severity, status, created_at)
     VALUES ($1, $2, 'OPEN', NOW())
     RETURNING *`,
    [componentId, severity]
  );

  return result.rows[0];
}

/**
 * 🔍 Get Active Incident (IMPORTANT FOR DEBOUNCE)
 */
async function getActiveIncident(componentId) {
  const result = await pool.query(
    `SELECT * FROM incidents
     WHERE component_id = $1
     AND status IN ('OPEN', 'INVESTIGATING', 'RESOLVED')
     ORDER BY created_at DESC
     LIMIT 1`,
    [componentId]
  );

  return result.rows[0];
}

/**
 * 📥 Get All Incidents
 */
async function getAllIncidents() {
  const result = await pool.query(
    `SELECT * FROM incidents ORDER BY created_at DESC`
  );
  return result.rows;
}

/**
 * 🧠 Add RCA + Calculate MTTR
 */
async function addRCA(id, rcaData) {
  const { start_time, end_time, category, fix, prevention } = rcaData;

  const start = new Date(start_time);
  const end = new Date(end_time);
  const mttr = Number(((end - start) / (1000 * 60)).toFixed(2));
  const columns = await getIncidentColumns();

  const rcaPayload = {
    category,
    fix,
    prevention,
    start_time,
    end_time,
    mttr
  };

  const setClauses = ['rca = $1', `status = 'RESOLVED'`];
  const params = [JSON.stringify(rcaPayload)];

  if (columns.has('start_time')) {
    params.push(start);
    setClauses.push(`start_time = $${params.length}`);
  }

  if (columns.has('end_time')) {
    params.push(end);
    setClauses.push(`end_time = $${params.length}`);
  }

  if (columns.has('mttr')) {
    params.push(mttr);
    setClauses.push(`mttr = $${params.length}`);
  }

  params.push(id);

  const result = await pool.query(
    `UPDATE incidents
     SET ${setClauses.join(', ')}
     WHERE id = $${params.length}
     RETURNING *`,
    params
  );

  return result.rows[0];
}

/**
 * 🔁 Update Status (State Machine)
 */
async function updateStatus(id, status) {
  const result = await pool.query(
    `UPDATE incidents
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );

  return result.rows[0];
}

module.exports = {
  createIncident,
  getActiveIncident, // 🔥 FIX ADDED
  getAllIncidents,
  addRCA,
  updateStatus
};