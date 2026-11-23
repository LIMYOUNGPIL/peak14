// 후기 등록 전 걸러내기 (PRD 5번: 욕설과 개인정보는 등록 전에 걸러 낸다)
//
// 화면·저장소에 의존하지 않는 순수 코드라 따로 시험할 수 있다. (tests/review-filter.test.mts)
// 걸린 이유만 돌려주고, 걸린 글 자체는 돌려주지 않는다. (개인정보를 다시 화면에 싣지 않기 위해서)
//
// 한계: 기본 목록과 모양 검사라서 모든 표현을 잡지는 못한다. PRD 결정에 따라
// 등록된 후기에 대한 신고·삭제 절차는 이번에 만들지 않았다. 배포 전에 다시 판단한다.

export type FilterReason = "profanity" | "phone" | "email" | "idNumber";

// 욕설: 한글은 글자 사이에 점·공백을 끼워도 잡도록 기호를 지운 글에서 찾는다.
// "새끼", "미친" 처럼 야크 새끼 등 정상 글에도 나오는 말은 일부러 목록에 넣지 않았다.
const KOREAN_PROFANITY = [
  "씨발", "시발", "씨팔", "시팔", "병신", "개새끼", "개색기", "지랄", "느금마",
  "미친놈", "미친년", "좆", "존나", "ㅅㅂ", "ㅂㅅ", "ㅈㄹ",
];
const ENGLISH_PROFANITY =
  /\b(fuck\w*|shit\w*|bitch\w*|asshole\w*|bastard\w*|cunt\w*|motherfuck\w*|dickhead\w*)\b/i;

// 전화번호: 휴대폰(010-1234-5678), 지역번호(02-123-4567), 국제번호(+82 10 1234 5678)
const MOBILE = /(?:\+?\d{1,3}[\s.-]?)?\(?0?1[016789]\)?[\s.-]?\d{3,4}[\s.-]?\d{4}/;
const LANDLINE = /\b0\d{1,2}[\s.)-]\d{3,4}[\s.-]\d{4}\b/;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
// 주민등록번호 모양: 6자리-7자리
const ID_NUMBER = /\b\d{6}[\s-]?[1-8]\d{6}\b/;
// 숫자가 이어진 긴 덩어리(카드번호 등): 구분 기호를 빼고 9자리 이상
const LONG_DIGITS = /(?<![\d.,])\d(?:[\s-]?\d){8,}(?![\d])/;

function digitsIn(text: string): number {
  return (text.match(/\d/g) ?? []).length;
}

export function checkReviewText(text: string): FilterReason[] {
  const reasons = new Set<FilterReason>();

  const squashed = text.toLowerCase().replace(/[\s._\-*~!@#$%^&()+=[\]{}|\\:;"'<>,?/·]/g, "");
  if (KOREAN_PROFANITY.some((w) => squashed.includes(w)) || ENGLISH_PROFANITY.test(text)) {
    reasons.add("profanity");
  }

  if (EMAIL.test(text)) reasons.add("email");
  if (ID_NUMBER.test(text)) reasons.add("idNumber");

  // 전화번호 모양이거나, 구분 기호를 빼고 숫자가 9자리 이상 이어지면 걸러 낸다.
  const phoneLike = MOBILE.exec(text) ?? LANDLINE.exec(text);
  if (phoneLike && digitsIn(phoneLike[0]) >= 9) reasons.add("phone");
  else {
    const long = LONG_DIGITS.exec(text);
    if (long && digitsIn(long[0]) >= 9) reasons.add("phone");
  }

  return [...reasons];
}
