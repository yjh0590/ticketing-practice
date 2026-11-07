// Public-guide-based layouts, not snapshots of authenticated booking pages.
// Practice events: every provider books one of these fictional events.
export const events = {
  concert: {
    venue: 'arena', title: '2026 FRONT ROW : THE LIVE', short: '2026 FRONT ROW<br>: THE LIVE', sub: '가상 공연 · 서울 라이브 아레나',
    period: '2026.12.12 ~ 2026.12.13', duration: '120분', age: '만 7세 이상', unit: '회차',
    poster: ['THE MOMENT<br>BEFORE THE MUSIC', 'FRONT<br>ROW', '2026 LIVE CONCERT<br>SEOUL LIVE ARENA'],
    month: [2026, 12], dates: [
      { id: '2026-12-12', day: 12, label: '2026.12.12 (토)', time: '18:00' },
      { id: '2026-12-13', day: 13, label: '2026.12.13 (일)', time: '17:00' },
    ],
  },
  baseball: {
    venue: 'ballpark', title: '2027 연습 리그 개막 시리즈 : 홈 vs 원정', short: '2027 연습 리그<br>홈 vs 원정', sub: '가상 경기 · 연습 볼파크',
    period: '2027.03.27 ~ 2027.03.28', duration: '약 3시간', age: '전 연령', unit: '경기',
    poster: ['OPENING SERIES<br>HOME vs AWAY', 'PLAY<br>BALL', '2027 PRACTICE LEAGUE<br>PRACTICE BALLPARK'],
    month: [2027, 3], dates: [
      { id: '2027-03-27', day: 27, label: '2027.03.27 (토)', time: '14:00' },
      { id: '2027-03-28', day: 28, label: '2027.03.28 (일)', time: '14:00' },
    ],
  },
  play: {
    venue: 'theater', title: '연극 〈첫 번째 줄〉', short: '연극<br>〈첫 번째 줄〉', sub: '가상 공연 · 대학로 연습극장',
    period: '2026.12.12 ~ 2026.12.13', duration: '100분', age: '만 13세 이상', unit: '회차',
    poster: ['DAEHAKRO<br>PRACTICE STAGE', 'FIRST<br>ROW', 'A PLAY IN ONE ACT<br>PRACTICE THEATER'],
    month: [2026, 12], dates: [
      { id: '2026-12-12', day: 12, label: '2026.12.12 (토)', time: '15:00' },
      { id: '2026-12-13', day: 13, label: '2026.12.13 (일)', time: '19:00' },
    ],
  },
};
const sportsSteps = ['경기 선택', '좌석 선택', '권종 선택', '예매 확인', '결제'];
export const providers = {
  nol: {
    id: 'nol', name: 'NOL · 인터파크', brand: 'NOL 티켓',
    steps: ['관람일/회차선택', '좌석 선택', '가격/할인선택', '배송선택/주문자확인', '결제하기'],
    seatAction: '좌석선택완료', nextAction: '다음단계', summaryTitle: 'My예매정보',
    kind: 'PC형', layout: 'desktop', pane: 'right', flow: ['date', 'seats', 'price', 'delivery', 'payment'],
    description: '관람일·좌석·할인·수령·결제를 순서대로 익히는 구 인터파크 PC형 연습입니다.',
    sources: ['https://help.interpark.com/ticket', 'https://www.ksponco.or.kr/menu.es?mid=a20301020000'],
  },
  yes24: {
    id: 'yes24', name: 'YES24 티켓', brand: 'YES24 TICKET',
    steps: ['날짜/시간 선택', '좌석 선택', '할인/쿠폰 선택', '수령방법 선택', '결제방법 선택'],
    seatAction: '좌석선택 완료', nextAction: '다음단계', summaryTitle: '나의 예매정보',
    kind: 'PC형', layout: 'desktop', pane: 'left', coupons: true, flow: ['date', 'seats', 'price', 'delivery', 'payment'],
    description: '날짜와 좌석을 고르고 할인·쿠폰, 수령 방법을 확인하는 PC형 연습입니다.',
    sources: ['https://m.ticket.yes24.com/UserGuide/Booking?type=booking'],
  },
  ticketlink: {
    id: 'ticketlink', name: '티켓링크', brand: 'ticketlink', kind: 'PC형', layout: 'desktop', pane: 'left',
    flow: ['date', 'seats', 'price', 'delivery', 'payment'],
    steps: ['날짜/회차 선택', '등급/좌석 선택', '가격/할인 선택', '배송/예매 확인', '결제'],
    seatAction: '좌석 선택 완료', nextAction: '다음단계', summaryTitle: '예매정보',
    methods: [['payco', 'PAYCO (연습)'], ['card', '신용카드']],
    description: '구역 목록과 좌석등급을 확인하고 PAYCO 선택까지 연습하는 PC형 모드입니다.',
    sources: ['https://www.ticketlink.co.kr/help/main/', 'https://www.ticketlink.co.kr/help/guide'],
  },
  melon: {
    id: 'melon', name: '멜론티켓', brand: 'Melon Ticket', kind: 'PC형', layout: 'desktop', pane: 'top', coupons: true,
    flow: ['date', 'seats', 'price', 'delivery', 'payment'],
    steps: ['날짜/회차', '좌석 선택', '가격/할인', '배송/주문자', '결제'],
    seatAction: '좌석 선택 완료', nextAction: '다음', summaryTitle: '나의 예매정보',
    description: '날짜·좌석을 선택하고 가격·수령·결제를 진행하는 녹색 테마의 PC형 연습입니다.',
    sources: ['https://ticket.melon.com/customerservice/howto.htm'],
  },
  coupang: {
    id: 'coupang', name: '쿠팡플레이', brand: 'coupang play', kind: '앱형', layout: 'app', pane: 'top', digital: true, dateStyle: 'cards',
    flow: ['membership', 'date', 'seats', 'review', 'payment'],
    steps: ['이용 확인', '공연 일정', '좌석 선택', '예매 확인', '결제'],
    seatAction: '선택 완료', nextAction: '계속하기', summaryTitle: '예매 내역', bookLabel: '앱형 예매 연습',
    methods: [['coupay', '쿠페이 (연습)'], ['card', '신용카드']],
    description: '모바일 앱 전용 예매 사례를 참고한 앱형 연습입니다. PC에서도 휴대폰 모양의 창으로 진행됩니다.',
    sources: ['https://news.coupang.com/archives/58178/'],
  },
  naver: {
    id: 'naver', name: '네이버 예약', brand: 'NAVER 예약', kind: '예약형', layout: 'reservation', pane: 'top', digital: true, dateStyle: 'cards',
    flow: ['date', 'seats', 'review', 'payment'], steps: ['날짜·회차', '좌석 선택', '예약 확인', '예약·결제'],
    seatAction: '선택 완료', nextAction: '다음', summaryTitle: '예약 정보', bookLabel: '예약하기',
    methods: [['npay', 'Npay (연습)'], ['card', '신용카드']],
    description: '공연 회차형·좌석 선택형을 바탕으로 날짜, 좌석, 예약 정보, Npay 선택을 연습합니다.',
    sources: ['https://help.naver.com/service/11712/contents/10290?lang=ko&osType=COMMONOS'],
  },
  kream: {
    id: 'kream', name: 'KREAM 티켓', brand: 'KREAM', kind: '제휴형', layout: 'partner', pane: 'left', partner: 'ticketlink',
    flow: ['handoff', 'date', 'seats', 'price', 'delivery', 'payment'],
    steps: ['제휴 예매 안내', '날짜/회차', '좌석 선택', '가격/할인', '수령 방법', '결제'],
    seatAction: '좌석 선택 완료', nextAction: '다음단계', summaryTitle: '제휴 예매정보', bookLabel: '티켓 예매하기',
    methods: [['payco', 'PAYCO (연습)'], ['card', '신용카드']],
    description: '티켓링크로 연결되는 좌석 예매 사례를 참고했습니다. 제휴 안내 뒤 로컬 티켓링크형 연습창으로 전환됩니다.',
    sources: ['https://www.kream.co.kr/faq?category=all&list=true&page=6'],
  },
  weverse: {
    id: 'weverse', name: '위버스 선예매', brand: 'Weverse', kind: '선예매형', layout: 'partner', pane: 'right', partner: 'nol', maxQuantity: 1,
    flow: ['fanclub', 'date', 'seats', 'price', 'delivery', 'payment'],
    steps: ['선예매 인증', '관람일/회차선택', '좌석 선택', '가격/할인선택', '배송선택/주문자확인', '결제하기'],
    seatAction: '좌석선택완료', nextAction: '다음단계', summaryTitle: '선예매 예매정보', bookLabel: '선예매 참여',
    description: '팬클럽 선예매 사전 신청 뒤 멤버십 번호로 인증하고, NOL형 예매창에서 1인 1매로 예매하는 흐름을 연습합니다.',
    sources: ['https://weverse.io/btob/notice/15123'],
  },
  ssg: {
    id: 'ssg', name: 'SSG닷컴 랜더스', brand: 'SSG.COM', kind: '스포츠 대행형', layout: 'desktop', pane: 'top', event: 'baseball', digital: true, dateStyle: 'cards', mixed: true,
    flow: ['date', 'seats', 'price', 'review', 'payment'], steps: sportsSteps,
    seatAction: '좌석 선택 완료', nextAction: '다음', summaryTitle: '예매 정보',
    description: '쇼핑몰 계정으로 프로야구 홈경기를 예매하는 사례를 참고했습니다. 등급이 다른 좌석을 한 번에 결제하는 혼합 예매를 연습합니다.',
    sources: ['https://www.sateconomy.co.kr/news/view/1065574158674848'],
  },
  nc: {
    id: 'nc', name: 'NC 다이노스', brand: 'NC DINOS', kind: '구단 앱형', layout: 'app', pane: 'top', event: 'baseball', digital: 'smart', dateStyle: 'cards', dynamicPricing: true,
    flow: ['date', 'seats', 'price', 'review', 'payment'], steps: sportsSteps,
    seatAction: '선택 완료', nextAction: '다음', summaryTitle: '예매 내역', bookLabel: '앱 예매 연습',
    methods: [['card', '등록 카드'], ['toss', '토스페이 (연습)'], ['quick', '퀵계좌이체 (연습)']],
    description: '구단 앱 자체 예매를 참고했습니다. 구역 판매율에 따라 가격이 오르는 연습용 다이나믹 프라이싱과 스마트 티켓을 연습합니다.',
    sources: ['https://apps.apple.com/KR/app/id1495745743'],
  },
  lotte: {
    id: 'lotte', name: '롯데 자이언츠', brand: 'GIANTS', kind: '구단 홈페이지형', layout: 'desktop', pane: 'right', event: 'baseball', digital: true,
    flow: ['date', 'seats', 'price', 'review', 'payment'], steps: sportsSteps,
    seatAction: '좌석선택완료', nextAction: '다음단계', summaryTitle: '예매정보',
    description: '구단 공식 홈페이지 예매를 참고한 PC형 연습입니다. 공개 안내에서 단계를 확인하지 못해 일반적인 스포츠 예매 순서로 구성했습니다.',
    sources: ['https://www.giantsclub.com'],
  },
  timeticket: {
    id: 'timeticket', name: '타임티켓', brand: 'TIME TICKET', kind: '할인형', layout: 'reservation', pane: 'top', event: 'play', digital: true, dateStyle: 'cards',
    flow: ['date', 'option', 'review', 'payment'], steps: ['날짜·회차', '할인 상품 선택', '예매 확인', '결제'],
    seatAction: '구매하기', nextAction: '다음', summaryTitle: '예매 정보',
    options: [
      { id: 'time', label: '마감임박 타임특가', note: '좌석 자동배정 · 사이드 블록', discount: .4, sections: ['L', 'R'] },
      { id: 'normal', label: '일반 예매', note: '좌석 자동배정 · 가운데 블록', discount: 0, sections: ['C'] },
    ],
    description: '대학로 공연의 마감임박 할인 상품을 고르면 좌석이 자동 배정되는 흐름을 연습합니다.',
    sources: ['https://apps.apple.com/py/app/%ED%83%80%EC%9E%84%ED%8B%B0%EC%BC%93/id925289329'],
  },
  lticket: {
    id: 'lticket', name: '엘티켓', brand: 'L.TICKET', kind: '할인형', layout: 'desktop', pane: 'top',
    flow: ['date', 'option', 'delivery', 'payment'], steps: ['날짜/회차', '할인 상품 선택', '수령 방법', '결제'],
    seatAction: '구매하기', nextAction: '다음단계', summaryTitle: '예매정보',
    options: [
      { id: 'unreserved', label: '비지정석 할인', note: 'R석 구역 중 자동배정', discount: .3, sections: ['C', 'D', 'E'] },
      { id: 'timesale', label: '타임 특가', note: 'VIP석 구역 중 자동배정', discount: .5, sections: ['A', 'B'] },
    ],
    description: '공식 할인 상품(비지정석 할인·타임 특가)을 고르면 좌석이 자동 배정되는 흐름을 연습합니다. 할인율은 연습용입니다.',
    sources: ['https://ditoday.com/?p=153600'],
  },
};
export const eventOf = profile => events[profile.event || 'concert'];
export const paymentMethods = profile => profile.methods || [['card', '신용카드'], ['bank', '무통장입금']];
export const seatStep = profile => profile.flow.findIndex(kind => kind === 'seats' || kind === 'option');
// Steps that change the window into the partner's booking UI once passed.
export const gateStep = profile => profile.flow.findIndex(kind => kind === 'handoff' || kind === 'fanclub');
export const initialDelivery = profile => profile.digital === 'smart' ? 'smart' : profile.digital ? 'mobile' : 'venue';
export function calendar(selected, context, event = events.concert) {
  const [year, month] = event.month;
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const blanks = new Date(year, month - 1, 1).getDay(), days = new Date(year, month, 0).getDate();
  return `<div class="calendar"><div class="month">${year}. ${String(month).padStart(2, '0')}</div><div class="calendar-grid">${weekdays.map(day => `<span class="weekday">${day}</span>`).join('')}${'<span></span>'.repeat(blanks)}${Array.from({ length: days }, (_, i) => {
    const day = i + 1, date = event.dates.find(d => d.day === day);
    return date ? `<button data-date="${date.id}" data-calendar="${context}" class="available ${selected === date.id ? 'selected' : ''}" aria-label="${date.label}" aria-pressed="${selected === date.id}">${day}</button>` : `<span class="unavailable">${day}</span>`;
  }).join('')}</div></div>`;
}
