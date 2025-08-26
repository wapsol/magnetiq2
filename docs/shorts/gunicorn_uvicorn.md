# Gunicorn & Uvicorn Short

## What They Are
**Gunicorn** (Green Unicorn) and **Uvicorn** are Python WSGI/ASGI servers that serve web applications in production environments.

- **Gunicorn**: A Python WSGI HTTP Server for UNIX, designed to serve traditional synchronous Python web applications (Django, Flask)
- **Uvicorn**: A lightning-fast ASGI server implementation, built for serving asynchronous Python web applications (FastAPI, Starlette)

## Key Differences

| Feature | Gunicorn | Uvicorn |
|---------|----------|---------|
| **Protocol** | WSGI (synchronous) | ASGI (asynchronous) |
| **Performance** | Good for traditional apps | Excellent for async apps |
| **Concurrency** | Process-based | Event-loop based |
| **WebSockets** | No native support | Full support |
| **HTTP/2** | Limited | Full support |

## Common Usage Patterns

### Gunicorn
```bash
# Basic usage
gunicorn app:application

# With workers
gunicorn --workers 4 --bind 0.0.0.0:8000 app:application

# Production configuration
gunicorn --workers 4 --worker-class sync --timeout 120 --bind 0.0.0.0:8000 app:application
```

### Uvicorn
```bash
# Basic usage
uvicorn app:app

# With host and port
uvicorn app:app --host 0.0.0.0 --port 8000

# Production with workers
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

### Hybrid Approach (Best of Both)
```bash
# Using Gunicorn as process manager with Uvicorn workers
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## When to Use Each

### Choose Gunicorn When:
- Running Django, Flask, or other WSGI applications
- Need proven stability and extensive configuration options
- Working with synchronous code primarily
- Require advanced process management features

### Choose Uvicorn When:
- Running FastAPI, Starlette, or other ASGI applications
- Need WebSocket support or HTTP/2
- Working with async/await code
- Want maximum performance for modern Python apps

### Use Gunicorn + Uvicorn When:
- Need both process management AND async capabilities
- Running FastAPI in production (recommended approach)
- Want graceful worker restarts and monitoring

## Production Configuration Examples

### gunicorn.conf.py
```python
bind = "0.0.0.0:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
preload_app = True
timeout = 120
keepalive = 5
```

### uvicorn.json
```json
{
  "app": "app:app",
  "host": "0.0.0.0",
  "port": 8000,
  "workers": 4,
  "log_level": "info",
  "access_log": true
}
```

## Docker Integration
```dockerfile
# Gunicorn + Uvicorn
CMD ["gunicorn", "app:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]

# Pure Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

## Performance Tuning

### Worker Calculation
- **CPU-bound**: workers = (2 × CPU cores) + 1
- **I/O-bound**: workers = (4 × CPU cores) + 1
- **Mixed workload**: Start with CPU cores × 2

### Memory Considerations
- Monitor memory usage per worker
- Use `--max-requests` to prevent memory leaks
- Consider `--preload-app` for memory efficiency

## Why This Matters
Modern Python web applications require robust, scalable server solutions. Gunicorn provides battle-tested process management, while Uvicorn delivers cutting-edge async performance. Understanding both allows you to choose the right tool for your specific needs, or combine them for maximum benefit in production deployments.