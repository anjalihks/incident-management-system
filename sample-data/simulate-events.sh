#!/bin/bash

echo "🚨 Starting Incident Simulation..."

BASE_URL="http://localhost:5000/api/ingest"

# 1️⃣ RDBMS FAILURE (P0)
echo "🔥 RDBMS outage..."
curl -s -X POST $BASE_URL \
-H "Content-Type: application/json" \
-d '{
  "componentId": "RDBMS_PRIMARY_01",
  "severity": "P0",
  "message": "Database connection timeout - primary unreachable"
}'

sleep 2

# 2️⃣ MCP FAILURE (dependent on DB)
echo "⚠️ MCP host failure..."
curl -s -X POST $BASE_URL \
-H "Content-Type: application/json" \
-d '{
  "componentId": "MCP_HOST_01",
  "severity": "P1",
  "message": "Request processing failure due to upstream DB outage"
}'

sleep 2

# 3️⃣ CACHE DEGRADATION
echo "⚠️ Cache latency spike..."
curl -s -X POST $BASE_URL \
-H "Content-Type: application/json" \
-d '{
  "componentId": "CACHE_CLUSTER_01",
  "severity": "P2",
  "message": "Cache miss rate increased due to DB fallback"
}'

sleep 2

# 4️⃣ WORKER QUEUE DELAY
echo "⚠️ Worker backlog..."
curl -s -X POST $BASE_URL \
-H "Content-Type: application/json" \
-d '{
  "componentId": "WORKER_NODE_01",
  "severity": "P3",
  "message": "Job queue delay due to upstream failures"
}'

sleep 2

# 5️⃣ API FAILURE (user impact)
echo "🚨 API degradation..."
curl -s -X POST $BASE_URL \
-H "Content-Type: application/json" \
-d '{
  "componentId": "API_GATEWAY_01",
  "severity": "P1",
  "message": "Increased error rate due to cascading failures"
}'

echo ""
echo "✅ Simulation Complete!"