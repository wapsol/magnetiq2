# Celery: Distributed Task Queue for Python

## What is Celery?

Celery is a distributed task queue system for Python that enables asynchronous execution of background tasks. It's designed to handle millions of tasks per minute across multiple machines, making it ideal for processing time-consuming operations outside the request-response cycle of web applications.

## Key Features

- **Distributed Processing**: Execute tasks across multiple workers and machines
- **Task Scheduling**: Built-in cron-like scheduler for periodic tasks
- **Result Backend**: Store and retrieve task results using various backends
- **Monitoring**: Real-time monitoring of tasks and workers
- **Error Handling**: Automatic retries, custom retry policies, and failure notifications
- **Multiple Brokers**: Support for Redis, RabbitMQ, Amazon SQS, and others

## Usage in Magnetiq2

Celery handles background processing for email notifications, file processing, data synchronization, and periodic maintenance tasks without blocking the main FastAPI application.

### Project Structure
```
backend/
├── app/
│   ├── celery_app.py          # Celery configuration
│   ├── tasks/                 # Task definitions
│   │   ├── email_tasks.py     # Email sending tasks
│   │   ├── booking_tasks.py   # Booking processing
│   │   └── maintenance.py     # Scheduled maintenance
│   └── worker.py              # Worker entry point
└── requirements.txt
```

### Configuration
```python
# app/celery_app.py
from celery import Celery

celery_app = Celery(
    "magnetiq2",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["app.tasks.email_tasks", "app.tasks.booking_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "daily-cleanup": {
            "task": "app.tasks.maintenance.cleanup_old_sessions",
            "schedule": 86400.0,  # Daily
        },
    },
)
```

## Essential Usage Patterns

### Task Definition
```python
# app/tasks/email_tasks.py
from app.celery_app import celery_app
from app.core.email import send_email

@celery_app.task(bind=True, max_retries=3)
def send_welcome_email(self, user_email: str, user_name: str):
    try:
        send_email(
            to=user_email,
            subject="Welcome to Magnetiq2",
            template="welcome.html",
            context={"name": user_name}
        )
    except Exception as exc:
        # Retry with exponential backoff
        self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
```

### Task Execution
```python
# In FastAPI endpoints
from app.tasks.email_tasks import send_welcome_email

@app.post("/register")
async def register_user(user_data: UserCreate):
    user = create_user(user_data)
    
    # Execute task asynchronously
    send_welcome_email.delay(user.email, user.name)
    
    return {"message": "User created, welcome email queued"}
```

### Periodic Tasks
```python
# app/tasks/maintenance.py
from app.celery_app import celery_app
from app.models import Session
from datetime import datetime, timedelta

@celery_app.task
def cleanup_old_sessions():
    """Remove expired sessions daily"""
    cutoff = datetime.utcnow() - timedelta(days=7)
    expired_count = Session.query.filter(
        Session.created_at < cutoff
    ).delete()
    return f"Cleaned up {expired_count} expired sessions"
```

## Production Deployment

### Worker Management
```bash
# Start worker processes
celery -A app.celery_app worker --loglevel=info --concurrency=4

# Start beat scheduler (on one machine only)
celery -A app.celery_app beat --loglevel=info

# Monitor tasks
celery -A app.celery_app flower
```

### Docker Configuration
```dockerfile
# Worker container
FROM python:3.11
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["celery", "-A", "app.celery_app", "worker", "--loglevel=info"]

# Beat scheduler container
FROM python:3.11
COPY . /app
WORKDIR /app  
RUN pip install -r requirements.txt
CMD ["celery", "-A", "app.celery_app", "beat", "--loglevel=info"]
```

## Best Practices

1. **Task Idempotency**
   ```python
   @celery_app.task
   def process_payment(payment_id: str):
       payment = Payment.get_by_id(payment_id)
       if payment.status == "processed":
           return "Already processed"  # Idempotent
       # Process payment...
   ```

2. **Proper Error Handling**
   ```python
   @celery_app.task(bind=True, autoretry_for=(ConnectionError,), retry_kwargs={"max_retries": 5})
   def api_call_task(self, data):
       try:
           return make_api_call(data)
       except ValidationError:
           # Don't retry validation errors
           raise self.retry(exc=None)
   ```

3. **Resource Management**
   ```python
   # Limit concurrent tasks per worker
   @celery_app.task(rate_limit="10/m")
   def rate_limited_task():
       pass
   ```

4. **Result Management**
   ```python
   # Set result expiration to prevent memory buildup
   @celery_app.task(result_expires=3600)  # 1 hour
   def temporary_result_task():
       return {"data": "expires_in_1_hour"}
   ```

## Common Patterns

### Chain Tasks
```python
from celery import chain

# Execute tasks in sequence
workflow = chain(
    validate_data.s(data),
    process_data.s(),
    send_notification.s()
)
workflow.apply_async()
```

### Group Tasks
```python
from celery import group

# Execute tasks in parallel
parallel_jobs = group(
    process_file.s(file1),
    process_file.s(file2),
    process_file.s(file3)
)
result = parallel_jobs.apply_async()
```

## Monitoring and Debugging

### Flower Web Interface
```bash
pip install flower
celery -A app.celery_app flower --port=5555
# Access at http://localhost:5555
```

### Task Inspection
```python
# Check task status
from app.celery_app import celery_app

result = send_email.delay("user@example.com", "Welcome!")
print(result.status)  # PENDING, SUCCESS, FAILURE, etc.
print(result.result)  # Task return value or exception
```

## Performance Optimization

- **Worker Concurrency**: Adjust based on workload (CPU vs I/O bound)
- **Prefork Pool**: Best for CPU-intensive tasks
- **Gevent Pool**: Ideal for I/O-bound tasks
- **Task Routing**: Route different task types to specialized workers
- **Result Backend Cleanup**: Regularly clean old results to prevent memory issues

## Alternatives

- **RQ (Redis Queue)**: Simpler Redis-based task queue for smaller projects
- **Dramatiq**: Modern alternative with better ergonomics
- **Apache Airflow**: Complex workflow orchestration (overkill for simple tasks)
- **AWS SQS + Lambda**: Cloud-native serverless task processing

Celery's maturity, flexibility, and extensive ecosystem make it the go-to choice for distributed task processing in Python applications like Magnetiq2, especially when handling complex workflows and requiring robust monitoring capabilities.