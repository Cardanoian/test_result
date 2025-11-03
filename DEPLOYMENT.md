# 배포 가이드

이 문서는 Ubuntu Cloud Instance에서 프론트엔드와 백엔드를 Docker와 Nginx를 사용하여 배포하는 방법을 설명합니다.

## 사전 요구사항

- Ubuntu 서버 (20.04 LTS 이상 권장)
- Docker 및 Docker Compose 설치
- Nginx 설치
- 도메인 DNS 설정 완료
  - grade.gbeai.net → 서버 IP
  - grade-server.gbeai.net → 서버 IP

## 1. 서버 초기 설정

### Docker 설치

```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
```

### Nginx 설치

```bash
sudo apt update
sudo apt install nginx -y
```

### Certbot 설치

```bash
sudo apt install certbot python3-certbot-nginx -y
```

## 2. 프로젝트 배포

### 프론트엔드 배포

```bash
# 프로젝트 디렉토리 생성
sudo mkdir -p /opt/grade-frontend
cd /opt/grade-frontend

# 프로젝트 파일 복사 (Git 또는 직접 복사)
# 예: git clone 또는 scp로 파일 전송

# .env.production 파일이 있는지 확인
# VITE_BACKEND_API_URL=https://grade-server.gbeai.net

# Docker 이미지 빌드 및 실행
sudo docker-compose up -d --build
```

### 백엔드 배포

```bash
# 프로젝트 디렉토리 생성
sudo mkdir -p /opt/grade-backend
cd /opt/grade-backend

# 백엔드 파일 복사
# backend/ 디렉토리의 모든 파일을 이 위치로 복사

# .env 파일 생성
sudo nano .env
```

`.env` 파일 내용:

```
GOOGLE_API_KEY=your_actual_google_api_key_here
PORT=3050
CORS_ORIGIN=https://grade.gbeai.net
NODE_ENV=production
```

```bash
# Docker 이미지 빌드 및 실행
sudo docker-compose up -d --build
```

## 3. Nginx 설정

### Nginx 설정 파일 복사

```bash
# 프론트엔드 설정
sudo cp nginx/grade.gbeai.net.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/grade.gbeai.net.conf /etc/nginx/sites-enabled/

# 백엔드 설정
sudo cp nginx/grade-server.gbeai.net.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/grade-server.gbeai.net.conf /etc/nginx/sites-enabled/

# 기본 설정 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default
```

### Nginx 설정 테스트

```bash
sudo nginx -t
```

## 4. SSL 인증서 발급

### Certbot으로 SSL 인증서 발급

```bash
# 프론트엔드 인증서
sudo certbot --nginx -d grade.gbeai.net

# 백엔드 인증서
sudo certbot --nginx -d grade-server.gbeai.net
```

Certbot이 자동으로 Nginx 설정을 업데이트합니다.

### 인증서 자동 갱신 설정

```bash
# 자동 갱신 테스트
sudo certbot renew --dry-run

# Cron job은 자동으로 설정됩니다
```

## 5. Nginx 재시작

```bash
sudo systemctl restart nginx
```

## 6. 방화벽 설정

```bash
# UFW 사용 시
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## 7. 배포 확인

### 서비스 상태 확인

```bash
# Docker 컨테이너 확인
sudo docker ps

# Nginx 상태 확인
sudo systemctl status nginx

# 백엔드 로그 확인
cd /opt/grade-backend
sudo docker-compose logs -f
```

### 웹사이트 접속 테스트

- 프론트엔드: https://grade.gbeai.net
- 백엔드 헬스체크: https://grade-server.gbeai.net/health

## 8. 업데이트 및 재배포

### 프론트엔드 업데이트

```bash
cd /opt/grade-frontend
git pull  # 또는 파일 업데이트
sudo docker-compose down
sudo docker-compose up -d --build
```

### 백엔드 업데이트

```bash
cd /opt/grade-backend
git pull  # 또는 파일 업데이트
sudo docker-compose down
sudo docker-compose up -d --build
```

## 9. 로그 확인

### 백엔드 로그

```bash
cd /opt/grade-backend
sudo docker-compose logs -f

# 또는 로그 파일 직접 확인
sudo tail -f logs/combined.log
sudo tail -f logs/error.log
```

### Nginx 로그

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 10. 문제 해결

### Docker 컨테이너가 시작되지 않는 경우

```bash
# 로그 확인
sudo docker-compose logs

# 컨테이너 재시작
sudo docker-compose restart
```

### SSL 인증서 문제

```bash
# 인증서 갱신
sudo certbot renew

# Nginx 재시작
sudo systemctl restart nginx
```

### 포트 충돌

```bash
# 포트 사용 확인
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
sudo netstat -tulpn | grep :3050
```

## 보안 권장사항

1. `.env` 파일의 권한 설정

```bash
sudo chmod 600 /opt/grade-backend/.env
```

2. 정기적인 시스템 업데이트

```bash
sudo apt update && sudo apt upgrade -y
```

3. 로그 모니터링 및 정기적인 확인

4. 백업 설정 (데이터베이스, 설정 파일 등)

## 참고사항

- 프론트엔드는 포트 80에서 실행되며 Nginx가 443으로 프록시합니다
- 백엔드는 포트 3050에서 실행되며 Nginx가 443으로 프록시합니다
- 모든 HTTP 요청은 자동으로 HTTPS로 리다이렉트됩니다
- CORS는 백엔드에서 `https://grade.gbeai.net`만 허용하도록 설정되어 있습니다
