# Design Decisions

## Why Redis?

Used for buffering and async processing.

## Why MongoDB?

Stores unstructured signal logs.

## Why PostgreSQL?

Transactional consistency for incidents.

## Why Polling UI?

Simple and reliable. WebSockets can be added later.

## Why Strategy Pattern?

Different alert types per component.

## Why State Pattern?

Clean lifecycle management.
