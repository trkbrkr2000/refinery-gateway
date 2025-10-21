# Event Listeners Explained

## What Are Event Listeners?

Event listeners are code that **reacts** to events published on Redis. They enable **automatic workflows** between services.

---

## Current State vs. What We Need

### ✅ What We Have (Publishing)

**refinery-python publishes events:**
```python
# When extraction completes:
await event_bus.emit("document.extracted", {...})

# When parsing completes:
await event_bus.emit("document.spans.ready", {...})

# When indexing completes:
await event_bus.emit("document.indexed", {...})
```

These events **are published to Redis** ✅

---

### ❌ What We're Missing (Listening)

**refinery-api doesn't listen to these events!**

Right now:
```
refinery-python → Publishes "document.extracted" → Redis
                                                      ↓
                                                   (nobody listening!)
```

What we need:
```
refinery-python → Publishes "document.extracted" → Redis
                                                      ↓
                                          refinery-api LISTENS
                                                      ↓
                                          Automatically triggers analysis
```

---

## Example: Full Event Flow (What Should Happen)

### Step 1: User Uploads Document
```typescript
// refinery-api/src/upload/upload.controller.ts
@Post('upload')
async uploadDocument(@UploadedFile() file) {
  // Save to S3
  const documentId = await this.storageService.save(file);

  // Publish event
  await this.redis.publish('document.uploaded', {
    documentId,
    storageUrl: `s3://bucket/${documentId}`
  });
}
```

### Step 2: Python Listens & Extracts
```python
# refinery-python already has this! ✅
# It publishes document.extracted when done
```

### Step 3: API Listens & Analyzes (MISSING!)
```typescript
// refinery-api/src/events/event-listener.service.ts (DOESN'T EXIST YET)
@Injectable()
export class EventListenerService {
  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
    private analysisService: AnalysisService
  ) {}

  async onModuleInit() {
    // Subscribe to events from Python
    await this.redis.subscribe('document.extracted');

    // React to events
    this.redis.on('message', async (channel, message) => {
      if (channel === 'document.extracted') {
        const event = JSON.parse(message);

        // Automatically trigger analysis!
        await this.analysisService.analyze(event.payload.documentId);
      }
    });
  }
}
```

---

## What Events We Need to Listen For

### In refinery-api (NestJS)

| Event | Published By | Should Trigger |
|-------|-------------|----------------|
| `document.extracted` | refinery-python | Start analysis with Groq LLM |
| `document.spans.ready` | refinery-python | Trigger retrieval search |
| `document.indexed` | refinery-python | Continue pipeline |

### In refinery-python (FastAPI)

| Event | Published By | Should Trigger |
|-------|-------------|----------------|
| `document.uploaded` | refinery-api | Start extraction |

---

## Current Redis Module in refinery-api

```typescript
// src/redis/redis.module.ts
// ✅ Has Redis client
// ❌ No event subscribers
// ❌ No message listeners
```

**What it does:**
- Creates Redis connection ✅
- Exports Redis client for other services ✅

**What it doesn't do:**
- Subscribe to channels ❌
- Listen for messages ❌
- React to events ❌

---

## What Needs to Be Added

### 1. Create Event Listener Service

**File:** `refinery-api/src/events/event-listener.service.ts`

```typescript
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';

@Injectable()
export class EventListenerService implements OnModuleInit {
  private subscriber: Redis;

  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {
    // Create separate Redis connection for pub/sub
    this.subscriber = this.redis.duplicate();
  }

  async onModuleInit() {
    console.log('📡 Setting up event listeners...');

    // Subscribe to events
    await this.subscriber.subscribe(
      'document.extracted',
      'document.spans.ready',
      'document.indexed'
    );

    // Handle incoming events
    this.subscriber.on('message', async (channel, message) => {
      console.log(`📩 Received event: ${channel}`);
      const event = JSON.parse(message);

      switch (channel) {
        case 'document.extracted':
          await this.handleDocumentExtracted(event);
          break;

        case 'document.spans.ready':
          await this.handleSpansReady(event);
          break;

        case 'document.indexed':
          await this.handleDocumentIndexed(event);
          break;
      }
    });

    console.log('✅ Event listeners ready');
  }

  private async handleDocumentExtracted(event: any) {
    console.log(`🔄 Handling extraction for: ${event.documentId}`);
    // TODO: Trigger analysis
  }

  private async handleSpansReady(event: any) {
    console.log(`🔄 Handling spans for: ${event.documentId}`);
    // TODO: Trigger retrieval
  }

  private async handleDocumentIndexed(event: any) {
    console.log(`🔄 Handling indexing for: ${event.documentId}`);
    // TODO: Continue pipeline
  }
}
```

### 2. Create Events Module

**File:** `refinery-api/src/events/events.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { EventListenerService } from './event-listener.service';

@Module({
  providers: [EventListenerService],
  exports: [EventListenerService]
})
export class EventsModule {}
```

### 3. Add to App Module

**File:** `refinery-api/src/app.module.ts`

```typescript
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    // ... existing imports
    EventsModule,  // Add this!
  ],
})
export class AppModule {}
```

---

## How to Test Event Listeners

### 1. Watch Redis Events
```bash
redis-cli MONITOR
```

### 2. Trigger Extraction from Python
```bash
curl -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d '{"documentId":"test-123","storageUrl":"s3://test"}'
```

### 3. Check NestJS Logs
You should see:
```
📩 Received event: document.extracted
🔄 Handling extraction for: test-123
```

---

## Why Event Listeners Matter

### Without Event Listeners (Current State)
```
User uploads → API saves to S3 → DONE
                                   ↓
                            (User must manually trigger extraction)
                                   ↓
                            POST /extraction/extract
                                   ↓
                            (User must manually trigger analysis)
                                   ↓
                            POST /analysis/analyze
```

**Problem:** Manual steps, no automation

### With Event Listeners (Target State)
```
User uploads → API saves to S3 → Emits "document.uploaded"
                                           ↓
                                   Python listens → Extracts
                                           ↓
                                   Emits "document.extracted"
                                           ↓
                                   API listens → Analyzes
                                           ↓
                                   Emits "decision.analyzed"
                                           ↓
                                   AUTOMATIC PIPELINE!
```

**Benefit:** Fully automated, event-driven workflow

---

## Summary

**Event Listeners:**
- Code that **subscribes** to Redis channels
- **Reacts** when events are published
- Enables **automatic workflows**

**Current State:**
- ✅ Events are published
- ❌ Nobody is listening

**What's Missing:**
- Event listener service in refinery-api
- Subscription to Python events
- Handler functions to react

**Time to Add:** ~15 minutes

**Files to Create:**
1. `src/events/event-listener.service.ts` (60 lines)
2. `src/events/events.module.ts` (10 lines)
3. Update `app.module.ts` (1 line)

**Once Added:**
- Upload triggers automatic extraction
- Extraction triggers automatic analysis
- Analysis triggers automatic form generation
- **Full pipeline runs automatically!** 🚀

---

Want me to create these files now?
