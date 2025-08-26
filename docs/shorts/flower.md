# Flower: Real-time Celery Monitoring

## What is Flower?

Flower is a web-based monitoring tool for Celery task queues that provides real-time monitoring and administration of Celery clusters. It offers a clean, intuitive web interface to track task execution, worker status, queue lengths, and system performance metrics.

## Key Features

- **Real-time Monitoring**: Live updates of task states, worker status, and queue metrics
- **Task Management**: Inspect, retry, revoke, and manage individual tasks
- **Worker Management**: Monitor worker status, statistics, and resource usage
- **Queue Inspection**: View queue lengths, message routing, and broker statistics
- **Historical Data**: Charts and graphs showing task execution trends over time
- **REST API**: Programmatic access to monitoring data and cluster management
- **Authentication**: Built-in basic auth and OAuth support for secure access

## Usage in Magnetiq2

Flower provides essential visibility into Celery task processing for email notifications, file processing, booking workflows, and scheduled maintenance tasks, enabling proactive monitoring and troubleshooting.

### Project Structure
```
backend/
├── app/
│   ├── celery_app.py          # Celery configuration
│   └── monitoring/
│       ├── flower_config.py   # Flower configuration
│       └── flower_auth.py     # Custom authentication
├── docker-compose.yml         # Flower service definition
└── requirements.txt           # Includes flower dependency
```

### Configuration
```python
# app/monitoring/flower_config.py
from app.config import settings

FLOWER_CONFIG = {
    "broker": settings.CELERY_BROKER_URL,
    "port": 5555,
    "address": "0.0.0.0",
    "basic_auth": [f"{settings.FLOWER_USER}:{settings.FLOWER_PASSWORD}"],
    "url_prefix": "/flower",
    "persistent": True,
    "db": "/opt/flower/flower.db",
    "max_tasks": 10000,
    "auto_refresh": True,
}
```

## Essential Usage Patterns

### Basic Startup
```bash
# Start Flower with default settings
celery -A app.celery_app flower

# Start with custom configuration
celery -A app.celery_app flower \
    --port=5555 \
    --basic_auth=admin:secret \
    --persistent=True
```

### Docker Integration
```yaml
# docker-compose.yml
version: '3.8'
services:
  flower:
    image: mher/flower:latest
    ports:
      - "5555:5555"
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
      - FLOWER_BASIC_AUTH=admin:secret123
      - FLOWER_PORT=5555
    depends_on:
      - redis
      - celery_worker
    command: celery --broker=redis://redis:6379/0 flower --persistent=true
```

### Production Configuration
```python
# app/monitoring/flower_config.py - Production setup
FLOWER_PRODUCTION_CONFIG = {
    "broker": "redis://redis-cluster:6379/0",
    "port": 5555,
    "address": "0.0.0.0",
    "certfile": "/etc/ssl/certs/flower.crt",
    "keyfile": "/etc/ssl/private/flower.key",
    "ca_certs": "/etc/ssl/certs/ca.crt",
    "basic_auth": ["admin:secure_password"],
    "persistent": True,
    "db": "/data/flower/flower.db",
    "max_tasks": 50000,
    "auto_refresh": True,
    "purge_offline_workers": 60,  # Remove offline workers after 60 seconds
}
```

## Key Monitoring Features

### Task Monitoring
```python
# Tasks visible in Flower dashboard:
# - Task UUID, name, arguments, kwargs
# - State (PENDING, STARTED, SUCCESS, FAILURE, RETRY)
# - Execution time, queue time, worker assignment
# - Result data, exception details, traceback

# Example task states in Magnetiq2:
# Email tasks: send_welcome_email, send_booking_confirmation
# Processing: process_webinar_recording, generate_analytics_report
# Maintenance: cleanup_old_sessions, backup_user_data
```

### Worker Statistics
- **Active Workers**: Currently running worker processes
- **Worker Load**: Tasks processed per worker, memory usage
- **Worker Stats**: Task success/failure rates, average execution time
- **Heartbeat Status**: Last seen timestamp, offline detection

### Queue Analysis
- **Queue Lengths**: Number of pending tasks per queue
- **Message Routing**: Which queues tasks are being sent to
- **Broker Stats**: Connection count, memory usage, message rates

## Advanced Features

### Custom Task Filtering
```python
# Filter tasks by state
http://localhost:5555/api/tasks?state=FAILURE

# Filter by worker
http://localhost:5555/api/tasks?workername=worker1@hostname

# Filter by task name
http://localhost:5555/api/tasks?taskname=send_email
```

### REST API Usage
```python
import requests

# Get worker information
response = requests.get("http://localhost:5555/api/workers")
workers = response.json()

# Get task details
task_id = "abc-123-def"
response = requests.get(f"http://localhost:5555/api/task/info/{task_id}")
task_info = response.json()

# Revoke a task
requests.post(f"http://localhost:5555/api/task/revoke/{task_id}")
```

### Custom Authentication
```python
# app/monitoring/flower_auth.py
from flower.utils import gen_task_name
from tornado.web import authenticated

class CustomFlowerAuth:
    def authenticate(self, username, password):
        # Integrate with your existing auth system
        from app.services.auth_service import verify_admin_credentials
        return verify_admin_credentials(username, password)
    
    def get_current_user(self):
        # Return current authenticated user
        return self.get_secure_cookie("user_id")
```

## Production Deployment

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flower
spec:
  replicas: 1
  selector:
    matchLabels:
      app: flower
  template:
    metadata:
      labels:
        app: flower
    spec:
      containers:
      - name: flower
        image: mher/flower:latest
        ports:
        - containerPort: 5555
        env:
        - name: CELERY_BROKER_URL
          value: "redis://redis-service:6379/0"
        - name: FLOWER_BASIC_AUTH
          valueFrom:
            secretKeyRef:
              name: flower-secret
              key: basic_auth
        volumeMounts:
        - name: flower-data
          mountPath: /data
      volumes:
      - name: flower-data
        persistentVolumeClaim:
          claimName: flower-pvc
```

### Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/flower
server {
    listen 80;
    server_name flower.magnetiq2.com;
    
    location / {
        proxy_pass http://localhost:5555;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for real-time updates
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Monitoring Best Practices

### Performance Tuning
```python
# Optimize for large-scale monitoring
FLOWER_CONFIG = {
    "max_tasks": 100000,           # Increase task history
    "purge_offline_workers": 300,  # Clean up offline workers
    "auto_refresh": False,         # Disable auto-refresh for performance
    "enable_events": True,         # Keep event monitoring enabled
    "inspect_timeout": 10000,      # Increase inspection timeout
}
```

### Alerting Integration
```python
# app/monitoring/flower_alerts.py
import requests
from datetime import datetime, timedelta

class FlowerAlerting:
    def __init__(self, flower_url="http://localhost:5555"):
        self.flower_url = flower_url
    
    def check_failed_tasks(self, threshold=10, window_minutes=5):
        """Alert if too many tasks fail in a time window"""
        cutoff = datetime.now() - timedelta(minutes=window_minutes)
        response = requests.get(f"{self.flower_url}/api/tasks?state=FAILURE")
        failed_tasks = response.json()
        
        recent_failures = [
            task for task in failed_tasks.values()
            if datetime.fromisoformat(task['timestamp']) > cutoff
        ]
        
        if len(recent_failures) > threshold:
            self.send_alert(f"High failure rate: {len(recent_failures)} failed tasks")
    
    def check_worker_health(self):
        """Alert if workers are offline"""
        response = requests.get(f"{self.flower_url}/api/workers")
        workers = response.json()
        
        offline_workers = [
            name for name, info in workers.items()
            if not info['status']
        ]
        
        if offline_workers:
            self.send_alert(f"Offline workers detected: {', '.join(offline_workers)}")
```

## Dashboard Views

### Main Dashboard
- **Workers Overview**: Active workers, load distribution, status
- **Tasks Summary**: Total executed, success rate, failure rate
- **Queues Status**: Queue lengths, processing rates
- **Broker Info**: Connection status, message statistics

### Task Details View
- **Task Timeline**: Execution history with timestamps
- **Task Arguments**: Input parameters and configuration
- **Result Data**: Return values, exception details
- **Worker Assignment**: Which worker processed the task

### Worker Details View
- **Resource Usage**: CPU, memory, load averages
- **Task Statistics**: Processed, active, reserved tasks
- **Configuration**: Worker settings, pool information
- **Heartbeat**: Last seen, uptime statistics

## Troubleshooting Common Issues

### High Memory Usage
```python
# Reduce task history retention
FLOWER_CONFIG = {
    "max_tasks": 1000,  # Reduce from default 10000
    "purge_offline_workers": 60,
    "persistent": False,  # Don't persist to disk
}
```

### Slow Dashboard Loading
```bash
# Disable auto-refresh for better performance
celery -A app.celery_app flower --auto_refresh=False --max_tasks=1000
```

### Authentication Issues
```python
# Debug authentication
FLOWER_CONFIG = {
    "basic_auth": ["admin:password"],
    "oauth": {
        "key": "oauth_key",
        "secret": "oauth_secret", 
        "redirect_uri": "http://flower.example.com/login"
    }
}
```

## Integration with Task Queue Stack

For comprehensive task queue monitoring in Magnetiq2, Flower works alongside:
- **[Celery](celery.md)**: The underlying distributed task queue system being monitored
- **[Redis](redis.md)**: Message broker providing queue metrics, task persistence, and real-time data
- **Prometheus/Grafana**: Long-term metrics storage and advanced alerting
- **ELK Stack**: Centralized logging for task execution analysis

## Alternatives

- **Celery Events**: Built-in monitoring via command line (basic)
- **Prometheus + Grafana**: Metrics-based monitoring with custom dashboards
- **New Relic/DataDog**: Commercial APM solutions with Celery integration
- **Custom Dashboard**: Build monitoring into your application directly

Flower's real-time visibility, intuitive interface, and comprehensive task management capabilities make it essential for monitoring Celery-based background processing in production applications like Magnetiq2.