#!/bin/bash

# AIgneous MillionWhys - Docker Startup Script
# Manage Docker container lifecycle with simple commands

set -e

# Load PORT from .env if it exists, otherwise default to 8004
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi
PORT=${PORT:-8004}

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker and Docker Compose are installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        echo "Please install Docker from https://docs.docker.com/get-docker/"
        exit 1
    fi

    # Check for Docker Compose V2 (docker compose)
    if docker compose version &> /dev/null 2>&1; then
        DOCKER_COMPOSE="docker compose"
        print_info "Using Docker Compose V2"
    # Check for Docker Compose V1 (docker-compose)
    elif command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
        print_warning "Using Docker Compose V1 (legacy). Consider upgrading to V2."
    else
        print_error "Docker Compose is not installed!"
        echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
        exit 1
    fi
}

# Function to start development mode
start_dev() {
    print_info "Starting development environment..."
    print_info "Mode: Development (hot reload enabled)"
    print_info "Access: http://localhost:${PORT}"

    $DOCKER_COMPOSE up

    print_success "Development server started!"
    print_info "Application available at http://localhost:${PORT}"
}

# Function to build and start standalone production mode (no nginx)
start_standalone() {
    print_info "Building and starting standalone production environment..."
    print_warning "Stopping any running containers..."
    $DOCKER_COMPOSE down 2>/dev/null || true
    $DOCKER_COMPOSE -f docker-compose.standalone.yml down 2>/dev/null || true

    print_info "Building Docker image (this may take a few minutes)..."
    $DOCKER_COMPOSE -f docker-compose.standalone.yml build

    if [ $? -ne 0 ]; then
        print_error "Docker build failed!"
        return 1
    fi

    print_success "Docker image built successfully!"

    print_info "Starting standalone production container..."
    $DOCKER_COMPOSE -f docker-compose.standalone.yml up

    if [ $? -ne 0 ]; then
        print_error "Failed to start container!"
        return 1
    fi

    print_success "Standalone production environment started!"
    print_info "Mode: Standalone Production (no nginx)"
    print_info "Access: http://localhost:${PORT}"
    print_info ""
    print_info "Useful commands:"
    print_info "  - View logs:    $DOCKER_COMPOSE -f docker-compose.standalone.yml logs -f"
    print_info "  - Stop:         $DOCKER_COMPOSE -f docker-compose.standalone.yml down"
    print_info "  - Restart:      $DOCKER_COMPOSE -f docker-compose.standalone.yml restart"
}

# Function to build and start production mode with nginx
start_prod() {
    print_info "Building and starting production environment with nginx..."
    print_warning "Stopping any running containers..."
    $DOCKER_COMPOSE down 2>/dev/null || true
    $DOCKER_COMPOSE -f docker-compose.standalone.yml down 2>/dev/null || true

    print_info "Building Docker image (this may take a few minutes)..."
    $DOCKER_COMPOSE -f docker-compose.prod.yml build

    if [ $? -ne 0 ]; then
        print_error "Docker build failed!"
        return 1
    fi

    print_success "Docker image built successfully!"

    print_info "Starting production container..."
    $DOCKER_COMPOSE -f docker-compose.prod.yml up

    if [ $? -ne 0 ]; then
        print_error "Failed to start container!"
        return 1
    fi

    print_success "Production environment with nginx started!"
    print_info "Mode: Production (with nginx reverse proxy)"
    print_info "Access: https://whys.igneous-ai.com"
    print_info "Direct: http://localhost:${PORT}"
    print_info ""
    print_info "Useful commands:"
    print_info "  - View logs:    $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f"
    print_info "  - Stop:         $DOCKER_COMPOSE -f docker-compose.prod.yml down"
    print_info "  - Restart:      $DOCKER_COMPOSE -f docker-compose.prod.yml restart"
}

# Function to show help
show_help() {
    echo "🚀 AIgneous MillionWhys - Docker Management"
    echo "=========================================="
    echo ""
    echo "Usage: ./docker-start.sh [mode]"
    echo ""
    echo "Available Modes:"
    echo "  dev           Start development environment (default)"
    echo "                - Hot reload enabled"
    echo "                - No nginx dependency"
    echo "                - Access: http://localhost:8004"
    echo ""
    echo "  standalone    Build and start standalone production"
    echo "                - Optimized production build"
    echo "                - No nginx dependency"
    echo "                - Access: http://localhost:8004"
    echo ""
    echo "  prod          Build and start production with nginx"
    echo "                - Optimized production build"
    echo "                - Requires nginx-proxy running"
    echo "                - Access: https://whys.igneous-ai.com"
    echo ""
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker-start.sh dev          # Start dev server (default)"
    echo "  ./docker-start.sh standalone   # Build standalone production"
    echo "  ./docker-start.sh prod         # Build production with nginx"
    echo ""
    echo "Environment Variables:"
    echo "  PORT          Port to run the server (default: 8004)"
    echo "  VIRTUAL_HOST  Domain for nginx proxy (default: whys.igneous-ai.com)"
    echo ""
}

# Main script logic
main() {
    check_docker

    # Default mode is dev
    MODE=${1:-dev}

    case "$MODE" in
        dev|start)
            start_dev
            ;;
        standalone)
            start_standalone
            ;;
        prod|build)
            start_prod
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown mode: $MODE"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
