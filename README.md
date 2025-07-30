# K6 TypeScript Load Testing Project

A comprehensive K6 load testing project with TypeScript support and advanced HTML reporting similar to Gatling reports.

## Features

- 🚀 **TypeScript Support**: Full TypeScript integration with K6
- 📊 **Advanced HTML Reports**: Detailed reports similar to Gatling with interactive charts
- 📈 **Multiple Test Types**: Basic, API, Load, and Stress testing scenarios
- 🎯 **Custom Metrics**: Enhanced monitoring with custom performance metrics
- 📱 **Responsive Design**: Mobile-friendly HTML reports
- ⚡ **Performance Analysis**: Comprehensive performance insights and statistics

## Project Structure

```
k6-ts/
├── src/
│   ├── tests/
│   │   ├── basic-test.ts      # Basic load test
│   │   ├── api-test.ts        # API-focused test
│   │   ├── load-test.ts       # Comprehensive load test
│   │   └── stress-test.ts     # Stress testing
│   └── utils/
│       └── k6-reporter.ts     # Enhanced reporting utilities
├── scripts/
│   └── generate-report.js     # HTML report generator
├── reports/                   # Generated HTML reports
├── dist/                      # Compiled JavaScript files
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- K6 installed globally
- TypeScript knowledge (basic)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install K6 (if not already installed):
```bash
# macOS
brew install k6

# Windows
choco install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Running Tests

Build and run individual tests:

```bash
# Build TypeScript files
npm run build

# Run basic test
npm run test:basic

# Run API test
npm run test:api

# Run load test
npm run test:load

# Run stress test
npm run test:stress

# Run all tests
npm run test:all
```

### Generate HTML Reports

After running tests, generate the detailed HTML report:

```bash
npm run report:generate
```

The report will be available at `reports/index.html`.

## Test Scenarios

### 1. Basic Test (`basic-test.ts`)
- Simple load test with HTTP GET/POST requests
- 10-20 virtual users over 5 minutes
- Tests httpbin.org endpoints

### 2. API Test (`api-test.ts`)
- Comprehensive API testing
- User creation, login, and data retrieval
- Custom metrics for API-specific KPIs
- 15-30 virtual users over 9 minutes

### 3. Load Test (`load-test.ts`)
- Production-like load testing
- Multiple HTTP methods and endpoints
- Realistic user behavior simulation
- 20-50 virtual users over 25 minutes

### 4. Stress Test (`stress-test.ts`)
- High-load stress testing
- Heavy payload requests
- Memory and performance pressure simulation
- Up to 100 virtual users over 20 minutes

## HTML Report Features

The generated HTML reports include:

### 📊 **Interactive Charts**
- Response time trends over time
- Requests per second metrics
- Response time distribution histograms
- Error rate tracking
- Percentile analysis (90th, 95th, 99th)

### 📈 **Comprehensive Statistics**
- **Overall Performance Metrics**:
  - Average, median, min, max response times
  - Request throughput and rate
  - Error rates and failure analysis
  - Virtual user concurrency levels

- **Detailed Breakdowns**:
  - Per-endpoint performance analysis
  - Time-series data visualization
  - Custom metric tracking
  - Threshold compliance reporting

### 🎨 **Professional Design**
- Responsive layout for desktop and mobile
- Modern, clean interface
- Color-coded status indicators
- Intuitive navigation between sections

### 📱 **Report Sections**
1. **Overview**: High-level summary and key metrics
2. **Charts**: Interactive visualizations
3. **Details**: Comprehensive statistics tables
4. **Statistics**: In-depth performance analysis

## Customization

### Adding Custom Metrics

```typescript
// In your test file
const reporter = new K6Reporter('My Custom Test');

// Add custom metrics
reporter.addCustomMetric('custom_duration', 'trend', 'Custom operation duration');
reporter.addCustomMetric('success_rate', 'rate', 'Operation success rate');

// Record metrics
reporter.recordMetric('custom_duration', responseTime);
reporter.recordMetric('success_rate', isSuccess ? 1 : 0);
```

### Modifying Test Configuration

```typescript
const config = createLoadTestConfig(
  'https://your-api.com',
  [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 0 }
  ],
  {
    'http_req_duration': ['p(95)<200', 'p(99)<500'],
    'http_req_failed': ['rate<0.01']
  }
);
```

## Best Practices

1. **Start Small**: Begin with basic tests and gradually increase complexity
2. **Monitor Thresholds**: Set realistic performance thresholds
3. **Use Custom Metrics**: Track business-specific KPIs
4. **Regular Testing**: Integrate into CI/CD pipelines
5. **Analyze Reports**: Review detailed HTML reports after each test

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure TypeScript and dependencies are properly installed
2. **K6 Not Found**: Verify K6 is installed and in PATH
3. **Test Failures**: Check target URLs and network connectivity
4. **Report Generation**: Ensure write permissions for reports directory

### Debug Mode

Run tests with verbose output:
```bash
k6 run --verbose dist/your-test.js
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Resources

- [K6 Documentation](https://k6.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/)

---

**Happy Load Testing! 🚀**
