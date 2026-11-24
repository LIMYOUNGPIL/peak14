"use server";

// 계정 삭제 (PRD 7번: 사용자가 요청하면 계정과 본인이 쓴 후기, 즐겨찾기를 삭제한다)
//
// 로그인한 본인만 자기 계정을 지울 수 있다. 사용자 번호는 서버가 로그인 증명서로 확인하고 화면에서 받지 않는다.
// 저장소의 연결 규칙(on delete cascade)으로 프로필·후기·즐겨찾기가 함께 지워진다.
// 삭제 요청 기록(외부 글 삭제 요청)은 사용자와 무관하므로 건드리지 않는다.

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/db/admin";
import { createClient } from "@/lib/db/server";
import { getCurrentUser } from "./session";

export type DeleteAccountState = { error: string | null };

export async function deleteAccount(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Faccount");

  // 실수로 누르지 않도록 확인 글자를 직접 입력하게 한다. (한국어·영어 화면 모두 같은 단어)
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") {
    return { error: "confirm" };
  }

  const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (error) return { error: "failed" };

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
