# Backpressure Handling

To handle high-volume signals (10k/sec):

* Redis is used as an in-memory buffer
* API is non-blocking → pushes to Redis
* Worker processes at its own pace
* Prevents database overload
* Ensures system stability under spikes

This decouples ingestion from processing.
