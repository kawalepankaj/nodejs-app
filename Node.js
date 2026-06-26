const http = require('http');
const client = require('prom-client');

const hostname = '0.0.0.0';
const port = 3000;

/*
===========================================
Prometheus Metrics Configuration
===========================================
*/

// Create a Registry
const register = new client.Registry();

// Collect default Node.js metrics
client.collectDefaultMetrics({
    register
});

// Application Information Metric
const appInfo = new client.Gauge({
    name: 'nodejs_app_info',
    help: 'Application Information',
    labelNames: ['version']
});

appInfo.labels('1.0.0').set(1);

// HTTP Request Counter
const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP Requests',
    labelNames: ['method', 'route', 'status']
});

// HTTP Request Duration
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP Request Duration',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5]
});

/*
===========================================
HTTP Server
===========================================
*/

const server = http.createServer(async (req, res) => {

    const end = httpRequestDuration.startTimer();

    // Prometheus Metrics Endpoint
    if (req.url === '/metrics') {

        res.writeHead(200, {
            'Content-Type': register.contentType
        });

        httpRequestsTotal.inc({
            method: req.method,
            route: req.url,
            status: 200
        });

        end({
            method: req.method,
            route: req.url,
            status: 200
        });

        return res.end(await register.metrics());
    }

    // Health Check Endpoint
    if (req.url === '/health') {

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        httpRequestsTotal.inc({
            method: req.method,
            route: req.url,
            status: 200
        });

        end({
            method: req.method,
            route: req.url,
            status: 200
        });

        return res.end(JSON.stringify({
            status: 'ok'
        }));
    }

    // Default Route
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });

    httpRequestsTotal.inc({
        method: req.method,
        route: req.url,
        status: 200
    });

    end({
        method: req.method,
        route: req.url,
        status: 200
    });

    res.end('Hello World');
});

/*
===========================================
Server Start
===========================================
*/

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log(`Health Endpoint : http://${hostname}:${port}/health`);
    console.log(`Metrics Endpoint: http://${hostname}:${port}/metrics`);
});

/*
===========================================
Graceful Shutdown
===========================================
*/

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
