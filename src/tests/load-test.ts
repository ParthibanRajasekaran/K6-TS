import http from 'k6/http';
import { sleep } from 'k6';
import { K6Reporter, createLoadTestConfig } from '../utils/k6-reporter';

const reporter = new K6Reporter('Load Test');

// Add load-specific metrics
reporter.addCustomMetric('throughput', 'counter', 'Requests throughput');
reporter.addCustomMetric('error_rate', 'rate', 'Error rate percentage');
reporter.addCustomMetric('connection_time', 'trend', 'Connection establishment time');

const config = createLoadTestConfig(
  __ENV.K6_LOAD_BASE_URL || 'https://httpbin.org',
  [
    { duration: '5m', target: 20 },
    { duration: '10m', target: 50 },
    { duration: '5m', target: 20 },
    { duration: '5m', target: 0 }
  ],
  {
    'http_req_duration': ['p(50)<400', 'p(95)<800', 'p(99)<1500'],
    'http_req_failed': ['rate<0.1'],
    'throughput': ['count>300'],
    'error_rate': ['rate<0.1']
  }
);

export const options = reporter.getTestOptions(config);

const endpoints = [
  '/get',
  '/post',
  '/put',
  '/delete',
  '/json',
  '/xml',
  '/html',
  '/delay/1'
];

export default function () {
  // Test different HTTP methods
  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  let response;

  switch (true) {
    case randomEndpoint.includes('/post'):
      response = http.post(`${config.baseUrl}${randomEndpoint}`, JSON.stringify({
        userId: Math.floor(Math.random() * 1000),
        title: `Load test ${Date.now()}`,
        body: 'This is a load test request'
      }), {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'post', method: 'POST' }
      });
      break;
    
    case randomEndpoint.includes('/put'):
      response = http.put(`${config.baseUrl}${randomEndpoint}`, JSON.stringify({
        userId: Math.floor(Math.random() * 1000),
        id: Math.floor(Math.random() * 100),
        title: 'Updated title',
        body: 'Updated body'
      }), {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'put', method: 'PUT' }
      });
      break;
    
    case randomEndpoint.includes('/delete'):
      response = http.del(`${config.baseUrl}${randomEndpoint}`, null, {
        tags: { endpoint: 'delete', method: 'DELETE' }
      });
      break;
    
    default:
      response = http.get(`${config.baseUrl}${randomEndpoint}`, {
        tags: { endpoint: randomEndpoint.replace('/', ''), method: 'GET' }
      });
  }

  // Record metrics
  reporter.recordMetric('throughput', 1);
  reporter.recordMetric('connection_time', response.timings.connecting);

  const success = reporter.checkResponse(response, 200, randomEndpoint);
  reporter.recordMetric('error_rate', success ? 0 : 1);

  // Simulate user think time
  sleep(Math.random() * 3 + 1);
}

export function teardown() {
  // Load test completed. Check the generated HTML report for detailed analysis.
}
