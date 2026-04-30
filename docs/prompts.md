# 🧠 Prompts Used During Development

This file documents actual prompts and questions explored during the development of the Incident Management System.

The goal is not to show perfect answers, but to reflect the **real thought process, confusion, and iteration** involved in building the system.

---

## 🚀 1. Initial System Understanding

**Prompt:**

```
How to design a system that can handle thousands of error signals per second without crashing?
```

**What I realized:**

* Direct DB writes won’t scale
* Need buffering + async processing

---

## ⚡ 2. Choosing Queue Mechanism

**Prompt:**

```
Should I use Redis, Kafka, or something simpler for this assignment?
```

**Thought process:**

* Kafka is powerful but heavy
* Redis Streams gives queue + simplicity

👉 Decided to go with **Redis Streams**

---

## 🧠 3. Worker Confusion (Important Turning Point)

**Prompt:**

```
How does a worker continuously read from Redis streams? Do I need polling or something else?
```

**Issue faced:**

* Didn’t understand `XREADGROUP` initially
* Worker wasn’t consuming messages

**Learning:**

* Use blocking reads (`BLOCK`)
* Use consumer groups for reliability

---

## 🔁 4. Duplicate Incident Problem

**Prompt:**

```
If 100 signals come for same component, how do I avoid creating 100 incidents?
```

**Initial mistake:**

* Created new incident every time ❌

**Fix:**

* Check active incident first
* Reuse existing one

👉 Implemented **debounce logic**

---

## 🔒 5. RCA Validation Logic

**Prompt:**

```
Where should I enforce RCA validation — frontend or backend?
```

**Decision:**

* Backend must enforce it (cannot trust UI)

---

## ⏱️ 6. MTTR Calculation Confusion

**Prompt:**

```
Should MTTR be calculated on frontend or backend?
```

**Thought process:**

* Frontend can be manipulated
* Backend ensures correctness

👉 Implemented in backend

---

## 🐞 7. RCA Submission Bug (Real Debugging)

**Prompt:**

```
Why is RCA failing even when all fields are filled?
```

**Actual issue:**

* datetime-local input looked filled
* but value was empty in state

**Fix:**

* Used controlled inputs
* Added validation

👉 Learned importance of **form state handling**

---

## 🧩 8. Express Route Crash

**Prompt:**

```
TypeError: handler must be a function — what does this mean?
```

**Issue:**

* Controller function was undefined
* Export/import mismatch

👉 Fixed by correcting module exports

---

## 📊 9. Combining Mongo + Postgres Data

**Prompt:**

```
How do I show signal count per incident if signals are in Mongo and incidents in Postgres?
```

**Decision:**

* Do aggregation in backend
* Avoid cross-database joins

---

## 🧪 10. Simulating Real Failures

**Prompt:**

```
How can I simulate real production-like failures instead of dummy data?
```

**Result:**

* Created cascading failure script:

  ```
  RDBMS → MCP → Cache → Worker → API
  ```

---

## 🧱 11. Git Mistakes (Real Issue)

**Prompt:**

```
Why is my frontend folder showing arrow icon in GitHub?
```

**Issue:**

* Nested git repo / submodule

**Fix:**

* Removed inner `.git`
* Reinitialized repo

---

## 📈 12. Performance Thinking

**Prompt:**

```
What happens if 1000 signals hit API at once?
```

**Realization:**

* Need rate limiting + buffering
* Otherwise system crashes

---

## 🎯 Final Reflection

Throughout development, the approach evolved from:

```text
"just make it work"
→ "make it scalable"
→ "make it realistic"
```

Key learnings:

```text
✔ Async processing is essential at scale
✔ Backend validation > frontend validation
✔ Debugging teaches more than coding
✔ Small mistakes (like datetime) can break systems
✔ System design matters more than just features
```

---
