import http from 'k6/http';
import { sleep } from 'k6';
import { K6Reporter, createLoadTestConfig } from '../utils/k6-reporter';

const reporter = new K6Reporter('API Load Test');

// Add custom metrics for API testing
reporter.addCustomMetric('api_errors', 'counter', 'API error count');
reporter.addCustomMetric('user_creation_time', 'trend', 'User creation response time');
reporter.addCustomMetric('login_success_rate', 'rate', 'Login success rate');

// Read thresholds from environment variables (with fallback defaults)
const loginSuccessRateThreshold = __ENV.K6_THRESHOLD_LOGIN_SUCCESS_RATE || 'rate>0.8';
const apiErrorsThreshold = __ENV.K6_THRESHOLD_API_ERRORS || 'count<100';
const userCreationTimeThreshold = __ENV.K6_THRESHOLD_USER_CREATION_TIME || 'p(95)<1200';

const config = {
  ...createLoadTestConfig(
    __ENV.K6_API_BASE_URL || 'https://reqres.in/api',
    [
      { duration: __ENV.K6_API_TEST_DURATION || '2m', target: Number(__ENV.K6_API_TEST_VUS) || 15 },
      { duration: __ENV.K6_API_TEST_STEADY_DURATION || '5m', target: Number(__ENV.K6_API_TEST_VUS_STEADY) || 30 },
      { duration: __ENV.K6_API_TEST_RAMP_DOWN || '2m', target: 0 }
    ],
    {
      'api_errors': [apiErrorsThreshold],
      'user_creation_time': [userCreationTimeThreshold],
      'login_success_rate': [loginSuccessRateThreshold]
    }
  ),
  tags: { testType: 'api', environment: 'test' }
};

export const options = reporter.getTestOptions(config);

export default function () {
  // Test user creation
  const baseUrl = config.baseUrl;
  const createUserResponse = http.post(`${baseUrl}/users`, JSON.stringify({
    name: `testuser_${Math.random()}`,
    job: 'tester'
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'create_user' }
  });

  const userCreationSuccess = reporter.checkPerformance(createUserResponse, {
    expectedStatus: 201,
    maxDuration: 1200
  });

  if (userCreationSuccess) {
    reporter.recordMetric('user_creation_time', createUserResponse.timings.duration);
  } else {
    reporter.recordMetric('api_errors', 1);
  }

  // Test user login
  const loginResponse = http.post(`${baseUrl}/login`, JSON.stringify({
    email: 'eve.holt@reqres.in',
    password: 'cityslicka'
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'login' }
  });

  const loginSuccess = reporter.checkResponse(loginResponse, 200, 'login');
  reporter.recordMetric('login_success_rate', loginSuccess ? 1 : 0);

  // Test list users with pagination
  const listUsersResponse = http.get(`${baseUrl}/users?page=2`, {
    tags: { endpoint: 'list_users' }
  });

  reporter.checkPerformance(listUsersResponse, {
    expectedStatus: 200,
    maxDuration: 500
  });

  // Test get single user
  const getUserResponse = http.get(`${baseUrl}/users/2`, {
    tags: { endpoint: 'get_user' }
  });

  reporter.checkResponse(getUserResponse, 200, 'get_user');

  sleep(Math.random() * 2 + 1);
}
