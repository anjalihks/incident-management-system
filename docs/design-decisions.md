# 🧠 Design Decisions

This document explains key architectural and implementation decisions made while building the IMS system.

---

## 1️⃣ Why Redis Streams?

**Problem:**
Handling high-volume signals without crashing the system.

**Decision:**
Use Redis Streams as a buffer.

**Reason:**

```text
✔ Supports high throughput
✔ Built-in consumer groups
✔ Reliable message processing
✔ Ideal for async pipelines
```

---

## 2️⃣ Why MongoDB for Signals?

**Problem:**
Signals are high-volume and unstructured.

**Decision:**
Store raw signals in MongoDB.

**Reason:**

```text
✔ Flexible schema
✔ High write performance
✔ Ideal for logs/audit data
```

---

## 3️⃣ Why PostgreSQL for Incidents?

**Problem:**
Incident data requires strong consistency.

**Decision:**
Use PostgreSQL.

**Reason:**

```text
✔ ACID transactions
✔ Structured data
✔ Reliable updates (RCA, MTTR)
```

---

## 4️⃣ Why Async Worker?

**Problem:**
Direct processing can block API.

**Decision:**
Introduce worker service.

**Reason:**

```text
✔ Decouples ingestion and processing
✔ Improves performance
✔ Handles load efficiently
```

---

## 5️⃣ Why Debounce Logic?

**Problem:**
Multiple signals for same issue create noise.

**Decision:**
Create only one incident per component.

**Reason:**

```text
✔ Reduces duplication
✔ Improves clarity
✔ Matches real-world systems
```

---

## 6️⃣ Why Mandatory RCA?

**Problem:**
Incidents closed without analysis reduce reliability.

**Decision:**
Enforce RCA before closing.

**Reason:**

```text
✔ Encourages accountability
✔ Improves system learning
✔ Matches SRE practices
```

---

## 7️⃣ Why MTTR Calculation?

**Problem:**
Need measurable performance metric.

**Decision:**
Calculate MTTR automatically.

**Reason:**

```text
✔ Industry-standard metric
✔ Helps track efficiency
✔ Useful for analysis
```

---

## 8️⃣ Why Polling Instead of WebSockets?

**Decision:**
Use polling (every 5 seconds)

**Reason:**

```text
✔ Simpler implementation
✔ Sufficient for assignment
✔ Can upgrade later
```

---

## 9️⃣ Why Rate Limiting?

**Problem:**
Too many requests can crash system.

**Decision:**
Add rate limiter at API layer.

**Reason:**

```text
✔ Prevents abuse
✔ Protects system
✔ Improves stability
```

---

## 🔟 Why Separate DBs?

**Decision:**
MongoDB + PostgreSQL

**Reason:**

```text
✔ Each DB optimized for its use case
✔ Better performance
✔ Clean separation of concerns
```

---

## 📌 Summary

Key principles followed:

```text
✔ Scalability
✔ Reliability
✔ Separation of concerns
✔ Real-world system design
✔ Simplicity with extensibility
```

---

This system is designed not just to work, but to reflect real-world distributed system practices.
