const express = require('express');
const responseTime = require('response-time');
const client = require('prom-client');
const { createLogger, transports } = require("winston");
const LokiTransport = require("winston-loki");
const {doSomeHeavyTask} = require('./utils');

// winston logger that transports logs to grafana loki
const options = {
    transports: [
        new LokiTransport({
            labels: {
                app_name: 'express server'
            },
            host: "http://127.0.0.1:3100"
        })
    ]
};
// logger object ready for usage
const logger = createLogger(options);

const app = express();
// prom client to collect default metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({register: client.register})

// creating a custom histogram to track req, res time of all the route hits and latency
const reqRestime = new client.Histogram({
    name: 'http_express_req_res_time',
    help: 'This tells how much time is taken by req & res',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000]
});

// custom visualization for total requests count
const totalReqCounter = new client.Counter({
    name: 'total_requests_ount',
    help: 'tells how much request have been made'
})

app.use(responseTime((req, res, time) => {
    totalReqCounter.inc();
    reqRestime.labels(req.method, req.url, res.statusCode.toString()).observe(time);
}));

app.get("/", (req, res) => {
    logger.info("hit route /")
    return res.json({status: 'success', message: "hello from express!"});
})

app.get("/slow", async (req, res) => {
    try {
        logger.info("hit route /slow")
        const timeTaken = await doSomeHeavyTask();
        return res.json({message: `heavy task completed in ${timeTaken}ms`})
    } catch (error) {
        logger.error('error in /slow route')
    }
})

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', client.register.contentType)
    const metrics = await client.register.metrics();

    res.send(metrics)
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server listening on port: ${PORT}`);
})