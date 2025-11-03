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

# 백엔드 배포 스크립트 실행
deploy_backend() {
    log_step "===================================================="
    log_step "백엔드 배포 시작 (nginx + SSL + Docker)"
    log_step "===================================================="
    echo ""
    
    if [ ! -f backend/back.sh ]; then
        log_error "backend/back.sh 파일을 찾을 수 없습니다."
        exit 1
    fi
    
    # back.sh가 이미 모든 작업을 수행합니다:
    # - nginx 설치 및 설정
    # - SSL 인증서 발급
    # - 자동 갱신 설정
    # - 백엔드 Docker 빌드 및 시작
    cd backend
    ./back.sh
    cd ..
    
    echo ""
    log_success "백엔드 배포 완료!"
    echo ""
}

# 프론트엔드 배포 스크립트 실행
deploy_frontend() {
    log_step "===================================================="
    log_step "프론트엔드 배포 시작"
    log_step "===================================================="
    echo ""
    
    if [ ! -f front.sh ]; then
        log_error "front.sh 파일을 찾을 수 없습니다."
        exit 1
    fi
    
    # front.sh가 모든 프론트엔드 배포 작업을 수행합니다
    ./front.sh
    
    echo ""
    log_success "프론트엔드 배포 완료!"
    echo ""
}

# 배포 정보 출력
print_deployment_info() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}║              🎉 통합 배포 완료! 🎉                   ║${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📍 접속 정보:${NC}"
    echo -e "   - 프론트엔드: ${GREEN}https://grade.gbeai.net${NC}"
    echo -e "   - 백엔드 API: ${GREEN}https://grade-server.gbeai.net${NC}"
    echo -e "   - 로컬 프론트엔드: ${GREEN}http://localhost:80${NC}"
    echo -e "   - 로컬 백엔드: ${GREEN}http://localhost:3050${NC}"
    echo ""
    echo -e "${BLUE}🔒 SSL 인증서:${NC}"
    echo -e "   - 백엔드 자동 갱신: ${GREEN}활성화${NC}"
    echo -e "   - 갱신 주기: ${GREEN}매일 2회 확인${NC}"
    echo ""
    echo -e "${BLUE}🔧 유용한 명령어:${NC}"
    echo -e "   - 전체 로그: ${YELLOW}docker compose logs -f${NC}"
    echo -e "   - 프론트엔드 로그: ${YELLOW}docker compose logs -f frontend${NC}"
    echo -e "   - 백엔드 로그: ${YELLOW}cd backend && docker compose logs -f backend${NC}"
    echo -e "   - nginx 로그: ${YELLOW}tail -f /var/log/nginx/backend-error.log${NC}"
    echo -e "   - 컨테이너 상태: ${YELLOW}docker ps${NC}"
    echo -e "   - nginx 상태: ${YELLOW}systemctl status nginx${NC}"
    echo -e "   - SSL 인증서 상태: ${YELLOW}certbot certificates${NC}"
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
    
    # 백엔드 먼저 배포 (nginx + SSL + Docker)
    deploy_backend
    
    # 프론트엔드 배포
    deploy_frontend
    
    print_deployment_info
    
    log_success "모든 배포 과정이 완료되었습니다! 🚀"
}

# 스크립트 실행
main
