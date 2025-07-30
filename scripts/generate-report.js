const fs = require('fs');
const path = require('path');

class K6HTMLReportGenerator {
  constructor() {
    this.reportDir = path.join(__dirname, '../reports');
    this.templateDir = path.join(__dirname, '../templates');
    this.assetsDir = path.join(this.reportDir, 'assets');
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
    if (!fs.existsSync(this.assetsDir)) {
      fs.mkdirSync(this.assetsDir, { recursive: true });
    }
  }

  parseK6Output(outputFile) {
    // This would typically parse K6 JSON output
    // For demo purposes, we'll generate sample data
    return {
      testName: 'K6 Load Test',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 600000).toISOString(),
      duration: 600000,
      summary: {
        http_req_duration: {
          avg: 245.67,
          min: 89.12,
          med: 234.45,
          max: 1234.56,
          p90: 456.78,
          p95: 567.89,
          p99: 890.12
        },
        http_req_failed: {
          rate: 0.034,
          count: 17,
          total: 500
        },
        http_reqs: {
          count: 500,
          rate: 8.33
        },
        vus: {
          value: 50,
          max: 100
        }
      },
      checks: {
        passed: 487,
        failed: 13,
        rate: 0.974
      },
      metrics: [
        { name: 'http_req_duration', type: 'trend', values: this.generateTrendData() },
        { name: 'http_req_failed', type: 'rate', values: this.generateRateData() },
        { name: 'http_reqs', type: 'counter', values: this.generateCounterData() }
      ]
    };
  }

  generateTrendData() {
    const data = [];
    const now = Date.now();
    for (let i = 0; i < 100; i++) {
      data.push({
        timestamp: new Date(now - (100 - i) * 6000),
        value: Math.random() * 500 + 100,
        p95: Math.random() * 700 + 200,
        p99: Math.random() * 1000 + 300
      });
    }
    return data;
  }

  generateRateData() {
    const data = [];
    const now = Date.now();
    for (let i = 0; i < 100; i++) {
      data.push({
        timestamp: new Date(now - (100 - i) * 6000),
        rate: Math.random() * 0.1,
        total: Math.floor(Math.random() * 50) + 10
      });
    }
    return data;
  }

  generateCounterData() {
    const data = [];
    const now = Date.now();
    let cumulative = 0;
    for (let i = 0; i < 100; i++) {
      const increment = Math.floor(Math.random() * 10) + 1;
      cumulative += increment;
      data.push({
        timestamp: new Date(now - (100 - i) * 6000),
        count: cumulative,
        rate: increment / 6 // per second
      });
    }
    return data;
  }

  generateHTML(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>K6 Load Test Report - ${data.testName}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            color: #333;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 300;
        }
        
        .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .nav {
            background: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .nav ul {
            list-style: none;
            display: flex;
            gap: 2rem;
        }
        
        .nav a {
            text-decoration: none;
            color: #667eea;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        .nav a:hover, .nav a.active {
            background: #667eea;
            color: white;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .summary-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }
        
        .summary-card h3 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            padding: 0.3rem 0;
            border-bottom: 1px solid #eee;
        }
        
        .metric:last-child {
            border-bottom: none;
        }
        
        .metric-label {
            font-weight: 500;
            color: #555;
        }
        
        .metric-value {
            font-weight: 600;
            color: #333;
        }
        
        .metric-value.success {
            color: #27ae60;
        }
        
        .metric-value.warning {
            color: #f39c12;
        }
        
        .metric-value.error {
            color: #e74c3c;
        }
        
        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .chart-container {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .chart-container h3 {
            margin-bottom: 1rem;
            color: #333;
            font-size: 1.2rem;
        }
        
        .chart-wrapper {
            position: relative;
            height: 300px;
        }
        
        .details-section {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .details-section h2 {
            color: #667eea;
            margin-bottom: 1.5rem;
            font-size: 1.5rem;
        }
        
        .statistics-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        .statistics-table th,
        .statistics-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .statistics-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .statistics-table tr:hover {
            background: #f8f9fa;
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-success {
            background: #27ae60;
        }
        
        .status-warning {
            background: #f39c12;
        }
        
        .status-error {
            background: #e74c3c;
        }
        
        .footer {
            text-align: center;
            padding: 2rem;
            color: #666;
            border-top: 1px solid #eee;
            margin-top: 3rem;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .nav ul {
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .container {
                padding: 1rem;
            }
            
            .chart-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>K6 Performance Test Report</h1>
        <div class="subtitle">
            ${data.testName} • ${new Date(data.startTime).toLocaleDateString()} ${new Date(data.startTime).toLocaleTimeString()}
        </div>
    </div>
    
    <nav class="nav">
        <ul>
            <li><a href="#overview" class="active">Overview</a></li>
            <li><a href="#charts">Charts</a></li>
            <li><a href="#details">Details</a></li>
            <li><a href="#statistics">Statistics</a></li>
        </ul>
    </nav>
    
    <div class="container">
        <section id="overview">
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Test Information</h3>
                    <div class="metric">
                        <span class="metric-label">Test Name</span>
                        <span class="metric-value">${data.testName}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Start Time</span>
                        <span class="metric-value">${new Date(data.startTime).toLocaleString()}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Duration</span>
                        <span class="metric-value">${Math.round(data.duration / 1000)}s</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Max VUs</span>
                        <span class="metric-value">${data.summary.vus.max}</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <h3>Response Times</h3>
                    <div class="metric">
                        <span class="metric-label">Average</span>
                        <span class="metric-value">${data.summary.http_req_duration.avg.toFixed(2)}ms</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Median</span>
                        <span class="metric-value">${data.summary.http_req_duration.med.toFixed(2)}ms</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">95th Percentile</span>
                        <span class="metric-value ${data.summary.http_req_duration.p95 > 500 ? 'warning' : 'success'}">${data.summary.http_req_duration.p95.toFixed(2)}ms</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">99th Percentile</span>
                        <span class="metric-value ${data.summary.http_req_duration.p99 > 1000 ? 'error' : 'success'}">${data.summary.http_req_duration.p99.toFixed(2)}ms</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <h3>Request Statistics</h3>
                    <div class="metric">
                        <span class="metric-label">Total Requests</span>
                        <span class="metric-value">${data.summary.http_reqs.count}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Requests/sec</span>
                        <span class="metric-value">${data.summary.http_reqs.rate.toFixed(2)}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Failed Requests</span>
                        <span class="metric-value ${data.summary.http_req_failed.rate > 0.05 ? 'error' : 'success'}">${data.summary.http_req_failed.count}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Failure Rate</span>
                        <span class="metric-value ${data.summary.http_req_failed.rate > 0.05 ? 'error' : 'success'}">${(data.summary.http_req_failed.rate * 100).toFixed(2)}%</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <h3>Check Results</h3>
                    <div class="metric">
                        <span class="metric-label">Passed Checks</span>
                        <span class="metric-value success">${data.checks.passed}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Failed Checks</span>
                        <span class="metric-value ${data.checks.failed > 0 ? 'error' : 'success'}">${data.checks.failed}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Success Rate</span>
                        <span class="metric-value ${data.checks.rate < 0.95 ? 'warning' : 'success'}">${(data.checks.rate * 100).toFixed(2)}%</span>
                    </div>
                </div>
            </div>
        </section>
        
        <section id="charts">
            <div class="chart-grid">
                <div class="chart-container">
                    <h3>Response Time Over Time</h3>
                    <div class="chart-wrapper">
                        <canvas id="responseTimeChart"></canvas>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h3>Requests Per Second</h3>
                    <div class="chart-wrapper">
                        <canvas id="requestsChart"></canvas>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h3>Response Time Distribution</h3>
                    <div class="chart-wrapper">
                        <canvas id="distributionChart"></canvas>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h3>Error Rate Over Time</h3>
                    <div class="chart-wrapper">
                        <canvas id="errorRateChart"></canvas>
                    </div>
                </div>
            </div>
        </section>
        
        <section id="details" class="details-section">
            <h2>Detailed Statistics</h2>
            <table class="statistics-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Count</th>
                        <th>Rate</th>
                        <th>Average</th>
                        <th>Min</th>
                        <th>Median</th>
                        <th>Max</th>
                        <th>90th %</th>
                        <th>95th %</th>
                        <th>99th %</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="status-indicator status-success"></span>HTTP Request Duration</td>
                        <td>${data.summary.http_reqs.count}</td>
                        <td>${data.summary.http_reqs.rate.toFixed(2)}/s</td>
                        <td>${data.summary.http_req_duration.avg.toFixed(2)}ms</td>
                        <td>${data.summary.http_req_duration.min.toFixed(2)}ms</td>
                        <td>${data.summary.http_req_duration.med.toFixed(2)}ms</td>
                        <td>${data.summary.http_req_duration.max.toFixed(2)}ms</td>
                        <td>${data.summary.http_req_duration.p90.toFixed(2)}ms</td>
                        <td>${data.summary.http_req_duration.p95.toFixed(2)}ms</td>
                        <td>${data.summary.http_req_duration.p99.toFixed(2)}ms</td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
    
    <div class="footer">
        <p>Report generated by K6 TypeScript Enhanced Reporter • ${new Date().toLocaleString()}</p>
    </div>
    
    <script>
        const data = ${JSON.stringify(data)};
        
        // Response Time Chart
        const ctx1 = document.getElementById('responseTimeChart').getContext('2d');
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: data.metrics[0].values.map(v => new Date(v.timestamp).toLocaleTimeString()),
                datasets: [{
                    label: 'Average Response Time',
                    data: data.metrics[0].values.map(v => v.value),
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.1
                }, {
                    label: '95th Percentile',
                    data: data.metrics[0].values.map(v => v.p95),
                    borderColor: 'rgb(243, 156, 18)',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Response Time (ms)'
                        }
                    }
                }
            }
        });
        
        // Requests Chart
        const ctx2 = document.getElementById('requestsChart').getContext('2d');
        new Chart(ctx2, {
            type: 'line',
            data: {
                labels: data.metrics[2].values.map(v => new Date(v.timestamp).toLocaleTimeString()),
                datasets: [{
                    label: 'Requests/sec',
                    data: data.metrics[2].values.map(v => v.rate),
                    borderColor: 'rgb(39, 174, 96)',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Requests/sec'
                        }
                    }
                }
            }
        });
        
        // Distribution Chart
        const ctx3 = document.getElementById('distributionChart').getContext('2d');
        new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: ['<100ms', '100-200ms', '200-500ms', '500ms-1s', '>1s'],
                datasets: [{
                    label: 'Request Count',
                    data: [45, 123, 234, 78, 20],
                    backgroundColor: [
                        'rgba(39, 174, 96, 0.8)',
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(243, 156, 18, 0.8)',
                        'rgba(230, 126, 34, 0.8)',
                        'rgba(231, 76, 60, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Request Count'
                        }
                    }
                }
            }
        });
        
        // Error Rate Chart
        const ctx4 = document.getElementById('errorRateChart').getContext('2d');
        new Chart(ctx4, {
            type: 'line',
            data: {
                labels: data.metrics[1].values.map(v => new Date(v.timestamp).toLocaleTimeString()),
                datasets: [{
                    label: 'Error Rate %',
                    data: data.metrics[1].values.map(v => v.rate * 100),
                    borderColor: 'rgb(231, 76, 60)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Error Rate (%)'
                        }
                    }
                }
            }
        });
        
        // Navigation
        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const target = link.getAttribute('href').substring(1);
                document.getElementById(target).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    </script>
</body>
</html>`;
  }

  generateReport(outputFile = null) {
    const data = this.parseK6Output(outputFile);
    const html = this.generateHTML(data);
    
    const reportPath = path.join(this.reportDir, 'index.html');
    fs.writeFileSync(reportPath, html);
    
    console.log(`HTML report generated: ${reportPath}`);
    return reportPath;
  }
}

// Generate report when script is run directly
if (require.main === module) {
  const generator = new K6HTMLReportGenerator();
  generator.generateReport();
}

module.exports = K6HTMLReportGenerator;
