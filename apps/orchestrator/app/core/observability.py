# Created automatically by Cursor AI (2024-12-19)

import os
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from contextlib import contextmanager
import time
import traceback

# OpenTelemetry imports
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader, ConsoleMetricExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.exporter.prometheus import PrometheusExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter

# Prometheus imports
from prometheus_client import Counter, Histogram, Gauge, Summary, generate_latest, CONTENT_TYPE_LATEST
from prometheus_client.registry import CollectorRegistry

# Sentry imports
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration

# Custom metrics and tracing
class ObservabilityManager:
    """Centralized observability management for the application"""
    
    def __init__(self):
        self.tracer = None
        self.meter = None
        self.registry = CollectorRegistry()
        self._setup_tracing()
        self._setup_metrics()
        self._setup_sentry()
        self._setup_custom_metrics()
    
    def _setup_tracing(self):
        """Initialize OpenTelemetry tracing"""
        # Create tracer provider
        trace_provider = TracerProvider()
        
        # Add span processors
        if os.getenv('OTEL_EXPORTER_JAEGER_ENDPOINT'):
            # Jaeger exporter for distributed tracing
            jaeger_exporter = JaegerExporter(
                endpoint=os.getenv('OTEL_EXPORTER_JAEGER_ENDPOINT')
            )
            trace_provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
        elif os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT'):
            # OTLP exporter for cloud observability platforms
            otlp_exporter = OTLPSpanExporter(
                endpoint=os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT')
            )
            trace_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
        else:
            # Console exporter for development
            trace_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
        
        # Set global tracer provider
        trace.set_tracer_provider(trace_provider)
        self.tracer = trace.get_tracer(__name__)
    
    def _setup_metrics(self):
        """Initialize OpenTelemetry metrics"""
        # Create meter provider
        if os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT'):
            # OTLP metric exporter
            metric_reader = PeriodicExportingMetricReader(
                OTLPMetricExporter(endpoint=os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT'))
            )
        else:
            # Console metric exporter for development
            metric_reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
        
        meter_provider = MeterProvider(metric_reader=metric_reader)
        metrics.set_meter_provider(meter_provider)
        self.meter = metrics.get_meter(__name__)
    
    def _setup_sentry(self):
        """Initialize Sentry for error tracking"""
        sentry_dsn = os.getenv('SENTRY_DSN')
        if sentry_dsn:
            sentry_sdk.init(
                dsn=sentry_dsn,
                environment=os.getenv('ENVIRONMENT', 'development'),
                integrations=[
                    FastApiIntegration(),
                    SqlalchemyIntegration(),
                    RedisIntegration(),
                ],
                traces_sample_rate=float(os.getenv('SENTRY_TRACES_SAMPLE_RATE', '0.1')),
                profiles_sample_rate=float(os.getenv('SENTRY_PROFILES_SAMPLE_RATE', '0.1')),
            )
    
    def _setup_custom_metrics(self):
        """Setup custom Prometheus metrics"""
        # Request metrics
        self.request_counter = Counter(
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'endpoint', 'status'],
            registry=self.registry
        )
        
        self.request_duration = Histogram(
            'http_request_duration_seconds',
            'HTTP request duration',
            ['method', 'endpoint'],
            registry=self.registry
        )
        
        # Business metrics
        self.pitch_ingest_counter = Counter(
            'pitch_ingest_total',
            'Total pitch ingestions',
            ['status', 'file_type'],
            registry=self.registry
        )
        
        self.valuation_counter = Counter(
            'valuation_calculations_total',
            'Total valuation calculations',
            ['method', 'status'],
            registry=self.registry
        )
        
        self.panel_simulation_counter = Counter(
            'panel_simulations_total',
            'Total panel simulations',
            ['status'],
            registry=self.registry
        )
        
        self.export_counter = Counter(
            'exports_total',
            'Total exports generated',
            ['type', 'status'],
            registry=self.registry
        )
        
        # System metrics
        self.active_connections = Gauge(
            'active_database_connections',
            'Number of active database connections',
            registry=self.registry
        )
        
        self.celery_queue_size = Gauge(
            'celery_queue_size',
            'Number of tasks in Celery queue',
            ['queue_name'],
            registry=self.registry
        )
        
        self.memory_usage = Gauge(
            'memory_usage_bytes',
            'Memory usage in bytes',
            registry=self.registry
        )
    
    def instrument_fastapi(self, app):
        """Instrument FastAPI application with OpenTelemetry"""
        FastAPIInstrumentor.instrument_app(app)
        HTTPXClientInstrumentor().instrument()
    
    def instrument_sqlalchemy(self, engine):
        """Instrument SQLAlchemy with OpenTelemetry"""
        SQLAlchemyInstrumentor().instrument(engine=engine)
    
    def instrument_redis(self, redis_client):
        """Instrument Redis with OpenTelemetry"""
        RedisInstrumentor().instrument(redis_client=redis_client)
    
    @contextmanager
    def trace_span(self, name: str, attributes: Optional[Dict[str, Any]] = None):
        """Context manager for creating spans"""
        if self.tracer:
            with self.tracer.start_as_current_span(name, attributes=attributes or {}) as span:
                try:
                    yield span
                except Exception as e:
                    span.record_exception(e)
                    span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
                    raise
    
    def record_metric(self, metric_name: str, value: float, labels: Optional[Dict[str, str]] = None):
        """Record a custom metric"""
        if self.meter:
            counter = self.meter.create_counter(metric_name)
            counter.add(value, labels or {})
    
    def increment_counter(self, counter_name: str, labels: Optional[Dict[str, str]] = None):
        """Increment a Prometheus counter"""
        counter_map = {
            'http_requests': self.request_counter,
            'pitch_ingest': self.pitch_ingest_counter,
            'valuation': self.valuation_counter,
            'panel_simulation': self.panel_simulation_counter,
            'export': self.export_counter,
        }
        
        if counter_name in counter_map:
            counter = counter_map[counter_name]
            if labels:
                counter.labels(**labels).inc()
            else:
                counter.inc()
    
    def observe_histogram(self, histogram_name: str, value: float, labels: Optional[Dict[str, str]] = None):
        """Observe a value in a Prometheus histogram"""
        histogram_map = {
            'http_request_duration': self.request_duration,
        }
        
        if histogram_name in histogram_map:
            histogram = histogram_map[histogram_name]
            if labels:
                histogram.labels(**labels).observe(value)
            else:
                histogram.observe(value)
    
    def set_gauge(self, gauge_name: str, value: float, labels: Optional[Dict[str, str]] = None):
        """Set a Prometheus gauge value"""
        gauge_map = {
            'active_connections': self.active_connections,
            'celery_queue_size': self.celery_queue_size,
            'memory_usage': self.memory_usage,
        }
        
        if gauge_name in gauge_map:
            gauge = gauge_map[gauge_name]
            if labels:
                gauge.labels(**labels).set(value)
            else:
                gauge.set(value)
    
    def capture_exception(self, exception: Exception, context: Optional[Dict[str, Any]] = None):
        """Capture exception in Sentry with additional context"""
        if context:
            sentry_sdk.set_context("custom", context)
        sentry_sdk.capture_exception(exception)
    
    def capture_message(self, message: str, level: str = "info", context: Optional[Dict[str, Any]] = None):
        """Capture message in Sentry"""
        if context:
            sentry_sdk.set_context("custom", context)
        sentry_sdk.capture_message(message, level=level)
    
    def get_metrics(self):
        """Get Prometheus metrics as string"""
        return generate_latest(self.registry)
    
    def get_metrics_content_type(self):
        """Get content type for Prometheus metrics"""
        return CONTENT_TYPE_LATEST

# Global observability instance
observability = ObservabilityManager()

# Decorators for easy instrumentation
def trace_function(name: str, attributes: Optional[Dict[str, Any]] = None):
    """Decorator to trace function execution"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            with observability.trace_span(name, attributes):
                return func(*args, **kwargs)
        return wrapper
    return decorator

def monitor_performance(operation: str):
    """Decorator to monitor function performance"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                observability.increment_counter('operation_success', {'operation': operation})
                return result
            except Exception as e:
                observability.increment_counter('operation_error', {'operation': operation})
                observability.capture_exception(e, {'operation': operation})
                raise
            finally:
                duration = time.time() - start_time
                observability.observe_histogram('operation_duration', duration, {'operation': operation})
        return wrapper
    return decorator

# Middleware for FastAPI
class ObservabilityMiddleware:
    """FastAPI middleware for observability"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            start_time = time.time()
            method = scope.get("method", "UNKNOWN")
            path = scope.get("path", "/")
            
            # Create span for request
            with observability.trace_span(f"{method} {path}", {
                "http.method": method,
                "http.path": path,
                "http.host": scope.get("headers", {}).get(b"host", b"").decode(),
            }):
                try:
                    await self.app(scope, receive, send)
                    
                    # Record success metrics
                    status = 200  # Default success status
                    observability.increment_counter('http_requests', {
                        'method': method,
                        'endpoint': path,
                        'status': str(status)
                    })
                    
                except Exception as e:
                    # Record error metrics
                    status = 500
                    observability.increment_counter('http_requests', {
                        'method': method,
                        'endpoint': path,
                        'status': str(status)
                    })
                    observability.capture_exception(e, {
                        'method': method,
                        'path': path
                    })
                    raise
                finally:
                    # Record duration
                    duration = time.time() - start_time
                    observability.observe_histogram('http_request_duration', duration, {
                        'method': method,
                        'endpoint': path
                    })
        else:
            await self.app(scope, receive, send)

# Health check endpoint for metrics
async def get_metrics():
    """Endpoint to expose Prometheus metrics"""
    return observability.get_metrics()

# System monitoring functions
def update_system_metrics():
    """Update system-level metrics"""
    import psutil
    
    # Memory usage
    memory = psutil.virtual_memory()
    observability.set_gauge('memory_usage', memory.used)
    
    # CPU usage
    cpu_percent = psutil.cpu_percent()
    observability.set_gauge('cpu_usage_percent', cpu_percent)
    
    # Disk usage
    disk = psutil.disk_usage('/')
    observability.set_gauge('disk_usage_bytes', disk.used)

def update_database_metrics(engine):
    """Update database connection metrics"""
    try:
        # Get active connections (simplified)
        with engine.connect() as conn:
            result = conn.execute("SELECT count(*) FROM pg_stat_activity WHERE state = 'active'")
            active_connections = result.scalar()
            observability.set_gauge('active_connections', active_connections)
    except Exception as e:
        logging.error(f"Failed to update database metrics: {e}")

def update_celery_metrics(celery_app):
    """Update Celery queue metrics"""
    try:
        inspector = celery_app.control.inspect()
        active_tasks = inspector.active()
        reserved_tasks = inspector.reserved()
        
        if active_tasks:
            for worker, tasks in active_tasks.items():
                observability.set_gauge('celery_active_tasks', len(tasks), {'worker': worker})
        
        if reserved_tasks:
            for worker, tasks in reserved_tasks.items():
                observability.set_gauge('celery_reserved_tasks', len(tasks), {'worker': worker})
                
    except Exception as e:
        logging.error(f"Failed to update Celery metrics: {e}")

# Logging configuration
def setup_logging():
    """Setup structured logging with correlation IDs"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('app.log')
        ]
    )
    
    # Add correlation ID to log records
    class CorrelationFilter(logging.Filter):
        def filter(self, record):
            record.correlation_id = getattr(trace.get_current_span(), 'get_span_context', lambda: None)()
            return True
    
    logging.getLogger().addFilter(CorrelationFilter())
