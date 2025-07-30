import http from 'k6/http';
import { sleep } from 'k6';
import { K6Reporter, createStressTestConfig } from '../utils/k6-reporter';

const reporter = new K6Reporter('Stress Test');

// Add stress-specific metrics
reporter.addCustomMetric('stress_failures', 'counter', 'Stress test failures');
reporter.addCustomMetric('response_size', 'trend', 'Response payload size');
reporter.addCustomMetric('memory_usage', 'gauge', 'Simulated memory usage');

const config = createStressTestConfig(
  'https://httpbin.org',
  100, // max VUs
  '10m', // stress duration
  {
    'http_req_duration': ['p(95)<2000', 'p(99)<5000'],
    'http_req_failed': ['rate<0.3'],
    'stress_failures': ['count<200']
  }
);

export const options = reporter.getTestOptions(config);

export default function () {
  // Simulate heavy payload requests
  const heavyPayload = {
    data: Array(1000).fill(0).map((_, i) => ({
      id: i,
      timestamp: new Date().toISOString(),
      payload: `stress_test_data_${Math.random()}`
    }))
  };

  const stressResponse = http.post(`${config.baseUrl}/post`, JSON.stringify(heavyPayload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { 
      endpoint: 'stress_test',
      payload_size: 'large'
    }
  });

  const success = reporter.checkPerformance(stressResponse, {
    expectedStatus: 200,
    maxDuration: 2000
  });

  if (!success) {
    reporter.recordMetric('stress_failures', 1);
  }

  // Record response size
  if (stressResponse.body) {
    const bodyLength = typeof stressResponse.body === 'string' 
      ? stressResponse.body.length 
      : stressResponse.body.byteLength;
    reporter.recordMetric('response_size', bodyLength);
  }

  // Simulate memory pressure
  reporter.recordMetric('memory_usage', Math.random() * 100);

  // Multiple concurrent requests to simulate stress
  const concurrentRequests = [
    http.get(`${config.baseUrl}/get?param1=${Math.random()}`),
    http.get(`${config.baseUrl}/delay/1`),
    http.get(`${config.baseUrl}/json`)
  ];

  concurrentRequests.forEach((response, index) => {
    reporter.checkResponse(response, 200, `concurrent_${index}`);
  });

  sleep(0.5 + Math.random() * 1.5);
}
