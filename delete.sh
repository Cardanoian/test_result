#!/bin/bash

# Grade Generator Docker 전체 삭제 스크립트
# 사용법: sudo ./delete.sh

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_banner() {
    echo -e "${RED}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║          ⚠️  Grade Generator 전체 삭제 ⚠️           ║"
    echo "║                                                       ║"
    echo "║     모든 컨테이너, 이미지, 볼륨이 삭제됩니다!       ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Root 권한 확인
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "이 스크립트는 root 권한이 필요합니다. 'sudo ./delete.sh'로 실행해주세요."
        exit 1
    fi
}

confirm_deletion() {
    echo ""
    log_warning "이 작업은 다음을 삭제합니다:"
    echo -e "  ${RED}✗${NC} 모든 Grade Generator 컨테이너"
    echo -e "  ${RED}✗${NC} 모든 Grade Generator 이미지"
    echo -e "  ${RED}✗${NC} 모든 Grade Generator 볼륨"
    echo -e "  ${RED}✗${NC} 모든 Grade Generator 네트워크"
    echo -e "  ${RED}✗${NC} nginx 설정 파일 (백업 포함)"
    echo -e "  ${RED}✗${NC} Docker 빌드 캐시"
    echo ""
    echo -e "${YELLOW}주의: SSL 인증서는 삭제하지 않습니다. (필요시 수동 삭제: sudo rm -rf /etc/letsencrypt)${NC}"
    echo ""
    
    read -p "정말로 삭제하시겠습니까? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "삭제가 취소되었습니다."
        exit 0
    fi
}

# nginx 설정 파일 삭제
cleanup_nginx_config() {
    log_info "nginx 설정 파일을 삭제합니다..."
    
    # grade-server.gbeai.net 설정 삭제
    if [ -f /etc/nginx/sites-enabled/grade-server.gbeai.net.conf ]; then
        rm -f /etc/nginx/sites-enabled/grade-server.gbeai.net.conf
        log_success "nginx sites-enabled 링크 삭제 완료"
    fi
    
    if [ -f /etc/nginx/sites-available/grade-server.gbeai.net.conf ]; then
        rm -f /etc/nginx/sites-available/grade-server.gbeai.net.conf
        log_success "nginx sites-available 설정 삭제 완료"
    fi
    
    # 백업 파일들도 삭제
    rm -f /etc/nginx/sites-available/grade-server.gbeai.net.conf.backup.* 2>/dev/null || true
    
    # nginx 재시작 (설정 파일이 삭제되었으므로)
    if systemctl is-active --quiet nginx; then
        log_info "nginx를 재시작합니다..."
        nginx -t 2>/dev/null && systemctl reload nginx || log_warning "nginx 설정 오류 (다른 사이트 설정 확인 필요)"
    fi
    
    log_success "nginx 설정 정리 완료"
}

main() {
    print_banner
    check_root
    confirm_deletion
    
    log_info "Docker 및 nginx 리소스 정리를 시작합니다..."
    echo ""
    
    # Docker Compose 스택 중지
    log_info "Docker Compose 스택을 중지하고 관련 리소스를 삭제합니다..."
    if [ -f docker-compose.yml ]; then
        docker compose down --volumes --remove-orphans 2>/dev/null || true
    fi
    
    if [ -d backend ] && [ -f backend/docker-compose.yml ]; then
        cd backend
        docker compose down --volumes --remove-orphans 2>/dev/null || true
        cd ..
    fi
    
    # 실행 중인 컨테이너 중지
    log_info "모든 실행 중인 Docker 컨테이너를 중지합니다..."
    if [ ! -z "$(docker ps -q)" ]; then
        docker stop $(docker ps -q) 2>/dev/null || true
    fi
    
    # 모든 컨테이너 삭제
    log_info "모든 Docker 컨테이너를 삭제합니다..."
    if [ ! -z "$(docker ps -aq)" ]; then
        docker rm $(docker ps -aq) 2>/dev/null || true
    fi
    
    # 모든 이미지 삭제
    log_info "모든 Docker 이미지를 삭제합니다..."
    if [ ! -z "$(docker images -q)" ]; then
        docker rmi -f $(docker images -q) 2>/dev/null || true
    fi
    
    # 볼륨 정리
    log_info "사용하지 않는 Docker 볼륨을 삭제합니다..."
    docker volume prune -f 2>/dev/null || true
    
    # 네트워크 정리
    log_info "사용하지 않는 Docker 네트워크를 삭제합니다..."
    docker network prune -f 2>/dev/null || true
    
    # 시스템 전체 정리
    log_info "Docker 시스템 전체를 정리합니다 (빌드 캐시, 로그 등)..."
    docker system prune -af 2>/dev/null || true
    
    # nginx 설정 정리
    cleanup_nginx_config
    
    # 프로젝트 빌드 캐시 삭제
    log_info "프로젝트 빌드 캐시를 삭제합니다..."
    rm -rf node_modules 2>/dev/null || true
    rm -rf backend/node_modules 2>/dev/null || true
    rm -rf .next 2>/dev/null || true
    
    # 로그 디렉토리 정리
    log_info "백엔드 로그를 삭제합니다..."
    rm -rf backend/logs/* 2>/dev/null || true
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}║              ✅ 정리 완료! ✅                        ║${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📊 정리된 항목:${NC}"
    echo -e "   ${GREEN}✓${NC} 모든 컨테이너 삭제"
    echo -e "   ${GREEN}✓${NC} 모든 이미지 삭제"
    echo -e "   ${GREEN}✓${NC} 모든 볼륨 삭제"
    echo -e "   ${GREEN}✓${NC} 모든 네트워크 삭제"
    echo -e "   ${GREEN}✓${NC} nginx 설정 파일 삭제"
    echo -e "   ${GREEN}✓${NC} 빌드 캐시 정리"
    echo -e "   ${GREEN}✓${NC} 로그 파일 정리"
    echo ""
    echo -e "${BLUE}⚠️  보존된 항목:${NC}"
    echo -e "   ${YELLOW}•${NC} SSL 인증서 (/etc/letsencrypt/)"
    echo -e "   ${YELLOW}•${NC} 소스 코드"
    echo -e "   ${YELLOW}•${NC} .env 파일"
    echo ""
    echo -e "${BLUE}🚀 재배포:${NC}"
    echo -e "   - 전체 배포: ${YELLOW}sudo ./deploy.sh${NC}"
    echo -e "   - 프론트엔드만: ${YELLOW}sudo ./front.sh${NC}"
    echo -e "   - 백엔드만: ${YELLOW}cd backend && sudo ./back.sh${NC}"
    echo ""
    echo -e "${BLUE}🗑️  SSL 인증서도 삭제하려면:${NC}"
    echo -e "   ${YELLOW}sudo certbot delete --cert-name grade-server.gbeai.net${NC}"
    echo -e "   또는"
    echo -e "   ${YELLOW}sudo rm -rf /etc/letsencrypt${NC}"
    echo ""
    
    log_success "모든 정리 작업이 완료되었습니다! 🗑️"
}

main
