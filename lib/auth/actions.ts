"use server";

// 로그인·가입·로그아웃 (서버에서 실행)
//
// Design Ref: §5.3 — 로그인 → 성공 시 원래 보던 화면으로 돌아간다.
// 비밀번호는 우리가 저장하지 않는다. Supabase 로그인 서비스가 맡는다. (PRD 7번)

import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/server";
import { t } from "@/lib/i18n/messages";
import { credentialsSchema, safeNextPath } from "./validation";

export type AuthFormState = { error: string | null };

function parse(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (parsed.success) return { data: parsed.data, error: null };

  // 어떤 칸이 틀렸는지 알려 준다. 입력한 값은 돌려보내지 않는다.
  const fields = parsed.error.issues.map((i) => i.path[0]);
  return {
    data: null,
    error: fields.includes("email")
      ? t("auth.invalidEmail")
      : t("auth.shortPassword"),
  };
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { data, error } = parse(formData);
  if (!data) return { error };

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword(data);
  if (signInError) {
    // 이메일이 없는지 비밀번호가 틀렸는지는 구분해 알려 주지 않는다.
    return { error: t("auth.wrongCredentials") };
  }

  redirect(safeNextPath(formData.get("next")));
}

export async function signup(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { data, error } = parse(formData);
  if (!data) return { error };

  const supabase = await createClient();
  const { data: result, error: signUpError } = await supabase.auth.signUp(data);
  if (signUpError || !result.user) {
    return { error: t("auth.signupFailed") };
  }

  // 메일 인증을 끈 개발 중에는 가입하면 바로 로그인된 상태가 된다.
  // 메일 인증을 켜 두면 session 이 비어 있으므로 로그인 화면으로 보낸다.
  redirect(result.session ? safeNextPath(formData.get("next")) : "/login");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
