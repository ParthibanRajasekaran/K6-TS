#!/bin/bash

# K6 TypeScript Test Runner with HTML Report Generation
# This script runs K6 tests and generates comprehensive HTML reports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="basic"
DURATION="30s"
VUS="5"
OUTPUT_DIR="reports"
GENERATE_REPORT=true

# Function to print colored output
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to show usage
show_help() {
    echo "K6 TypeScript Test Runner"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --test TYPE        Test type: basic, api, load, stress (default: basic)"
    echo "  -d, --duration TIME    Test duration (default: 30s)"
    echo "  -v, --vus NUMBER       Number of virtual users (default: 5)"
    echo "  -o, --output DIR       Output directory for reports (default: reports)"
    echo "  -n, --no-report        Skip HTML report generation"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                              # Run basic test with default settings"
    echo "  $0 -t load -d 5m -v 20         # Run load test for 5 minutes with 20 VUs"
    echo "  $0 -t stress -d 10m -v 50 -n   # Run stress test without HTML report"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--test)
            TEST_TYPE="$2"
            shift 2
            ;;
        -d|--duration)
            DURATION="$2"
            shift 2
            ;;
        -v|--vus)
            VUS="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -n|--no-report)
            GENERATE_REPORT=false
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate test type
case $TEST_TYPE in
    basic|api|load|stress)
        ;;
    *)
        print_message $RED "Error: Invalid test type '$TEST_TYPE'. Valid types: basic, api, load, stress"
        exit 1
        ;;
esac

print_message $BLUE "🚀 K6 TypeScript Test Runner"
print_message $BLUE "================================="
print_message $YELLOW "Test Type: $TEST_TYPE"
print_message $YELLOW "Duration: $DURATION"
print_message $YELLOW "Virtual Users: $VUS"
print_message $YELLOW "Output Directory: $OUTPUT_DIR"
print_message $YELLOW "Generate HTML Report: $GENERATE_REPORT"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Build TypeScript files
print_message $BLUE "📦 Building TypeScript files..."
npm run build

if [ $? -ne 0 ]; then
    print_message $RED "❌ Build failed!"
    exit 1
fi

print_message $GREEN "✅ Build completed successfully"

# Run the K6 test
print_message $BLUE "🧪 Running K6 test..."

RESULTS_FILE="$OUTPUT_DIR/results-$(date +%Y%m%d-%H%M%S).json"
SUMMARY_FILE="$OUTPUT_DIR/summary-$(date +%Y%m%d-%H%M%S).json"

k6 run \
    --duration="$DURATION" \
    --vus="$VUS" \
    --out="json=$RESULTS_FILE" \
    --summary-export="$SUMMARY_FILE" \
    --summary-trend-stats="avg,min,med,max,p(90),p(95),p(99)" \
    "dist/${TEST_TYPE}-test.js"

K6_EXIT_CODE=$?

if [ $K6_EXIT_CODE -eq 0 ]; then
    print_message $GREEN "✅ Test completed successfully"
elif [ $K6_EXIT_CODE -eq 99 ]; then
    print_message $YELLOW "⚠️  Test completed with threshold violations"
else
    print_message $RED "❌ Test failed with exit code $K6_EXIT_CODE"
fi

# Generate HTML report if requested
if [ "$GENERATE_REPORT" = true ]; then
    print_message $BLUE "📊 Generating HTML report..."
    
    # Update the report generator to use the actual results
    node -e "
        const K6HTMLReportGenerator = require('./scripts/generate-report.js');
        const fs = require('fs');
        
        const generator = new K6HTMLReportGenerator();
        
        // Try to read actual K6 results if available
        let summaryData = null;
        try {
            if (fs.existsSync('$SUMMARY_FILE')) {
                summaryData = JSON.parse(fs.readFileSync('$SUMMARY_FILE', 'utf8'));
            }
        } catch (e) {
            console.log('Using sample data for report generation');
        }
        
        const reportPath = generator.generateReport('$RESULTS_FILE', summaryData);
        console.log('HTML report generated: ' + reportPath);
    "
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "✅ HTML report generated successfully"
        print_message $BLUE "📋 Report available at: $OUTPUT_DIR/index.html"
        
        # Try to open the report in the default browser (macOS)
        if command -v open &> /dev/null; then
            print_message $YELLOW "🌐 Opening report in browser..."
            open "$OUTPUT_DIR/index.html"
        fi
    else
        print_message $RED "❌ Failed to generate HTML report"
    fi
fi

print_message $BLUE "🎉 Test execution completed!"
print_message $BLUE "Results saved to: $RESULTS_FILE"
if [ "$GENERATE_REPORT" = true ]; then
    print_message $BLUE "HTML report: $OUTPUT_DIR/index.html"
fi

exit $K6_EXIT_CODE
