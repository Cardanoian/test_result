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
    echo -e "  ${RED}✗${NC} Docker 빌드 캐시"
    echo ""
    
    read -p "정말로 삭제하시겠습니까? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "삭제가 취소되었습니다."
        exit 0
    fi
}

main() {
    print_banner
    check_root
    confirm_deletion
    
    log_info "Docker 리소스 정리를 시작합니다..."
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
    
    # 프로젝트 빌드 캐시 삭제
    log_info "프로젝트 빌드 캐시를 삭제합니다..."
    rm -rf node_modules 2>/dev/null || true
    rm -rf backend/node_modules 2>/dev/null || true
    rm -rf .next 2>/dev/null || true
    
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
    echo -e "   ${GREEN}✓${NC} 빌드 캐시 정리"
    echo ""
    echo -e "${BLUE}🚀 재배포:${NC}"
    echo -e "   - 전체 배포: ${YELLOW}sudo ./deploy.sh${NC}"
    echo -e "   - 프론트엔드만: ${YELLOW}sudo ./front.sh${NC}"
    echo -e "   - 백엔드만: ${YELLOW}cd backend && sudo ./back.sh${NC}"
    echo ""
    
    log_success "모든 정리 작업이 완료되었습니다! 🗑️"
}

main
