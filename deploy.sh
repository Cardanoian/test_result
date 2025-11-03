#!/bin/bash

# Grade Generator 통합 배포 스크립트 (프론트엔드 + 백엔드)
# 사용법: sudo ./deploy.sh

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
    echo "║     Grade Generator 통합 배포 스크립트              ║"
    echo "║                                                       ║"
    echo "║     Frontend: https://grade.gbeai.net                ║"
    echo "║     Backend:  https://grade-server.gbeai.net         ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Root 권한 확인
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "이 스크립트는 root 권한이 필요합니다. 'sudo ./deploy.sh'로 실행해주세요."
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

# 백엔드 .env 파일 확인
check_backend_env() {
    log_step "백엔드 .env 파일 확인 중..."
    
    if [ ! -f backend/.env ]; then
        log_warning "backend/.env 파일이 없습니다."
        if [ -f backend/.env.example ]; then
            log_info "backend/.env.example을 복사합니다."
            cp backend/.env.example backend/.env
            log_error "backend/.env 파일을 생성했습니다. GOOGLE_API_KEY를 설정한 후 다시 실행해주세요."
            exit 1
        else
            log_error "backend/.env.example 파일도 없습니다."
            exit 1
        fi
    fi
    
    # GOOGLE_API_KEY 확인
    if ! grep -q "GOOGLE_API_KEY=" backend/.env || grep -q "GOOGLE_API_KEY=$" backend/.env; then
        log_error "backend/.env 파일에 GOOGLE_API_KEY가 설정되지 않았습니다."
        exit 1
    fi
    
    log_success "백엔드 .env 파일 확인 완료"
}

# 필요한 디렉토리 생성
create_directories() {
    log_step "필요한 디렉토리 생성 중..."
    
    mkdir -p backend/logs
    
    log_success "디렉토리 생성 완료"
}

# 포트 사용 중인 프로세스 확인 및 정리
check_and_free_ports() {
    log_step "포트 사용 확인 및 정리 중..."
    
    # 포트 80 확인
    if ss -ltn | grep -q ':80 '; then
        log_warning "포트 80이 사용 중입니다."
        
        # 포트 80을 사용하는 모든 Docker 컨테이너 중지
        local containers=$(docker ps --format "{{.ID}} {{.Ports}}" | grep '0.0.0.0:80' | awk '{print $1}')
        if [ -n "$containers" ]; then
            log_info "포트 80을 사용하는 Docker 컨테이너를 중지합니다..."
            echo "$containers" | xargs -r docker stop
            echo "$containers" | xargs -r docker rm
            log_success "포트 80 사용 컨테이너 정리 완료"
            sleep 2
        fi
    fi
    
    # 포트 443 확인
    if ss -ltn | grep -q ':443 '; then
        log_warning "포트 443이 사용 중입니다."
        
        # 포트 443을 사용하는 모든 Docker 컨테이너 중지
        local containers=$(docker ps --format "{{.ID}} {{.Ports}}" | grep '0.0.0.0:443' | awk '{print $1}')
        if [ -n "$containers" ]; then
            log_info "포트 443을 사용하는 Docker 컨테이너를 중지합니다..."
            echo "$containers" | xargs -r docker stop
            echo "$containers" | xargs -r docker rm
            log_success "포트 443 사용 컨테이너 정리 완료"
            sleep 2
        fi
    fi
    
    # 포트 3050 확인
    if ss -ltn | grep -q ':3050 '; then
        log_warning "포트 3050이 사용 중입니다."
        
        # 포트 3050을 사용하는 모든 Docker 컨테이너 중지
        local containers=$(docker ps --format "{{.ID}} {{.Ports}}" | grep '0.0.0.0:3050' | awk '{print $1}')
        if [ -n "$containers" ]; then
            log_info "포트 3050을 사용하는 Docker 컨테이너를 중지합니다..."
            echo "$containers" | xargs -r docker stop
            echo "$containers" | xargs -r docker rm
            log_success "포트 3050 사용 컨테이너 정리 완료"
            sleep 2
        fi
    fi
    
    log_success "포트 정리 완료"
}

# 기존 컨테이너 중지 및 삭제
stop_and_remove_containers() {
    log_step "기존 컨테이너 확인 및 정리 중..."
    
    # 프론트엔드 컨테이너
    if docker ps -a | grep -q "grade-frontend"; then
        log_warning "기존 프론트엔드 컨테이너를 중지하고 삭제합니다..."
        docker stop grade-frontend 2>/dev/null || true
        docker rm grade-frontend 2>/dev/null || true
        log_success "프론트엔드 컨테이너 삭제 완료"
    fi
    
    # 백엔드 컨테이너
    if docker ps -a | grep -q "grade-backend"; then
        log_warning "기존 백엔드 컨테이너를 중지하고 삭제합니다..."
        docker stop grade-backend 2>/dev/null || true
        docker rm grade-backend 2>/dev/null || true
        log_success "백엔드 컨테이너 삭제 완료"
    fi
    
    # docker-compose로 실행된 컨테이너들 정리
    if docker compose ps 2>/dev/null | grep -q "Up\|Exit"; then
        log_warning "Docker Compose 컨테이너들을 중지합니다..."
        docker compose down 2>/dev/null || true
    fi
    
    cd backend
    if docker compose ps 2>/dev/null | grep -q "Up\|Exit"; then
        log_warning "백엔드 Docker Compose 컨테이너들을 중지합니다..."
        docker compose down 2>/dev/null || true
    fi
    cd ..
    
    log_success "기존 컨테이너 정리 완료"
}

# Docker 이미지 삭제
remove_images() {
    log_step "기존 Docker 이미지 삭제 중..."
    
    # 프론트엔드 이미지
    if docker images | grep -q "test_result-frontend\|test_result_frontend"; then
        log_warning "프론트엔드 이미지를 삭제합니다..."
        docker rmi -f $(docker images | grep "test_result-frontend\|test_result_frontend" | awk '{print $3}') 2>/dev/null || true
        log_success "프론트엔드 이미지 삭제 완료"
    fi
    
    # 백엔드 이미지
    if docker images | grep -q "backend-backend\|backend_backend"; then
        log_warning "백엔드 이미지를 삭제합니다..."
        docker rmi -f $(docker images | grep "backend-backend\|backend_backend" | awk '{print $3}') 2>/dev/null || true
        log_success "백엔드 이미지 삭제 완료"
    fi
    
    log_success "Docker 이미지 삭제 완료"
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
    
    docker compose build --no-cache frontend
    docker compose up -d frontend
    
    log_success "프론트엔드 컨테이너 시작 완료"
}

# 백엔드 빌드 및 시작
build_and_start_backend() {
    log_step "백엔드 빌드 및 시작 중..."
    log_info "백엔드 빌드 중... (2-3분 소요 가능)"
    
    cd backend
    docker compose build --no-cache backend
    docker compose up -d backend
    cd ..
    
    log_success "백엔드 컨테이너 시작 완료"
}

# 헬스 체크
health_check() {
    log_step "서비스 헬스 체크 중..."
    
    # 프론트엔드 헬스 체크
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
    
    # 백엔드 헬스 체크
    log_info "백엔드 서버 확인 중..."
    for i in {1..12}; do
        if curl -f http://localhost:3050/health &> /dev/null; then
            log_success "백엔드 서버가 정상적으로 실행 중입니다!"
            break
        fi
        
        if [ $i -eq 12 ]; then
            log_warning "백엔드 서버 헬스 체크 실패 (로그를 확인해주세요)"
        else
            log_info "백엔드 서버 시작 대기 중... ($i/12)"
            sleep 5
        fi
    done
}

# 배포 정보 출력
print_deployment_info() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}║              🎉 배포 완료! 🎉                        ║${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📍 접속 정보:${NC}"
    echo -e "   - 프론트엔드: ${GREEN}https://grade.gbeai.net${NC}"
    echo -e "   - 백엔드 API: ${GREEN}https://grade-server.gbeai.net${NC}"
    echo -e "   - 로컬 프론트엔드: ${GREEN}http://localhost:80${NC}"
    echo -e "   - 로컬 백엔드: ${GREEN}http://localhost:3050${NC}"
    echo ""
    echo -e "${BLUE}🔧 유용한 명령어:${NC}"
    echo -e "   - 전체 로그: ${YELLOW}docker compose logs -f${NC}"
    echo -e "   - 프론트엔드 로그: ${YELLOW}docker compose logs -f frontend${NC}"
    echo -e "   - 백엔드 로그: ${YELLOW}cd backend && docker compose logs -f backend${NC}"
    echo -e "   - 컨테이너 상태: ${YELLOW}docker ps${NC}"
    echo ""
    echo -e "${BLUE}🚀 부분 배포:${NC}"
    echo -e "   - 프론트엔드만: ${YELLOW}sudo ./front.sh${NC}"
    echo -e "   - 백엔드만: ${YELLOW}cd backend && sudo ./back.sh${NC}"
    echo ""
    echo -e "${BLUE}🗑️  전체 삭제:${NC}"
    echo -e "   - 모든 컨테이너/이미지 삭제: ${YELLOW}sudo ./delete.sh${NC}"
    echo ""
}

# 메인 실행 함수
main() {
    print_banner
    
    log_info "통합 배포를 시작합니다..."
    echo ""
    
    check_root
    check_docker
    check_backend_env
    create_directories
    check_and_free_ports
    stop_and_remove_containers
    remove_images
    clean_build_cache
    build_and_start_frontend
    build_and_start_backend
    health_check
    
    print_deployment_info
    
    log_success "모든 배포 과정이 완료되었습니다! 🚀"
}

# 스크립트 실행
main
