// 처음 열 때 보이는 로딩 화면
//
// 숫자는 실제로 내려받은 양을 따라 올라간다. (가짜 숫자가 아니다)
// 100%가 되면 숫자가 흐려지며 위로 사라지고, 화면이 열리면서 카메라가 날아 들어온다.

import { t } from "@/lib/i18n/messages";

type Props = {
  percent: number; // 0~100
  leaving: boolean; // true 이면 사라지는 중
};

export default function Preloader({ percent, leaving }: Props) {
  return (
    <div
      className={`hx-preloader ${leaving ? "is-leaving" : ""}`}
      role="status"
      aria-label={t("explore.loadingLabel")}
    >
      <p className="hx-preloader-logo">{t("common.siteName")}</p>
      <div className={`hx-preloader-count ${leaving ? "is-leaving" : ""}`}>
        <span className="hx-preloader-value">{Math.round(percent)}</span>
        <span className="hx-preloader-percent">%</span>
      </div>
    </div>
  );
}
