# 🏗️ System Architecture

## Overview

The Incident Management System (IMS) follows an **event-driven, distributed architecture** designed to handle high-throughput signal ingestion and reliable incident processing.

---

## 🔁 High-Level Flow

```text
Signal Producer → Ingestion API → Redis Stream → Worker → Storage → UI
```

---

## 🧩 Components

### 1. Ingestion API (Node.js + Express)

* Receives incoming signals
* Applies **rate limiting**
* Pushes signals to Redis stream
* Acts as the system entry point

---

### 2. Redis Streams (Buffer Layer)

* Acts as **message queue**
* Handles burst traffic (backpressure)
* Decouples ingestion from processing
* Ensures reliability via consumer groups

---

### 3. Worker Service (Async Processor)

* Consumes signals using `XREADGROUP`
* Processes signals asynchronously
* Implements:

  * Debounce logic
  * Incident creation
  * Alert strategy

---

### 4. MongoDB (Raw Signal Store)

* Stores high-volume signal payloads
* Used as audit/log system
* Optimized for write-heavy workloads

---

### 5. PostgreSQL (Source of Truth)

* Stores:

  * Incidents
  * RCA data
  * MTTR
* Ensures transactional consistency

---

### 6. React Dashboard (Frontend)

* Displays:

  * Live incidents
  * Incident details
  * RCA form
* Polls backend for updates

---

## 🧠 Data Flow

1. Signal received → API
2. API pushes to Redis
3. Worker consumes signal
4. Checks existing incident (debounce)
5. Stores:

   * Signal → MongoDB
   * Incident → PostgreSQL
6. UI fetches processed data

---

## 🎯 Key Design Principles

```text
✔ Decoupling (API vs Worker)
✔ Event-driven processing
✔ Separation of concerns
✔ Fault tolerance
✔ Scalability
```

---

## 🚀 Why This Architecture?

| Problem             | Solution          |
| ------------------- | ----------------- |
| High signal volume  | Redis buffering   |
| DB overload         | Async worker      |
| Duplicate incidents | Debounce logic    |
| Data separation     | Mongo + Postgres  |
| UI performance      | Polling / caching |

---

## 📌 Summary

This architecture ensures:

* Scalability under heavy load
* Reliable async processing
* Clean separation of responsibilities
* Real-world production readiness
