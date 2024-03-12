## 티나끝 서비스 소개
https://github.com/jungle-FullStop

  
## 프로젝트 설정 및 실행 절차

#### 1. 환경 변수 파일(.env) 생성

프로젝트 디렉토리의 루트에 `.env` 파일을 생성하고, 아래의 정보를 입력합니다. Google Firebase API 정보와 OpenAI Key 정보를 포함하여 필요한 환경 변수들을 설정해주세요.

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=user
DB_PASS=password
DB_NAME=db
OPENAI_KEY=<여기에 OpenAI Key 입력>
JWT_SECRET=<여기에 JWT 비밀키 입력>
GOOGLE_CLIENT_ID=<여기에 Google Client ID 입력>
GOOGLE_CLIENT_SECRET=<여기에 Google Client Secret 입력>
GOOGLE_REDIRECT_URL=http://localhost:5173/auth
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=kjungle3!
```

#### 2. Docker Compose를 사용한 가상 환경 생성

Redis와 MySQL을 포함하는 가상 환경을 생성하기 위해, 프로젝트 디렉토리에서 다음 명령어를 실행합니다.

```bash
docker compose up
```

이 명령은 `docker-compose.yml` 파일에 정의된 서비스들을 기반으로 가상 환경을 생성하고 실행합니다.

#### 3. 서버 실행

가상 환경이 성공적으로 생성되고 나면, 다음과 같이 npm 스크립트를 사용하여 개발 서버를 실행합니다.

```bash
npm run dev
```

이 명령어는 개발 모드에서 서버를 시작합니다. 서버가 정상적으로 작동하는지 확인하기 위해서 localhost:3000 를 호출해서 정상적으로 되는지 확인합니다.

