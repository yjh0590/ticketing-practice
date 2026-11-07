// Public-guide-based desktop layouts, not snapshots of authenticated booking pages.
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
};
export const paymentMethods = profile => profile.methods || [['card', '신용카드'], ['bank', '무통장입금']];
export const seatStep = profile => profile.flow.indexOf('seats');
export const initialDelivery = profile => profile.digital ? 'mobile' : 'venue';
export const dates = [
  { id: '2026-12-12', day: 12, label: '2026.12.12 (토)', time: '18:00' },
  { id: '2026-12-13', day: 13, label: '2026.12.13 (일)', time: '17:00' },
];
export function calendar(selected, context) {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `<div class="calendar"><div class="month">2026. 12</div><div class="calendar-grid">${weekdays.map(day => `<span class="weekday">${day}</span>`).join('')}${'<span></span>'.repeat(2)}${Array.from({ length: 31 }, (_, i) => {
    const day = i + 1, date = dates.find(d => d.day === day);
    return date ? `<button data-date="${date.id}" data-calendar="${context}" class="available ${selected === date.id ? 'selected' : ''}" aria-label="${date.label}" aria-pressed="${selected === date.id}">${day}</button>` : `<span class="unavailable">${day}</span>`;
  }).join('')}</div></div>`;
}
