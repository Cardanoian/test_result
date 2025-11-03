#!/bin/bash

# Grade Generator 백엔드 배포 스크립트
# 사용법: cd backend && sudo ./back.sh

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# 도메인 설정
DOMAIN="grade-server.gbeai.net"
EMAIL="gbeai@sc.gyo6.net"  # SSL 인증서용 이메일 (사용자가 수정 필요)

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
    echo "║     Grade Generator 백엔드 배포 스크립트            ║"
    echo "║                                                       ║"
    echo "║     Backend: https://grade-server.gbeai.net          ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Root 권한 확인
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "이 스크립트는 root 권한이 필요합니다. 'sudo ./back.sh'로 실행해주세요."
        exit 1
    fi
    log_success "Root 권한 확인 완료"
}

# nginx 설치 확인 및 설치
check_and_install_nginx() {
    log_step "nginx 확인 중..."
    
    if ! command -v nginx &> /dev/null; then
        log_warning "nginx가 설치되어 있지 않습니다. 설치를 시작합니다..."
        apt-get update
        apt-get install -y nginx
        log_success "nginx 설치 완료"
    else
        log_success "nginx가 이미 설치되어 있습니다. ($(nginx -v 2>&1))"
    fi
    
    # nginx 서비스 활성화
    systemctl enable nginx
}

# certbot 설치 확인 및 설치
check_and_install_certbot() {
    log_step "certbot 확인 중..."
    
    if ! command -v certbot &> /dev/null; then
        log_warning "certbot이 설치되어 있지 않습니다. 설치를 시작합니다..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
        log_success "certbot 설치 완료"
    else
        log_success "certbot이 이미 설치되어 있습니다. ($(certbot --version))"
    fi
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

# .env 파일 확인
check_env_file() {
    log_step ".env 파일 확인 중..."
    
    if [ ! -f .env ]; then
        log_warning ".env 파일이 없습니다."
        if [ -f .env.example ]; then
            log_info ".env.example을 복사합니다."
            cp .env.example .env
            log_error ".env 파일을 생성했습니다. GOOGLE_API_KEY를 설정한 후 다시 실행해주세요."
            exit 1
        else
            log_error ".env.example 파일도 없습니다."
            exit 1
        fi
    fi
    
    # GOOGLE_API_KEY 확인
    if ! grep -q "GOOGLE_API_KEY=" .env || grep -q "GOOGLE_API_KEY=$" .env; then
        log_error ".env 파일에 GOOGLE_API_KEY가 설정되지 않았습니다."
        exit 1
    fi
    
    log_success ".env 파일 확인 완료"
}

# 필요한 디렉토리 생성
create_directories() {
    log_step "필요한 디렉토리 생성 중..."
    
    mkdir -p logs
    mkdir -p /var/www/certbot
    
    log_success "디렉토리 생성 완료"
}

# nginx 설정 파일 배포
deploy_nginx_config() {
    log_step "nginx 설정 파일 배포 중..."
    
    # nginx 설정 파일이 있는지 확인
    if [ ! -f "nginx/${DOMAIN}.conf" ]; then
        log_error "nginx/${DOMAIN}.conf 파일이 없습니다!"
        exit 1
    fi
    
    # 기존 설정 파일 백업
    if [ -f "/etc/nginx/sites-available/${DOMAIN}.conf" ]; then
        log_warning "기존 설정 파일을 백업합니다..."
        cp "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-available/${DOMAIN}.conf.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # 새 설정 파일 복사
    cp "nginx/${DOMAIN}.conf" "/etc/nginx/sites-available/${DOMAIN}.conf"
    
    # 심볼릭 링크 생성
    if [ ! -L "/etc/nginx/sites-enabled/${DOMAIN}.conf" ]; then
        ln -sf "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
    fi
    
    log_success "nginx 설정 파일 배포 완료"
}

# SSL 인증서 확인 및 발급
setup_ssl_certificate() {
    log_step "SSL 인증서 확인 중..."
    
    if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
        log_success "SSL 인증서가 이미 존재합니다."
        
        # 인증서 만료일 확인
        EXPIRY_DATE=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" | cut -d= -f2)
        EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
        CURRENT_EPOCH=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
        
        log_info "인증서 만료까지 ${DAYS_LEFT}일 남았습니다."
        
        if [ $DAYS_LEFT -lt 30 ]; then
            log_warning "인증서 갱신을 권장합니다."
            read -p "지금 갱신하시겠습니까? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                certbot renew --nginx
                log_success "인증서 갱신 완료"
            fi
        fi
    else
        log_warning "SSL 인증서가 없습니다. 발급을 시작합니다..."
        
        # 이메일 확인
        if [ "$EMAIL" = "your-email@example.com" ]; then
            log_error "스크립트 상단의 EMAIL 변수를 실제 이메일 주소로 변경해주세요."
            exit 1
        fi
        
        # 임시 HTTP 설정으로 nginx 설정 변경
        log_info "임시 HTTP 설정으로 변경 중..."
        
        # HTTPS 블록 임시 주석 처리
        sed -i.bak '/server {/,/listen 443/s/^/#/' "/etc/nginx/sites-available/${DOMAIN}.conf"
        sed -i '/listen 443/,/^}/s/^/#/' "/etc/nginx/sites-available/${DOMAIN}.conf"
        
        # nginx 설정 테스트
        if ! nginx -t; then
            log_error "nginx 설정 테스트 실패"
            mv "/etc/nginx/sites-available/${DOMAIN}.conf.bak" "/etc/nginx/sites-available/${DOMAIN}.conf"
            exit 1
        fi
        
        # nginx 재시작
        systemctl restart nginx
        log_info "임시 HTTP 서버 시작 완료"
        
        # certbot으로 인증서 발급
        log_info "SSL 인증서 발급 중... (도메인: ${DOMAIN})"
        
        if certbot certonly --nginx -d "${DOMAIN}" --email "${EMAIL}" --agree-tos --no-eff-email; then
            log_success "SSL 인증서 발급 완료"
            
            # 원래 설정으로 복원
            mv "/etc/nginx/sites-available/${DOMAIN}.conf.bak" "/etc/nginx/sites-available/${DOMAIN}.conf"
            
            # nginx 설정 테스트
            if ! nginx -t; then
                log_error "nginx 설정 테스트 실패"
                exit 1
            fi
            
            log_success "HTTPS 설정 복원 완료"
        else
            log_error "SSL 인증서 발급 실패"
            mv "/etc/nginx/sites-available/${DOMAIN}.conf.bak" "/etc/nginx/sites-available/${DOMAIN}.conf"
            exit 1
        fi
    fi
}

# 자동 갱신 설정
setup_auto_renewal() {
    log_step "SSL 인증서 자동 갱신 설정 중..."
    
    # certbot timer 확인
    if systemctl is-active --quiet certbot.timer; then
        log_success "certbot 자동 갱신 타이머가 이미 활성화되어 있습니다."
    else
        log_info "certbot 자동 갱신 타이머를 활성화합니다..."
        systemctl enable certbot.timer
        systemctl start certbot.timer
        log_success "자동 갱신 타이머 활성화 완료"
    fi
    
    # renewal hook 설정
    HOOK_DIR="/etc/letsencrypt/renewal-hooks/deploy"
    mkdir -p "$HOOK_DIR"
    
    cat > "$HOOK_DIR/reload-nginx.sh" << 'EOF'
#!/bin/bash
systemctl reload nginx
EOF
    
    chmod +x "$HOOK_DIR/reload-nginx.sh"
    log_success "nginx reload hook 설정 완료"
    
    log_info "다음 갱신 시간: $(systemctl list-timers certbot.timer | grep certbot.timer | awk '{print $1, $2}')"
}

# nginx 시작 및 확인
start_nginx() {
    log_step "nginx 시작 중..."
    
    # nginx 설정 테스트
    if ! nginx -t; then
        log_error "nginx 설정 테스트 실패"
        exit 1
    fi
    
    # nginx 재시작
    systemctl restart nginx
    
    # nginx 상태 확인
    if systemctl is-active --quiet nginx; then
        log_success "nginx가 정상적으로 실행 중입니다."
    else
        log_error "nginx 시작 실패"
        systemctl status nginx
        exit 1
    fi
}

# 기존 백엔드 컨테이너 중지 및 삭제
stop_and_remove_backend() {
    log_step "기존 백엔드 컨테이너 확인 및 정리 중..."
    
    # 백엔드 컨테이너
    if docker ps -a | grep -q "grade-backend"; then
        log_warning "기존 백엔드 컨테이너를 중지하고 삭제합니다..."
        docker stop grade-backend 2>/dev/null || true
        docker rm grade-backend 2>/dev/null || true
        log_success "백엔드 컨테이너 삭제 완료"
    else
        log_info "실행 중인 백엔드 컨테이너가 없습니다."
    fi
    
    # docker-compose로 실행된 백엔드 컨테이너 정리
    if docker compose ps | grep -q "backend"; then
        log_warning "Docker Compose 백엔드 컨테이너를 중지합니다..."
        docker compose stop backend 2>/dev/null || true
        docker compose rm -f backend 2>/dev/null || true
    fi
    
    log_success "기존 백엔드 컨테이너 정리 완료"
}

# 백엔드 이미지 삭제
remove_backend_image() {
    log_step "기존 백엔드 Docker 이미지 삭제 중..."
    
    if docker images | grep -q "backend-backend\|backend_backend"; then
        log_warning "백엔드 이미지를 삭제합니다..."
        docker rmi -f $(docker images | grep "backend-backend\|backend_backend" | awk '{print $3}') 2>/dev/null || true
        log_success "백엔드 이미지 삭제 완료"
    else
        log_info "삭제할 백엔드 이미지가 없습니다."
    fi
}

# Docker 빌드 캐시 정리
clean_build_cache() {
    log_step "Docker 빌드 캐시 정리 중..."
    
    docker builder prune -af 2>/dev/null || true
    
    log_success "빌드 캐시 정리 완료"
}

# 백엔드 빌드 및 시작
build_and_start_backend() {
    log_step "백엔드 빌드 및 시작 중..."
    log_info "백엔드 빌드 중... (2-3분 소요 가능)"
    
    docker compose build --no-cache backend
    docker compose up -d backend
    
    log_success "백엔드 컨테이너 시작 완료"
}

# 헬스 체크
health_check() {
    log_step "백엔드 서비스 헬스 체크 중..."
    
    # 로컬 백엔드 확인
    log_info "로컬 백엔드 서버 확인 중..."
    for i in {1..12}; do
        if curl -f http://localhost:3050/health &> /dev/null; then
            log_success "로컬 백엔드 서버가 정상적으로 실행 중입니다!"
            break
        fi
        
        if [ $i -eq 12 ]; then
            log_warning "로컬 백엔드 서버 헬스 체크 실패"
        else
            log_info "백엔드 서버 시작 대기 중... ($i/12)"
            sleep 5
        fi
    done
    
    # HTTPS 접속 확인
    log_info "HTTPS 접속 확인 중..."
    sleep 2
    if curl -f -k https://${DOMAIN}/health &> /dev/null; then
        log_success "HTTPS 접속이 정상적으로 작동합니다!"
    else
        log_warning "HTTPS 접속 확인 실패 (nginx 로그를 확인하세요)"
    fi
}

# 배포 정보 출력
print_deployment_info() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}║          🎉 백엔드 배포 완료! 🎉                    ║${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📍 접속 정보:${NC}"
    echo -e "   - 백엔드 API: ${GREEN}https://${DOMAIN}${NC}"
    echo -e "   - 로컬 백엔드: ${GREEN}http://localhost:3050${NC}"
    echo -e "   - 헬스 체크: ${GREEN}http://localhost:3050/health${NC}"
    echo ""
    echo -e "${BLUE}🔒 SSL 인증서:${NC}"
    echo -e "   - 자동 갱신: ${GREEN}활성화${NC}"
    echo -e "   - 갱신 주기: ${GREEN}매일 2회 확인${NC}"
    echo ""
    echo -e "${BLUE}🔧 유용한 명령어:${NC}"
    echo -e "   - 백엔드 로그: ${YELLOW}docker compose logs -f backend${NC}"
    echo -e "   - nginx 로그: ${YELLOW}tail -f /var/log/nginx/backend-error.log${NC}"
    echo -e "   - 컨테이너 상태: ${YELLOW}docker ps${NC}"
    echo -e "   - nginx 상태: ${YELLOW}systemctl status nginx${NC}"
    echo -e "   - SSL 인증서 상태: ${YELLOW}certbot certificates${NC}"
    echo ""
}

# 메인 실행 함수
main() {
    print_banner
    
    log_info "백엔드 배포를 시작합니다..."
    echo ""
    
    check_root
    check_and_install_nginx
    check_and_install_certbot
    check_docker
    check_env_file
    create_directories
    deploy_nginx_config
    setup_ssl_certificate
    setup_auto_renewal
    start_nginx
    stop_and_remove_backend
    remove_backend_image
    clean_build_cache
    build_and_start_backend
    health_check
    
    print_deployment_info
    
    log_success "백엔드 배포가 완료되었습니다! 🚀"
}

# 스크립트 실행
main
