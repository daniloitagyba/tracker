#!/bin/bash

# Tracker - Deploy to Fly.io
# Usage: ./scripts/deploy.sh [backend|frontend|all]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_fly_cli() {
  if ! command -v fly &> /dev/null; then
    log_error "Fly CLI not found. Install with: brew install flyctl"
    exit 1
  fi
  log_success "Fly CLI found"
}

check_login() {
  if ! fly auth whoami &> /dev/null; then
    log_warning "Not logged in to Fly.io"
    fly auth login
  fi
  log_success "Logged in to Fly.io"
}

deploy_backend() {
  log_info "Deploying backend..."
  cd "$ROOT_DIR/backend"
  
  # Check if app exists
  if ! fly apps list | grep -q "tracker-backend"; then
    log_info "Creating backend app..."
    fly apps create tracker-backend --org personal
    
    log_info "Creating volume for SQLite..."
    fly volumes create tracker_data --region gru --size 1 -y
    
    log_warning "Please set secrets with:"
    echo "  fly secrets set GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... JWT_SECRET=... JWT_REFRESH_SECRET=... RAPIDAPI_KEY=... FRONTEND_URL=https://tracker-frontend.fly.dev -a tracker-backend"
    read -p "Press Enter after setting secrets to continue..."
  fi
  
  fly deploy
  log_success "Backend deployed: https://tracker-backend.fly.dev"
}

deploy_frontend() {
  log_info "Deploying frontend..."
  cd "$ROOT_DIR/frontend"
  
  # Check if app exists
  if ! fly apps list | grep -q "tracker-frontend"; then
    log_info "Creating frontend app..."
    fly apps create tracker-frontend --org personal
  fi
  
  fly deploy --build-arg VITE_API_URL=https://tracker-backend.fly.dev
  log_success "Frontend deployed: https://tracker-frontend.fly.dev"
}

main() {
  local target="${1:-all}"
  
  log_info "Starting Fly.io deployment..."
  
  check_fly_cli
  check_login
  
  case "$target" in
    backend)
      deploy_backend
      ;;
    frontend)
      deploy_frontend
      ;;
    all)
      deploy_backend
      deploy_frontend
      ;;
    *)
      log_error "Unknown target: $target"
      echo "Usage: $0 [backend|frontend|all]"
      exit 1
      ;;
  esac
  
  echo ""
  log_success "Deployment complete!"
  echo ""
  echo "  Frontend: https://tracker-frontend.fly.dev"
  echo "  Backend:  https://tracker-backend.fly.dev"
  echo "  Health:   https://tracker-backend.fly.dev/health"
}

main "$@"

