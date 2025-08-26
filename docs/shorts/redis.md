# Redis: In-Memory Data Structure Store

## What is Redis?

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store used as a database, cache, message broker, and streaming engine. It supports various data structures like strings, hashes, lists, sets, and sorted sets, providing sub-millisecond latency for real-time applications.

## Key Features

- **In-Memory Storage**: All data stored in RAM for ultra-fast access
- **Persistence Options**: Optional disk persistence with RDB snapshots and AOF logging
- **Rich Data Types**: Strings, hashes, lists, sets, sorted sets, bitmaps, streams
- **Atomic Operations**: All operations are atomic, ensuring data consistency
- **Pub/Sub Messaging**: Built-in publish-subscribe messaging system
- **Lua Scripting**: Execute custom Lua scripts atomically
- **Clustering**: Built-in support for horizontal scaling across multiple nodes

## Usage in Magnetiq2

Redis serves as the primary cache layer, session store, message broker for Celery, and real-time data store for live features like booking notifications and user activity tracking.

### Project Structure
```
backend/
├── app/
│   ├── core/
│   │   ├── cache.py           # Redis cache utilities
│   │   └── redis_client.py    # Redis connection management
│   ├── services/
│   │   ├── session_service.py # Session management
│   │   └── realtime_service.py # Real-time updates
│   └── config.py              # Redis configuration
└── docker-compose.yml         # Redis service definition
```

### Configuration
```python
# app/core/redis_client.py
import redis.asyncio as redis
from app.config import settings

class RedisManager:
    def __init__(self):
        self.redis_client = None
    
    async def connect(self):
        self.redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20
        )
    
    async def disconnect(self):
        if self.redis_client:
            await self.redis_client.close()

redis_manager = RedisManager()
```

## Essential Usage Patterns

### Caching
```python
# app/core/cache.py
from app.core.redis_client import redis_manager
import json
from typing import Optional, Any

class CacheService:
    def __init__(self):
        self.client = redis_manager.redis_client
    
    async def get(self, key: str) -> Optional[str]:
        return await self.client.get(key)
    
    async def set(self, key: str, value: Any, ttl: int = 3600):
        serialized = json.dumps(value) if not isinstance(value, str) else value
        await self.client.setex(key, ttl, serialized)
    
    async def get_json(self, key: str) -> Optional[dict]:
        data = await self.client.get(key)
        return json.loads(data) if data else None

cache = CacheService()
```

### Session Management
```python
# app/services/session_service.py
from app.core.redis_client import redis_manager
import uuid
import json

class SessionService:
    def __init__(self):
        self.client = redis_manager.redis_client
        self.session_prefix = "session:"
        self.session_ttl = 86400  # 24 hours
    
    async def create_session(self, user_id: int) -> str:
        session_id = str(uuid.uuid4())
        session_data = {
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat()
        }
        
        key = f"{self.session_prefix}{session_id}"
        await self.client.setex(key, self.session_ttl, json.dumps(session_data))
        return session_id
    
    async def get_session(self, session_id: str) -> Optional[dict]:
        key = f"{self.session_prefix}{session_id}"
        data = await self.client.get(key)
        return json.loads(data) if data else None
    
    async def invalidate_session(self, session_id: str):
        key = f"{self.session_prefix}{session_id}"
        await self.client.delete(key)
```

### Real-time Updates with Pub/Sub
```python
# app/services/realtime_service.py
import asyncio
import json

class RealtimeService:
    def __init__(self):
        self.client = redis_manager.redis_client
        self.pubsub = self.client.pubsub()
    
    async def publish_booking_update(self, booking_id: str, status: str):
        message = {
            "type": "booking_update",
            "booking_id": booking_id,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        channel = f"bookings:{booking_id}"
        await self.client.publish(channel, json.dumps(message))
    
    async def subscribe_to_booking(self, booking_id: str):
        channel = f"bookings:{booking_id}"
        await self.pubsub.subscribe(channel)
        
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                yield json.loads(message["data"])

realtime = RealtimeService()
```

## Production Configuration

### Docker Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    
volumes:
  redis_data:
```

### Redis Configuration
```conf
# redis.conf
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1      # Save after 900 sec if at least 1 key changed
save 300 10     # Save after 300 sec if at least 10 keys changed  
save 60 10000   # Save after 60 sec if at least 10000 keys changed

# Enable AOF persistence
appendonly yes
appendfsync everysec

# Security
requirepass your_redis_password
```

## Data Structure Examples

### Strings (Basic Cache)
```python
# User profile caching
await redis_client.setex("user:123:profile", 3600, json.dumps(user_profile))
profile = json.loads(await redis_client.get("user:123:profile") or "{}")
```

### Hashes (Object Storage)
```python
# Store user settings as hash
await redis_client.hset("user:123:settings", mapping={
    "theme": "dark",
    "language": "en",
    "notifications": "true"
})

settings = await redis_client.hgetall("user:123:settings")
```

### Lists (Task Queues)
```python
# Simple task queue
await redis_client.lpush("email_queue", json.dumps(email_task))
task = await redis_client.brpop("email_queue", timeout=30)  # Blocking pop
```

### Sets (Unique Collections)
```python
# Track active users
await redis_client.sadd("active_users", user_id)
active_count = await redis_client.scard("active_users")
is_active = await redis_client.sismember("active_users", user_id)
```

### Sorted Sets (Leaderboards)
```python
# User activity scores
await redis_client.zadd("user_scores", {user_id: score})
top_users = await redis_client.zrevrange("user_scores", 0, 9, withscores=True)
```

## Best Practices

1. **Key Naming Conventions**
   ```python
   # Use consistent, hierarchical naming
   "user:123:profile"
   "session:abc-123"
   "cache:api:users:list"
   "queue:emails:high_priority"
   ```

2. **TTL Management**
   ```python
   # Always set expiration for cache keys
   await redis_client.setex("temp_data", 300, data)  # 5 minutes
   
   # Check TTL to prevent key accumulation
   ttl = await redis_client.ttl("some_key")
   if ttl == -1:  # Key exists but no expiration
       await redis_client.expire("some_key", 3600)
   ```

3. **Connection Pooling**
   ```python
   # Use connection pools for better performance
   redis_client = redis.from_url(
       REDIS_URL,
       max_connections=20,
       retry_on_timeout=True
   )
   ```

4. **Memory Optimization**
   ```python
   # Use appropriate data structures
   # Hash for objects, sets for unique items, strings for simple values
   
   # Compress large values
   import gzip
   compressed = gzip.compress(large_data.encode())
   await redis_client.set("large_key", compressed)
   ```

## Common Patterns

### Distributed Locking
```python
async def acquire_lock(key: str, timeout: int = 10) -> bool:
    lock_key = f"lock:{key}"
    identifier = str(uuid.uuid4())
    
    # Try to acquire lock
    if await redis_client.set(lock_key, identifier, nx=True, ex=timeout):
        return identifier
    return None

async def release_lock(key: str, identifier: str):
    lock_key = f"lock:{key}"
    # Lua script to ensure we only delete our own lock
    script = """
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    """
    await redis_client.eval(script, 1, lock_key, identifier)
```

### Rate Limiting
```python
async def is_rate_limited(user_id: str, limit: int = 100, window: int = 3600) -> bool:
    key = f"rate_limit:{user_id}"
    current = await redis_client.get(key)
    
    if current is None:
        await redis_client.setex(key, window, 1)
        return False
    
    if int(current) >= limit:
        return True
    
    await redis_client.incr(key)
    return False
```

## Monitoring and Debugging

### Redis CLI Commands
```bash
# Connect to Redis
redis-cli -h localhost -p 6379 -a your_password

# Monitor commands
MONITOR

# Get info
INFO memory
INFO stats

# Check slow queries
SLOWLOG GET 10

# Memory usage
MEMORY USAGE key_name
```

### Performance Metrics
```python
# Monitor Redis performance
async def get_redis_stats():
    info = await redis_client.info()
    return {
        "used_memory": info.get("used_memory_human"),
        "connected_clients": info.get("connected_clients"),
        "total_commands_processed": info.get("total_commands_processed"),
        "keyspace_hits": info.get("keyspace_hits"),
        "keyspace_misses": info.get("keyspace_misses")
    }
```

## Performance Optimization

- **Pipeline Operations**: Batch multiple commands for better performance
- **Connection Pooling**: Reuse connections to reduce overhead
- **Appropriate Data Types**: Choose the right data structure for your use case
- **Memory Management**: Set maxmemory and eviction policies
- **Persistence Tuning**: Balance durability vs performance needs

## Alternatives

- **Memcached**: Simpler caching solution, no data structures
- **Amazon ElastiCache**: Managed Redis/Memcached service
- **KeyDB**: High-performance fork of Redis with multi-threading
- **DragonflyDB**: Modern Redis-compatible in-memory store

Redis's versatility, performance, and rich feature set make it indispensable for modern web applications like Magnetiq2, serving as the backbone for caching, session management, real-time features, and background task processing.