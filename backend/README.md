# Grade Generator 백엔드 배포 가이드

## 🚀 자동 배포 스크립트

`back.sh` 스크립트를 사용하면 백엔드를 한 번에 배포할 수 있습니다.

### 주요 기능

- ✅ nginx 자동 설치 및 설정
- ✅ SSL 인증서 자동 발급 (Let's Encrypt)
- ✅ SSL 인증서 자동 갱신 설정
- ✅ Docker 컨테이너 빌드 및 실행
- ✅ 헬스 체크 및 상태 확인

## 📋 사전 요구사항

1. **Ubuntu 서버** (20.04 이상 권장)
2. **Docker 및 Docker Compose 설치**
3. **도메인 DNS 설정 완료**
   - grade-server.gbeai.net → 서버 IP 주소
4. **방화벽 포트 열기**
   - 80 (HTTP)
   - 443 (HTTPS)
   - 3050 (백엔드 직접 접근용, 선택사항)

## 🔧 설정 방법

### 1. 환경 변수 설정

```bash
cd backend
cp .env.example .env
nano .env
```

`.env` 파일에 API 키 설정:

```
GOOGLE_API_KEY=your_actual_google_api_key_here
```

### 2. 배포 실행

```bash
cd backend
sudo ./back.sh
```

### 3. 배포 과정

스크립트가 자동으로 다음 작업을 수행합니다:

1. ✅ Root 권한 확인
2. ✅ nginx 설치 (필요한 경우)
3. ✅ certbot 설치 (필요한 경우)
4. ✅ Docker 확인
5. ✅ .env 파일 확인
6. ✅ 필요한 디렉토리 생성
7. ✅ nginx 설정 파일 배포
8. ✅ SSL 인증서 발급/확인
   - 첫 실행: 자동 발급
   - 재실행: 유효성 확인
9. ✅ SSL 자동 갱신 설정
10. ✅ nginx 시작
11. ✅ 백엔드 Docker 빌드 및 실행
12. ✅ 헬스 체크

## 📍 배포 완료 후

### 접속 정보

- **백엔드 API**: https://grade-server.gbeai.net
- **로컬 백엔드**: http://localhost:3050
- **헬스 체크**: http://localhost:3050/health

### 유용한 명령어

```bash
# 백엔드 로그 확인
docker compose logs -f backend

# nginx 로그 확인
tail -f /var/log/nginx/backend-error.log
tail -f /var/log/nginx/backend-access.log

# 컨테이너 상태 확인
docker ps

# nginx 상태 확인
systemctl status nginx

# SSL 인증서 상태 확인
certbot certificates

# 백엔드 재시작
docker compose restart backend

# nginx 재시작
sudo systemctl restart nginx
```

## 🔒 SSL 인증서 관리

### 자동 갱신

- certbot timer가 **매일 2회** 자동으로 인증서를 확인합니다
- 만료 30일 전부터 자동 갱신을 시도합니다
- 갱신 성공 시 nginx가 자동으로 reload됩니다

### 수동 갱신

```bash
sudo certbot renew
```

### 인증서 정보 확인

```bash
sudo certbot certificates
```

## 🔍 문제 해결

### 1. nginx가 시작되지 않는 경우

```bash
# nginx 설정 테스트
sudo nginx -t

# nginx 로그 확인
sudo journalctl -u nginx -n 50

# nginx 상태 확인
sudo systemctl status nginx
```

### 2. SSL 인증서 발급 실패

**원인:**

- 도메인 DNS가 올바르게 설정되지 않음
- 80 포트가 막혀있음
- 이미 다른 웹서버가 80 포트를 사용 중

**해결:**

```bash
# DNS 확인
nslookup grade-server.gbeai.net

# 포트 확인
sudo netstat -tlnp | grep :80

# 방화벽 확인
sudo ufw status
```

### 3. 백엔드 컨테이너가 시작되지 않는 경우

```bash
# 백엔드 로그 확인
docker compose logs backend

# 컨테이너 상태 확인
docker ps -a

# .env 파일 확인
cat .env
```

### 4. HTTPS 접속이 안되는 경우

```bash
# nginx 프록시 설정 확인
sudo nginx -t

# 백엔드 컨테이너가 실행 중인지 확인
docker ps | grep grade-backend

# 백엔드 헬스 체크
curl http://localhost:3050/health

# nginx 로그 확인
tail -f /var/log/nginx/backend-error.log
```

## 📦 파일 구조

```
backend/
├── back.sh                    # 배포 스크립트
├── nginx/                     # nginx 설정 파일
│   └── grade-server.gbeai.net.conf
├── docker-compose.yml         # Docker Compose 설정
├── Dockerfile                 # Docker 이미지 빌드 설정
├── .env                       # 환경 변수 (git 제외)
├── .env.example              # 환경 변수 예시
└── src/                       # 소스 코드
    ├── server.ts
    ├── controllers/
    ├── routes/
    └── services/
```

## 🔄 재배포

코드를 수정한 후 재배포하려면:

```bash
cd backend
sudo ./back.sh
```

스크립트가 자동으로:

1. 기존 컨테이너 정리
2. 새로운 이미지 빌드
3. 컨테이너 재시작

## 🌐 네트워크 구성

```
Internet
    ↓
HTTPS (443)
    ↓
nginx (호스트)
    ↓
proxy_pass
    ↓
grade-backend:3050 (Docker 컨테이너)
```

## ⚠️ 주의사항

1. **반드시 sudo로 실행**: 스크립트는 root 권한이 필요합니다
2. **도메인 DNS 설정**: 배포 전에 DNS가 서버 IP를 가리키도록 설정해야 합니다
3. **방화벽 설정**: 80, 443 포트가 열려있어야 합니다
4. **이메일 주소**: `back.sh`의 `EMAIL` 변수에 유효한 이메일 주소를 설정하세요

## 📊 모니터링

### 백엔드 상태 확인

```bash
curl https://grade-server.gbeai.net/health
```

### 시스템 리소스 확인

```bash
docker stats grade-backend
```

## 🆘 지원

문제가 발생하면:

1. 위의 문제 해결 섹션 참조
2. 로그 파일 확인
3. GitHub Issues에 문의

## 📝 업데이트 로그

### v2.0 (2025-11-03)

- SSL 인증서 자동 발급 기능 추가
- SSL 자동 갱신 설정 추가
- nginx 설정 파일 backend 폴더로 이동
- 배포 스크립트 전면 개선

### v1.0 (2025-10-XX)

- 초기 배포 스크립트 작성
