import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import { signup } from "@/lib/auth/actions";
import { safeNextPath } from "@/lib/auth/validation";
import { t } from "@/lib/i18n/messages";

export default function SignupPage({ searchParams }: PageProps<"/signup">) {
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-6 py-12">
      <Suspense fallback={<p className="text-zinc-500">{t("common.loading")}</p>}>
        <SignupForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SignupForm({
  searchParams,
}: {
  searchParams: PageProps<"/signup">["searchParams"];
}) {
  const { next } = await searchParams;

  return (
    <AuthForm
      action={signup}
      mode="signup"
      next={safeNextPath(next)}
      text={{
        title: t("auth.signupTitle"),
        email: t("auth.email"),
        password: t("auth.password"),
        passwordHint: t("auth.passwordHint"),
        submit: t("auth.signupButton"),
        working: t("auth.working"),
        switchLabel: t("auth.toLogin"),
      }}
    />
  );
}
