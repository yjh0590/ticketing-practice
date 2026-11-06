// Public-guide-based desktop layouts, not snapshots of authenticated booking pages.
export const providers = {
  nol: {
    id: 'nol', name: 'NOL · 인터파크', brand: 'NOL 티켓',
    steps: ['관람일/회차선택', '좌석 선택', '가격/할인선택', '배송선택/주문자확인', '결제하기'],
    seatAction: '좌석선택완료', nextAction: '다음단계', summaryTitle: 'My예매정보',
    sources: ['https://help.interpark.com/ticket', 'https://www.ksponco.or.kr/menu.es?mid=a20301020000'],
  },
  yes24: {
    id: 'yes24', name: 'YES24 티켓', brand: 'YES24 TICKET',
    steps: ['날짜/시간 선택', '좌석 선택', '할인/쿠폰 선택', '수령방법 선택', '결제방법 선택'],
    seatAction: '좌석선택 완료', nextAction: '다음단계', summaryTitle: '나의 예매정보',
    sources: ['https://m.ticket.yes24.com/UserGuide/Booking?type=booking'],
  },
};
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
