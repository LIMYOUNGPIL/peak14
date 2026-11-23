import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import { login } from "@/lib/auth/actions";
import { safeNextPath } from "@/lib/auth/validation";
import { t } from "@/lib/i18n/messages";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-6 py-12">
      <Suspense fallback={<p className="text-zinc-500">{t("common.loading")}</p>}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const { next } = await searchParams;

  return (
    <AuthForm
      action={login}
      mode="login"
      next={safeNextPath(next)}
      text={{
        title: t("auth.loginTitle"),
        email: t("auth.email"),
        password: t("auth.password"),
        passwordHint: t("auth.passwordHint"),
        submit: t("auth.loginButton"),
        working: t("auth.working"),
        switchLabel: t("auth.toSignup"),
      }}
    />
  );
}
