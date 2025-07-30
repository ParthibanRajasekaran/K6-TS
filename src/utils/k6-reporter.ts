import { Options } from 'k6/options';
import { check } from 'k6';
import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

export interface TestConfig {
  baseUrl: string;
  stages: Array<{ duration: string; target: number }>;
  thresholds: Record<string, string[]>;
  tags: Record<string, string>;
}

export interface MetricsCollector {
  customMetrics: Record<string, any>;
}

export class K6Reporter {
  private metrics: MetricsCollector;
  private startTime: number;
  private testName: string;

  constructor(testName: string) {
    this.testName = testName;
    this.startTime = Date.now();
    this.metrics = {
      customMetrics: {}
    };
  }

  addCustomMetric(name: string, type: 'counter' | 'gauge' | 'rate' | 'trend', description?: string) {
    switch (type) {
      case 'counter':
        this.metrics.customMetrics[name] = new Counter(name);
        break;
      case 'gauge':
        this.metrics.customMetrics[name] = new Gauge(name);
        break;
      case 'rate':
        this.metrics.customMetrics[name] = new Rate(name);
        break;
      case 'trend':
        this.metrics.customMetrics[name] = new Trend(name);
        break;
    }
  }

  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    if (this.metrics.customMetrics[name]) {
      this.metrics.customMetrics[name].add(value, tags);
    }
  }

  createThresholds(config: Partial<TestConfig>): Record<string, string[]> {
    return {
      'http_req_duration': ['p(95)<3000', 'p(99)<5000'],
      'http_req_failed': ['rate<0.1'],
      'http_reqs': ['count>30'],
      'checks': ['rate>0.7'],
      ...config.thresholds
    };
  }

  getTestOptions(config: TestConfig): Options {
    return {
      stages: config.stages,
      thresholds: this.createThresholds(config),
      tags: {
        testName: this.testName,
        timestamp: new Date().toISOString(),
        ...config.tags
      },
      summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    };
  }

  checkResponse(response: any, expectedStatus: number = 200, name?: string): boolean {
    const checks = {
      [`${name || 'request'} status is ${expectedStatus}`]: (r: any) => r.status === expectedStatus,
      [`${name || 'request'} response time < 3000ms`]: (r: any) => r.timings.duration < 3000,
    };

    return check(response, checks);
  }

  checkPerformance(response: any, thresholds: { maxDuration?: number; expectedStatus?: number }): boolean {
    const checks: Record<string, (r: any) => boolean> = {};
    
    if (thresholds.expectedStatus) {
      checks[`status is ${thresholds.expectedStatus}`] = (r) => r.status === thresholds.expectedStatus;
    }
    
    if (thresholds.maxDuration) {
      checks[`response time < ${thresholds.maxDuration}ms`] = (r) => r.timings.duration < thresholds.maxDuration!;
    }

    return check(response, checks);
  }
}


/**
 * Helper to create a K6 test config with custom thresholds and stages.
 * Thresholds can be passed as an argument, or will be loaded from environment variables if not provided.
 *
 * @param baseUrl - The base URL for the test
 * @param stages - Array of stages for the test
 * @param thresholds - (Optional) Thresholds object. If not provided, will use environment variables.
 */
export function createLoadTestConfig(
  baseUrl: string,
  stages: Array<{ duration: string; target: number }>,
  thresholds?: Record<string, string[]>
) {
  // If thresholds not provided, load from environment variables
  const resolvedThresholds = thresholds || {
    http_req_failed: [__ENV.K6_THRESHOLD_ERROR_RATE || 'rate<0.1'],
    http_req_duration: [
      `p(95)<${__ENV.K6_THRESHOLD_P95_DURATION || '3000'}`,
      `p(99)<${__ENV.K6_THRESHOLD_P99_DURATION || '5000'}`
    ],
    checks: [`rate>${1 - (parseFloat(__ENV.K6_THRESHOLD_ERROR_RATE) || 0.3)}`],
  };
  return {
    baseUrl,
    vus: 1,
    duration: '1m',
    thresholds: resolvedThresholds,
    stages,
    env: { BASE_URL: baseUrl },
    insecureSkipTLSVerify: true,
  };
}

export function createStressTestConfig(
  baseUrl: string,
  maxVus: number,
  duration: string,
  customThresholds?: Record<string, string[]>
): TestConfig {
  return {
    baseUrl,
    stages: [
      { duration: '5m', target: Math.floor(maxVus * 0.1) },
      { duration: '10m', target: Math.floor(maxVus * 0.5) },
      { duration: duration, target: maxVus },
      { duration: '5m', target: 0 }
    ],
    thresholds: {
      'http_req_duration': ['p(95)<1000', 'p(99)<2000'],
      'http_req_failed': ['rate<0.2'],
      ...customThresholds
    },
    tags: {
      testType: 'stress',
      environment: 'test'
    }
  };
}
