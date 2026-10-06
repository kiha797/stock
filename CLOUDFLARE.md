# Cloudflare 배포

GitHub kiha797/stock의 main 브랜치를 Worker stock에 연결합니다.

| 항목 | 값 |
|---|---|
| 빌드 | `pnpm run build` |
| 배포 | `pnpm run db:init && pnpm run deploy` |
| D1 | DB → stock-db |
| 도메인 | stock.labelpos.com |
| Cron | `0 23 * * *` (UTC, 한국 오전 8시) |

wrangler.jsonc의 D1 UUID를 사용하며 D1_DATABASE_ID로 재정의할 수 있습니다. db:init은 없는 테이블만 생성합니다. 권한 오류가 나면 D1 콘솔에서 db/init.sql을 실행하고 배포 명령은 pnpm run deploy를 사용합니다.

공개 조회와 자동 시세 수집에는 비밀번호가 필요 없습니다. 첫 접속 시 백그라운드 수집을 시작하며 페이지는 최대 1분간 결과를 다시 확인합니다. 공급처 장애 시 이전 데이터를 유지합니다.

외부 전문가 연구 갱신을 연결할 때만 Worker Secret에 24자 이상 RESEARCH_UPDATE_TOKEN을 등록합니다. POST /api/research와 /api/refresh는 Authorization Bearer 헤더 인증이 필요합니다. 기존 OWNER_PASSWORD도 호환용 대체값으로 지원합니다. 로그인 화면과 쿠키 인증은 없습니다. 비밀값을 GitHub나 로그에 저장하지 않습니다. 연구 갱신은 GET /api/research의 writeContract를 따릅니다.

배포 후 공개 화면, 관심종목의 브라우저 저장, Cron 등록과 실행 로그를 확인하세요. 기존 Sites 데이터와 연구 자동화는 자동 이전되지 않습니다. toolbox.labelpos.com은 변경하지 않습니다.
