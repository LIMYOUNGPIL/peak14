// 비교에 담아 둔 루트 목록 (사용자의 브라우저에만 보관한다. 서버에는 보내지 않는다)
//
// 최대 2개. 화면 부품이 목록 변화를 구독할 수 있게 useSyncExternalStore 용 함수를 함께 둔다.

const KEY = "peak14.compare";
export const MAX_COMPARE = 2;
const EVENT = "peak14:compare-change";

// 저장된 값에서 올바른 루트 id 만 골라 낸다. (손상된 값, 중복, 3개 이상을 걸러 낸다)
export function parseStored(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    const ids = v.filter((x): x is string => typeof x === "string" && /^[a-z0-9-]{1,80}$/.test(x));
    return [...new Set(ids)].slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
}

// useSyncExternalStore 는 같은 값이면 같은 참조를 돌려줘야 하므로, 글자(JSON)로 비교한다.
export function getSnapshot(): string {
  return JSON.stringify(parseStored(window.localStorage.getItem(KEY)));
}
export const getServerSnapshot = () => "[]";

export function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function save(ids: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX_COMPARE)));
  window.dispatchEvent(new Event(EVENT));
}

export function addToCompare(id: string): "added" | "full" | "exists" {
  const ids = parseStored(window.localStorage.getItem(KEY));
  if (ids.includes(id)) return "exists";
  if (ids.length >= MAX_COMPARE) return "full";
  save([...ids, id]);
  return "added";
}
export function removeFromCompare(id: string) {
  save(parseStored(window.localStorage.getItem(KEY)).filter((x) => x !== id));
}
export function clearCompare() {
  save([]);
}
