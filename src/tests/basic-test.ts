import http from 'k6/http';
import { sleep } from 'k6';
import { K6Reporter, createLoadTestConfig } from '../utils/k6-reporter';

const reporter = new K6Reporter('Basic Load Test');


const baseUrl = __ENV.K6_BASIC_BASE_URL || 'https://httpbin.org';
const config = {
  ...createLoadTestConfig(
    baseUrl,
    [
      { duration: __ENV.K6_BASIC_TEST_DURATION || '1m', target: Number(__ENV.K6_BASIC_TEST_VUS) || 10 },
      { duration: __ENV.K6_BASIC_TEST_STEADY_DURATION || '3m', target: Number(__ENV.K6_BASIC_TEST_VUS_STEADY) || 20 },
      { duration: __ENV.K6_BASIC_TEST_RAMP_DOWN || '1m', target: 0 }
    ]
  ),
  tags: { testType: 'basic', environment: 'test' }
};

export const options = reporter.getTestOptions(config);

export default function () {
  const baseUrl = config.baseUrl;
  const responses = http.batch([
    ['GET', `${baseUrl}/get`],
    ['GET', `${baseUrl}/delay/1`],
    ['POST', `${baseUrl}/post`, JSON.stringify({ test: 'data' }), {
      headers: { 'Content-Type': 'application/json' }
    }]
  ]);

  responses.forEach((response, index) => {
    const endpoint = ['get', 'delay', 'post'][index];
    reporter.checkResponse(response, 200, endpoint);
  });

  sleep(1);
}
