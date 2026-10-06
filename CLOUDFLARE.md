# Cloudflare 배포 안내

## 1. D1 생성
Cloudflare 계정에서 **Storage & databases → D1 SQL Database → Create**를 선택하고 이름을 `stock-db`로 만듭니다. 데이터베이스 UUID를 복사합니다. 이 ID는 비밀번호가 아닙니다.

## 2. GitHub 연결
**Workers & Pages → Create application → GitHub 저장소 가져오기**에서 `kiha797/stock`을 선택합니다. Pages 정적 사이트가 아닌 Worker로 생성합니다.

| 항목 | 값 |
|---|---|
| Worker 이름 | `stock` |
| 운영 브랜치 | `main` |
| 루트 폴더 | `/` |
| 빌드 명령 | `pnpm run build` |
| 배포 명령 | `pnpm run db:init && pnpm run deploy` |
| 빌드 환경변수 | `D1_DATABASE_ID` = 1번에서 복사한 UUID |
| Node 버전 | 22.13 이상 |

`db:init`은 테이블이 없을 때만 생성하며 기존 데이터를 지우지 않습니다. 빌드/배포용 Cloudflare 권한에 해당 D1 데이터베이스 접근 권한이 필요합니다. D1 권한 오류가 나면 D1 콘솔에서 `db/init.sql`을 실행하고 배포 명령을 `pnpm run deploy`로 사용할 수 있습니다.

## 3. 관리자 비밀번호
배포된 Worker의 **Settings → Variables and Secrets**에서 `OWNER_PASSWORD`를 **Secret** 유형으로 등록합니다. 암호 관리자가 생성한 영문·숫자·기호 24자 이상의 고유한 값을 사용합니다. GitHub, 빌드 환경변수 또는 채팅에 비밀번호를 입력하지 않습니다.

`/owner`에서 로그인하면 HttpOnly·Secure·SameSite=Strict 쿠키가 생성되고 8시간 동안 개인 보유자산 조회 및 데이터 수정이 허용됩니다. 비밀번호를 변경하면 기존 쿠키는 무효화됩니다. 비밀번호 미설정 또는 24자 미만이면 관리자 로그인을 차단합니다.

일반 방문자는 시황·전문가 공시를 읽을 수 있으며 `/api/data`에서 개인 보유자산·관심종목·현금 설정은 반환하지 않습니다. 관리자만 저장·시세 갱신·전문가 연구 갱신을 할 수 있습니다. 시세의 분석 대상에는 등록 관심·보유 티커가 포함될 수 있습니다.

## 4. 배포 후 확인
Worker 기본 주소에서 대시보드가 열리는지 확인합니다. 관리자 로그인 후 관심종목 저장, 시세 갱신을 확인하고 로그아웃 후 개인 자산이 반환되지 않는지 확인합니다.

기존 Sites D1 데이터는 자동 복사되지 않습니다. 초기 공개 전문가 자료만 소스에 포함됩니다. 개인 데이터와 기존 전문가 업데이트를 이전한 뒤 오전 자동 갱신 대상을 전환해야 합니다. 전환 전 기존 Sites와 스케줄을 유지합니다. 새 서버의 자동 갱신은 `Authorization: Bearer`에 관리자 비밀번호를 보내는 방식을 지원하지만, 인증값을 GitHub나 스케줄 본문에 저장하지 않습니다.

## 5. 도메인 연결
검증을 마친 뒤 Worker의 **Settings → Domains & Routes → Add → Custom Domain**에서 `stock.labelpos.com`을 연결합니다. 기존 `toolbox.labelpos.com`, 쇼핑몰의 루트 도메인 레코드는 변경하지 않습니다. 앞서 안내한 Sites용 CNAME은 이 배포에 사용하지 않습니다.

현재 AdSense는 자리표시자만 있습니다. 실제 광고 단위 및 게시자 ID 연결은 별도입니다.

공식 안내: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ 및 https://developers.cloudflare.com/d1/get-started/
