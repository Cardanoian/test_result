#!/bin/bash

# Grade Generator 프론트엔드 배포 스크립트
# 사용법: sudo ./front.sh

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${MAGENTA}[STEP]${NC} $1"
}

# 배너 출력
print_banner() {
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║     Grade Generator 프론트엔드 배포 스크립트        ║"
    echo "║                                                       ║"
    echo "║     Frontend: https://grade.gbeai.net                ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Root 권한 확인
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "이 스크립트는 root 권한이 필요합니다. 'sudo ./front.sh'로 실행해주세요."
        exit 1
    fi
    log_success "Root 권한 확인 완료"
}

# Docker 설치 확인
check_docker() {
    log_step "Docker 설치 확인 중..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되어 있지 않습니다. Docker를 먼저 설치해주세요."
        exit 1
    fi
    log_success "Docker가 설치되어 있습니다. ($(docker --version))"
    
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose가 설치되어 있지 않습니다."
        exit 1
    fi
    log_success "Docker Compose가 설치되어 있습니다."
}

# 기존 프론트엔드 컨테이너 중지 및 삭제
stop_and_remove_frontend() {
    log_step "기존 프론트엔드 컨테이너 확인 및 정리 중..."
    
    # 프론트엔드 컨테이너
    if docker ps -a | grep -q "grade-frontend"; then
        log_warning "기존 프론트엔드 컨테이너를 중지하고 삭제합니다..."
        docker stop grade-frontend 2>/dev/null || true
        docker rm grade-frontend 2>/dev/null || true
        log_success "프론트엔드 컨테이너 삭제 완료"
    else
        log_info "실행 중인 프론트엔드 컨테이너가 없습니다."
    fi
    
    # docker-compose로 실행된 프론트엔드 컨테이너 정리
    if docker compose ps | grep -q "frontend"; then
        log_warning "Docker Compose 프론트엔드 컨테이너를 중지합니다..."
        docker compose stop frontend 2>/dev/null || true
        docker compose rm -f frontend 2>/dev/null || true
    fi
    
    log_success "기존 프론트엔드 컨테이너 정리 완료"
}

# 프론트엔드 이미지 삭제
remove_frontend_image() {
    log_step "기존 프론트엔드 Docker 이미지 삭제 중..."
    
    if docker images | grep -q "test_result-frontend\|test_result_frontend"; then
        log_warning "프론트엔드 이미지를 삭제합니다..."
        docker rmi -f $(docker images | grep "test_result-frontend\|test_result_frontend" | awk '{print $3}') 2>/dev/null || true
        log_success "프론트엔드 이미지 삭제 완료"
    else
        log_info "삭제할 프론트엔드 이미지가 없습니다."
    fi
}

# Docker 빌드 캐시 정리
clean_build_cache() {
    log_step "Docker 빌드 캐시 정리 중..."
    
    docker builder prune -af 2>/dev/null || true
    
    log_success "빌드 캐시 정리 완료"
}

# 프론트엔드 빌드 및 시작
build_and_start_frontend() {
    log_step "프론트엔드 빌드 및 시작 중..."
    log_info "프론트엔드 빌드 중... (5-10분 소요 가능)"
    log_warning "백엔드는 영향받지 않습니다."
    
    docker compose build --no-cache frontend
    docker compose up -d frontend
    
    log_success "프론트엔드 컨테이너 시작 완료"
}

# 헬스 체크
health_check() {
    log_step "프론트엔드 서비스 헬스 체크 중..."
    
    log_info "프론트엔드 서버 확인 중..."
    for i in {1..12}; do
        if curl -f http://localhost:80 &> /dev/null; then
            log_success "프론트엔드 서버가 정상적으로 실행 중입니다!"
            break
        fi
        
        if [ $i -eq 12 ]; then
            log_warning "프론트엔드 서버 헬스 체크 실패 (로그를 확인해주세요)"
        else
            log_info "프론트엔드 서버 시작 대기 중... ($i/12)"
            sleep 5
        fi
    done
}

# 배포 정보 출력
print_deployment_info() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}║         🎉 프론트엔드 배포 완료! 🎉                 ║${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📍 접속 정보:${NC}"
    echo -e "   - 프론트엔드: ${GREEN}https://grade.gbeai.net${NC}"
    echo -e "   - 로컬 프론트엔드: ${GREEN}http://localhost:80${NC}"
    echo ""
    echo -e "${BLUE}🔧 유용한 명령어:${NC}"
    echo -e "   - 프론트엔드 로그: ${YELLOW}docker compose logs -f frontend${NC}"
    echo -e "   - 컨테이너 상태: ${YELLOW}docker ps${NC}"
    echo -e "   - 컨테이너 재시작: ${YELLOW}docker compose restart frontend${NC}"
    echo ""
}

# 메인 실행 함수
main() {
    print_banner
    
    log_info "프론트엔드 배포를 시작합니다..."
    echo ""
    
    check_root
    check_docker
    stop_and_remove_frontend
    remove_frontend_image
    clean_build_cache
    build_and_start_frontend
    health_check
    
    print_deployment_info
    
    log_success "프론트엔드 배포가 완료되었습니다! 🚀"
}

# 스크립트 실행
main
