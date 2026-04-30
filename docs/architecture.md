# Architecture

The system follows an event-driven architecture:

1. Signals arrive via API
2. Stored temporarily in Redis
3. Worker processes signals
4. Raw signals stored in MongoDB
5. Incidents stored in PostgreSQL
6. UI fetches incidents via REST API

This ensures scalability and resilience.
