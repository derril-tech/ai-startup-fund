#!/bin/bash
# Created automatically by Cursor AI (2024-12-19)

set -e

echo "🧪 Running AI Startup Fund Test Suite"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.dev.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Parse command line arguments
TEST_TYPE="all"
VERBOSE=false
COVERAGE=true
PARALLEL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --unit)
            TEST_TYPE="unit"
            shift
            ;;
        --integration)
            TEST_TYPE="integration"
            shift
            ;;
        --e2e)
            TEST_TYPE="e2e"
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --no-coverage)
            COVERAGE=false
            shift
            ;;
        --parallel|-p)
            PARALLEL=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --unit              Run only unit tests"
            echo "  --integration       Run only integration tests"
            echo "  --e2e               Run only end-to-end tests"
            echo "  --verbose, -v       Verbose output"
            echo "  --no-coverage       Disable coverage reporting"
            echo "  --parallel, -p      Run tests in parallel"
            echo "  --help, -h          Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Set up test environment
print_status "Setting up test environment..."

# Create test directories if they don't exist
mkdir -p apps/workers/tests
mkdir -p apps/orchestrator/tests
mkdir -p apps/gateway/tests
mkdir -p apps/frontend/tests

# Function to run Python tests
run_python_tests() {
    local app_dir=$1
    local test_type=$2
    
    print_status "Running $test_type tests for $app_dir..."
    
    cd "$app_dir"
    
    # Set up Python path
    export PYTHONPATH="${PYTHONPATH}:$(pwd)"
    
    # Build pytest command
    local pytest_cmd="pytest"
    
    if [ "$test_type" = "unit" ]; then
        pytest_cmd="$pytest_cmd -m unit"
    elif [ "$test_type" = "integration" ]; then
        pytest_cmd="$pytest_cmd -m integration"
    elif [ "$test_type" = "e2e" ]; then
        pytest_cmd="$pytest_cmd -m e2e"
    fi
    
    if [ "$VERBOSE" = true ]; then
        pytest_cmd="$pytest_cmd -v"
    fi
    
    if [ "$COVERAGE" = true ]; then
        pytest_cmd="$pytest_cmd --cov=. --cov-report=term-missing"
    fi
    
    if [ "$PARALLEL" = true ]; then
        pytest_cmd="$pytest_cmd -n auto"
    fi
    
    # Run tests
    if eval "$pytest_cmd"; then
        print_success "$test_type tests passed for $app_dir"
    else
        print_error "$test_type tests failed for $app_dir"
        return 1
    fi
    
    cd - > /dev/null
}

# Function to run frontend tests
run_frontend_tests() {
    local test_type=$1
    
    print_status "Running $test_type tests for frontend..."
    
    cd apps/frontend
    
    if [ "$test_type" = "unit" ]; then
        # Run Jest unit tests
        if npm test -- --passWithNoTests; then
            print_success "Frontend unit tests passed"
        else
            print_error "Frontend unit tests failed"
            return 1
        fi
    elif [ "$test_type" = "e2e" ]; then
        # Run Playwright E2E tests
        if npx playwright test; then
            print_success "Frontend E2E tests passed"
        else
            print_error "Frontend E2E tests failed"
            return 1
        fi
    fi
    
    cd - > /dev/null
}

# Main test execution
main() {
    local exit_code=0
    
    case $TEST_TYPE in
        "unit")
            print_status "Running unit tests..."
            
            # Python unit tests
            run_python_tests "apps/workers" "unit" || exit_code=1
            run_python_tests "apps/orchestrator" "unit" || exit_code=1
            
            # Frontend unit tests
            run_frontend_tests "unit" || exit_code=1
            ;;
            
        "integration")
            print_status "Running integration tests..."
            
            # Start test services
            print_status "Starting test services..."
            docker-compose -f docker-compose.dev.yml up -d postgres redis nats minio
            
            # Wait for services to be ready
            sleep 10
            
            # Run integration tests
            run_python_tests "apps/workers" "integration" || exit_code=1
            run_python_tests "apps/orchestrator" "integration" || exit_code=1
            
            # Stop test services
            docker-compose -f docker-compose.dev.yml down
            ;;
            
        "e2e")
            print_status "Running end-to-end tests..."
            
            # Start all services
            print_status "Starting all services for E2E tests..."
            docker-compose -f docker-compose.dev.yml up -d
            
            # Wait for services to be ready
            sleep 30
            
            # Run E2E tests
            run_python_tests "apps/workers" "e2e" || exit_code=1
            run_python_tests "apps/orchestrator" "e2e" || exit_code=1
            run_frontend_tests "e2e" || exit_code=1
            
            # Stop services
            docker-compose -f docker-compose.dev.yml down
            ;;
            
        "all")
            print_status "Running all tests..."
            
            # Run unit tests first
            $0 --unit || exit_code=1
            
            # Run integration tests
            $0 --integration || exit_code=1
            
            # Run E2E tests
            $0 --e2e || exit_code=1
            ;;
    esac
    
    return $exit_code
}

# Run main function
if main; then
    print_success "All tests completed successfully! 🎉"
    exit 0
else
    print_error "Some tests failed! ❌"
    exit 1
fi
