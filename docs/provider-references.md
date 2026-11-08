# 예매처별 재현 범위와 근거

확인일: 2026-11-07 (한국 시간)

## 확인한 공개 자료

- [YES24 예매안내](https://m.ticket.yes24.com/UserGuide/Booking?type=booking): 날짜/시간, 좌석, 할인/쿠폰, 수령 방법으로 이어지는 단계와 중복 좌석 선택 가능성을 확인했습니다. 모바일 공개 안내로 확인한 순서이며 최신 PC 예매창을 직접 확인한 자료는 아닙니다.
- [올림픽공원 예매안내](https://www.ksponco.or.kr/menu.es?mid=a20301020000): 인터파크를 통한 날짜/회차, 좌석, 가격/할인, 배송/주문자, 결제 순서를 확인했습니다. 구형 인터파크 안내이므로 최신 NOL 통합 예매창의 외형을 입증하지 않습니다. 페이지의 구형 수수료·입금 기한은 구현에 사용하지 않았습니다.
- [NOL 티켓](https://nol.yanolja.com/ticket): 현재 공개 티켓 페이지를 확인했습니다. 로그인 이후의 좌석 예매 화면은 직접 확인하지 않았습니다.
- [NOL 고객센터](https://help.interpark.com/ticket): 최신 실제 서비스 이용 조건은 고객센터와 해당 공연 공지가 기준입니다.

### 추가 예매처 (출처 링크만 기록)

아래 5개 예매처는 `lib/providers.js`에 출처 링크가 기록돼 있지만, 각 자료에서 어떤 단계를 확인했는지는 상세히 남기지 않았습니다. 단계 구성은 공개 안내를 참고한 추정이며 재확인이 필요합니다.

- 티켓링크: [고객센터](https://www.ticketlink.co.kr/help/main/), [예매 가이드](https://www.ticketlink.co.kr/help/guide)
- 멜론티켓: [예매 방법 안내](https://ticket.melon.com/customerservice/howto.htm)
- 쿠팡플레이: [쿠팡 뉴스룸 기사](https://news.coupang.com/archives/58178/) (앱 전용 예매 사례)
- 네이버 예약: [네이버 고객센터](https://help.naver.com/service/11712/contents/10290?lang=ko&osType=COMMONOS)
- KREAM: [FAQ](https://www.kream.co.kr/faq?category=all&list=true&page=6) (티켓링크 연결 예매 사례)

### 2차 추가 예매처 (2026-11-07 확인)

- 위버스 선예매: [위버스 공연 안내 공지](https://weverse.io/btob/notice/15123) (2023년 공연). 사전 신청 → 멤버십 이메일·번호로 사전 인증 → 선예매 오픈 순서, 선예매 회당 1인 1매, 예매는 인터파크에서 진행. 2023년 공지라 현재 방식과 다를 수 있습니다.
- SSG닷컴 랜더스: [시사경제 2026-02-09 기사](https://www.sateconomy.co.kr/news/view/1065574158674848). 2026시즌 예매 대행 계약, 등급이 다른 좌석을 한 번에 결제하는 혼합 예매. 단계·결제수단은 기사에 없어 일반적인 스포츠 예매 순서로 구성했습니다.
- NC 다이노스: [App Store 앱 소개](https://apps.apple.com/KR/app/id1495745743). 다이나믹 프라이싱을 적용한 자체 티켓 시스템, 스마트 티켓 입장, 버전 기록의 토스 결제·퀵계좌이체. 가격 변동 규칙은 공개되지 않아 연습용 규칙(구역 판매율 20%마다 +5%)을 썼습니다.
- 롯데 자이언츠: [구단 공식 홈페이지](https://www.giantsclub.com). 티켓 메뉴는 있지만 예매 안내 페이지 내용을 읽지 못해 단계 구성은 추정입니다.
- 타임티켓: [App Store 앱 소개](https://apps.apple.com/py/app/%ED%83%80%EC%9E%84%ED%8B%B0%EC%BC%93/id925289329). 대학로 공연 중심, 마감 임박 티켓 할인(타임커머스). 상품 페이지 본문은 읽지 못했고 자동 배정 방식은 추정입니다.
- 엘티켓: [디지털인사이트 기사](https://ditoday.com/?p=153600). 대홍기획 운영, 비지정석 할인·타임 특가 공식 할인 상품, 최대 50% 할인.

### 공연장·경기장 배치도 (2026-11-08 확인)

공식 구역별 배치도는 공연·경기마다 달라 확인하지 못했습니다. 아래 자료에서 전체 구조와 등급 이름만 참고했고, 구역 번호·좌석 수·가격은 연습용 예시입니다.

- KSPO DOME: 플로어 / 2층 / 3층 구성, 약 15,000석 ([나만의카드 블로그](https://blog.namanecard.com/kspo-dome-capacity-olympic-gymnastics-arena-seating-ko/), [후기 글](https://thinknection.idelighter.com/2025/11/2025-kspo.html)).
- 고척스카이돔: 콘서트 시 그라운드 + 1~4층, 2층은 초대석 배정이 많고 시야제한석은 3·4층 후방 ([서울 미디어허브](https://mediahub.seoul.go.kr/archives/2005075), [팬 커뮤니티](https://fanplus.co.kr/community/misc/86897964)). 2층은 연습에서 제외했습니다.
- 인스파이어 아레나: 사방을 둘러싼 아레나형, 지상 1~4층, 최대 15,000명 ([인천시 문화시설](https://www.incheon.go.kr/culture/CU020901/view?fcltySn=68), [헤럴드](https://heraldk.com/?p=2336314)). 구역 번호 체계는 확인하지 못했습니다.
- 세종문화회관 대극장: 1~3층 구성 ([서울신문 2000](https://www.seoul.co.kr/news/2000/03/28/20000328017002)).
- 서울월드컵경기장·블루스퀘어 신한카드홀·샤롯데씨어터: 이번에 따로 조사하지 않았습니다. 일반적인 경기장/극장 구조(그라운드+1·2층, 1~3층, 1~2층)로 구성했습니다.
- 잠실야구장: 테이블석·블루석·오렌지석·레드석·네이비석·외야그린석 등급 ([하니서울](https://www.haniseoul.com/ko/travels/korea/baseball-lg-twins), [가격 정리 블로그](https://dnublog.co.kr/2025/10/25/2025-%ED%95%9C%EA%B5%AD%EC%8B%9C%EB%A6%AC%EC%A6%88-%ED%8B%B0%EC%BC%93-%EA%B0%80%EA%B2%A9-%EC%B4%9D%EC%A0%95%EB%A6%AC-%EC%9E%A0%EC%8B%A4%C2%B7%EB%8C%80%EC%A0%84-%EC%A2%8C%EC%84%9D%EB%B3%84-%EA%B0%80/)).
- 사직야구장: 중앙탁자석·와이드탁자석·응원탁자석·내야필드석·내야상단석·중앙상단석·외야석 ([사직 직관 가이드](https://v.daum.net/v/20260709175159265), [가격 정리](https://moneyroan.com/%EB%A1%AF%EB%8D%B0%EC%9E%90%EC%9D%B4%EC%96%B8%EC%B8%A0-%ED%8B%B0%EC%BC%93-%EA%B0%80%EA%B2%A9-%EC%A0%95%EB%B3%B42024-%EC%8B%9C%EC%A6%8C/)).
- 인천SSG랜더스필드: 외야 바비큐존·그린존은 2021년 기사 기준 ([스포츠경향](https://sports.khan.co.kr/article/202103251339003)). 응원석 위치와 나머지 등급 이름은 일반적인 구성으로 만든 것입니다.
- 창원NC파크: 테이블석과 블럭 번호(예: 114블럭), 좌석별 다이나믹 프라이싱 ([polle 후기](https://polle.com/place/5o6l9B/%EC%B0%BD%EC%9B%90%20NC%ED%8C%8C%ED%81%AC), [위키백과](https://en.wikipedia.org/wiki/Changwon_NC_Park)). 블럭 배치는 추정입니다.

### 3차 추가 예매처 (2026-11-08 확인)

- 코레일+ 명절 예매: 2026년 9월부터 KTX·SRT 예매가 코레일+로 통합, 명절 예매는 노선별 분산 일정과 접속 대기, 결제 기한이 있음 ([위키트리](https://www.wikitree.co.kr/articles/1153179), [SRT 2026 설 공지](https://etk.srail.kr/bt/notice.html)). KTX 일반실 2+2(A·D 창가), 특실 2+1, KTX-산천 특실은 3호차 ([myezl 블로그](https://blog.myezl.com/?p=2732), [위키트리 명당 기사](https://www.wikitree.co.kr/articles/1134067)). 운임 59,800원/83,700원과 8량 구성·좌석 수는 연습용 값입니다.
- CGV: 용산아이파크몰 IMAX관 예매 수량 제한(1일 최대 4매) 보도 ([헤럴드경제](https://www.heraldk.com/article/2026082702390292811), [SBS Biz](https://biz.sbs.co.kr/amp/article/20000338934)). 좌석 수(약 600석)는 블로그 수치라 확인하지 못했고, 열·블록 구성은 단순화했습니다. 예매 단계 이름은 일반적인 영화 예매 순서로 구성했습니다.
- 메가박스: 코엑스점이 국내 1호 돌비시네마(2020년 7월) ([스포츠경향](https://sports.khan.co.kr/article/202401182138003)). 좌석 수는 확인하지 못했습니다.
- PlayKFA: 대한축구협회 공식 예매처, 서울월드컵경기장 A매치 등급(프리미엄석·1~3등석·레드석 응원석) ([뉴스서울](https://newsseoul.co.kr/news/view/1065602413514667), [아주경제](https://www.ajunews.com/view/20240826144556088), [데일리안](https://m.dailian.co.kr/news/view/1551126)). 등급별 구역 위치는 공개 배치도를 확인하지 못해 추정했습니다.

### 4차 추가 예매처 (2026-11-08 확인)

- 티켓링크 야구: 정규시즌은 구단마다 예매처가 다르고 티켓링크도 그중 하나 ([KB Think](https://kbthink.com/life/card/kbo-2026.html)). 어느 구단이 티켓링크인지는 확인하지 못해 구장을 자유롭게 고르게 했습니다.
- NOL 포스트시즌: 2026 포스트시즌·한국시리즈는 NOL 티켓 단독 판매, 1인 최대 4매, 경기별 순차 오픈 ([코리아데일리](https://www.koreadaily.com/article/20261101020043794), [foxcg](https://foxcg.com/korean-series-tickets-2026/), [위키트리](https://www.wikitree.co.kr/articles/1170985)). 연습은 최대 2매입니다. 실제 한국시리즈 구장(수원·대구)은 배치도가 없어 기존 구장으로 연습합니다.
- 티머니GO 고속버스: 우등 28석, 프리미엄 21석 ([이투데이](https://www.etoday.co.kr/news/view/1414121), [myezl](https://blog.myezl.com/?p=4867)). 배열은 출처마다 1+2/2+1로 달라 1+2로 구성했습니다. 요금은 연습용입니다.
- 궁궐 야간관람: 창덕궁 달빛기행은 '궁케팅'으로 불릴 만큼 경쟁이 심하고, 2026 상반기는 추첨제였음 ([뉴시스](https://www.newsis.com/view/NISX20260320_0003556422), [미디어워치](https://mediawatch.kr/mobile/article.html?no=260708)). 연습은 선착순 회차 예매로 구성했고, 회차·정원·가격은 예시입니다.
- 큐넷: 원서접수에서 회차·시험장·응시일 선택 후 결제, 필기 응시수수료 19,400원, 인기 지역 조기 마감 가능 ([마추다 블로그](https://www.machuda.kr/blog/article/84)). 시험장 목록은 예시입니다.
- 대학 수강신청: 장바구니·선착순·보안문자 제도 ([서울대 컴퓨터공학부 공지](https://cse.snu.ac.kr/community/notice/24624), [한림대 매뉴얼](https://haksa.hallym.ac.kr/html/manual/web_manual.pdf), [파이낸셜뉴스](https://www.fnnews.com/news/201201081823166807)). 특정 학교가 아닌 일반형입니다.
- 국립공원 예약: 야영장·대피소·생태탐방원을 한 시스템에서 예약, 시설별 오픈 시각 상이 ([안내 블로그](https://baby.tali.kr/knps-reservation-guide)). 대피소 이용료는 확인하지 못해 연습용 값입니다.
- 캐치테이블: 매장별 예약 오픈 설정(기본 자정), 예약금·노쇼 수수료 ([캐치테이블 가이드](https://docs.channel.io/catchtable_guide/ko/articles/%EC%98%88%EC%95%BD-%EC%98%A4%ED%94%88-%EC%9D%BC%EC%9E%90%EB%A7%88%EA%B0%90-%EC%9D%BC%EC%9E%90-%EC%84%A4%EC%A0%95--09e650df), [유니콘팩토리](https://www.unicornfactory.co.kr/article/2024121609591059346)). 매장은 가상입니다.
- 서울시 공공서비스예약: 체육시설 예약 시스템 ([서울 미디어허브](https://mediahub.seoul.go.kr/archives/2000926)). 테니스장 오픈 일정·요금은 확인하지 못해 가상 시설로 구성했습니다.
- e+: 회원 전용, 1인 최대 2장, 선착순이 아닌 추첨 ([사카낙션 e+ 선행 안내](https://sakanaction.jp/feature/nf11_ticket_eplus)). 한국 거주자 결제·입금 기한은 확인하지 못했습니다. 낙선은 난이도별 실패 확률로 연습합니다.

### 5차 추가 예매처·장소 (2026-11-08 확인)

- 야구장 4곳: 수원 KT위즈파크 1만8700석·106/126블럭 ([스페셜타임스](https://www.specialtimes.co.kr/news/articleView.html?idxno=481841), [isplus](https://isplus.com/article/view/isp202611030245)), 대구 삼성라이온즈파크 팔각형 구조 ([서울신문](https://m.go.seoul.co.kr/news/2016/01/11/20160111011005)), 광주 챔피언스필드 K9·K8(응원단석)·K5·챔피언석·서프라이즈존 ([OSEN](https://www.osen.co.kr/article/G1109804238), [infogoodman](https://www.infogoodman.com/2026/03/gwangju-kia-champions-field-seat-guide-price.html)), 대전 한화생명볼파크 테이블석·외야 잔디존 ([OSEN](https://osen.co.kr/article/G1112507978), [파이낸셜뉴스](https://www.fnnews.com/news/202610060855120456)). 대구·수원·대전의 등급 이름과 응원석 위치는 확인하지 못해 일반적인 이름으로 구성했습니다.
- 예술의전당: 오페라극장 약 2,200석, 1층(일반·BOX)과 2~4층 A·B·C블록, R~D석 ([예술의전당 오페라극장 안내](https://www.sac.or.kr/site/main/content/ticketPlaceOpera)). 콘서트홀 합창석 등급과 LG아트센터 배치는 확인하지 못해 단순화했습니다.
- 롯데시네마 월드타워 수퍼플렉스: 세계 최대 스크린(2014), 좌석 수는 622석 → 295석 등 보도마다 다름 ([아주경제](https://www.ajunews.com/view/20230107184715149), [이투데이](https://www.etoday.co.kr/news/view/943391)).
- 쿠팡플레이 K리그: 쿠팡플레이 앱 스마트 티켓 예매 ([freshnewinfo](https://www.freshnewinfo.com/entry/2026-K%EB%A6%AC%EA%B7%B8-12-%EA%B0%9C%EB%A7%89-%EC%98%88%EC%83%81-%EC%88%9C%EC%9C%84-%EC%A0%84%EB%A7%9D-%EC%98%88%EB%A7%A4-%EB%B0%A9%EB%B2%95%EB%B0%94%EB%80%90-%EC%A0%90-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0), [전북일보](https://www.jjan.kr/article/20260119500181)). W·E·N·S석 등급과 위치는 추정입니다.
- Ticketmaster Verified Fan: 사전 등록 → 선정자에게 코드 발송 → 프리세일, 비선정자 대기 명단 ([Consequence](https://consequence.net/2023/03/verified-fan-ticketmaster-how-to-register), [Ticketmaster 블로그](https://blog.ticketmaster.com/trans-siberian-orchestra-verifiedfan-presale-faq/), [NBC](https://www.nbcnews.com/pop-culture/ticketmaster-says-verified-fan-registration-doesnt-measure-fandom-fans-rcna81187)).
- 페스티벌 스탠딩: 일반 예매 시 입장번호를 받고 당일 번호 순서로 입장하는 사례 ([wikidocs](https://wikidocs.net/blog/@mythos/27522/)). 워터밤의 배정 방식은 확인하지 못했고, 차수별 가격 구조만 확인 ([브런치](https://brunch.co.kr/@bokjinara/227)).
- 제주항공 찜 특가: 국내선·국제선 순차 오픈, 오전 10시 오픈 사례, 특가는 기내 휴대품만 ([이투데이](https://www.etoday.co.kr/news/view/2258696), [데일리안](https://www.dailian.co.kr/news/view/1510846/)). 편명·운임·좌석 수는 연습용입니다.
- 나이키 SNKRS 드로우: 응모 기간 뒤 무작위 선정, 당첨 시 결제 ([Nike 도움말](https://www.nike.com/help/a/launch-tips), [Hypebeast](https://hypebeast.com/2022/3/nike-snkrs-pass-2022-random-draw-program-update)). 한국 결제·사이즈 정책은 확인하지 못했습니다.
- 팬사인회 응모: 공식 자료를 찾지 못해 '앨범 수량이 많을수록 당첨 확률이 높다'는 연습용 규칙으로 만든 일반형입니다.

## 직접 구현한 연습 요소

두 모드의 창 배치, 색상, 구역 패널 위치는 PC 예매창 형태를 참고한 재현입니다.
실제 사이트의 HTML·JavaScript·이미지·로고를 복사하지 않았습니다.
픽셀 단위 일치나 최신 로그인 화면과의 동일성을 검증하지 않았습니다.

- 공연·경기: 가상 데이터. 공연장·구장 좌석도는 기본 3곳은 가상, 실제 장소 10곳은 위 자료로 전체 구조만 참고한 단순화 배치도이며 실제 공연별 배치도와 일치하지 않습니다.
- 대기열: 5회에 걸쳐 줄어드는 짧은 연습 시뮬레이션. 실제 대기열 로직을 재현한 것이 아닙니다.
- 보안문자: 로컬에서 생성하고 비교하는 타이핑 연습. 실제 인증과 무관합니다.
- 보안문자 기본값(`captchaLevels`): 공개 예매 팁·후기에서 "경쟁이 치열한 공연에서만 안심예매(보안문자)가 나온다"고 소개된 NOL·멜론티켓·티켓링크(야구 포함)·NOL 포스트시즌·위버스 선예매·페스티벌·수강신청은 켜짐, YES24·궁궐·롯데 자이언츠는 매크로급에서만 켜짐, 영화관·버스·기차·항공·시험·식당·해외 예매처는 꺼짐. 공식 공지로 확인된 규칙이 아니라 추정이며 공연마다 다를 수 있습니다 ([티켓팅 팁 정리](https://www.timecheck.co.kr/tip.php), [에스티씨랩·예스24 봇 차단 보도](https://sports.khan.co.kr/article/202505290458003/amp)).
- 좌석 경쟁·실패율·응답 지연: 난이도별 연습 파라미터.
- 좌석 유지 시간: 연습용 3분. 실제 예매처의 유지 시간을 의미하지 않습니다.
- 가격·10% 할인·배송비 3,500원: 연습용 금액. 실제 요금표가 아닙니다.
- 개인 정보: 이름·연락처·주소는 수정할 수 없는 가상 예시만 표시.
- 결제: 결제수단 선택과 최종 확인 동작만 실행. 카드·계좌·간편결제 입력이나 외부 결제 요청 없음. PAYCO·쿠페이·Npay는 이름만 표시하는 연습용 선택지입니다.
- 이용 확인(쿠팡플레이)·제휴 안내(KREAM): 로그인·멤버십·계정 연동을 하지 않는 확인 체크 단계입니다.

## 검증

브라우저 검증은 36개 예매처의 단계 흐름·창 레이아웃·결제수단 표시와, NOL·YES24 모드의 날짜 변경, 대기열, 보안문자 오입력/재입력,
좌석 선택·선점 실패, 일반 2매/연석 옵션, 이전 단계 이동, 할인·배송비 합산,
최종 동의·가상 결제, 기록 보존, 창 중단, 모바일 폭을 대상으로 합니다.
실제 예매처와의 화면 차이를 비교하는 검증은 수행하지 않았습니다.
