import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import { signup } from "@/lib/auth/actions";
import { enabledProviders } from "@/lib/auth/providers";
import { loginWithProvider } from "@/lib/auth/social";
import { safeNextPath } from "@/lib/auth/validation";
import { getT } from "@/lib/i18n/server";

export default function SignupPage({ searchParams }: PageProps<"/signup">) {
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-6 py-12">
      <Suspense fallback={null}>
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
  const t = await getT();
  const { next, error } = await searchParams;
  const providers = enabledProviders().map((id) => ({
    id,
    label: id === "google" ? t("auth.withGoogle") : t("auth.withKakao"),
  }));

  return (
    <AuthForm
      action={signup}
      mode="signup"
      next={safeNextPath(next)}
      initialError={error === "social" ? t("auth.socialFailed") : null}
      social={{ action: loginWithProvider, providers, divider: t("auth.socialDivider") }}
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
