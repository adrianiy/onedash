import { Icon } from "@/common/Icon";
import { useAuthStore } from "@/store/authStore";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Login() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error, clearError } = useAuthStore();

  // Si ya está autenticado, redirigir a la página de carga
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/loading");
    }
  }, [isAuthenticated, router]);

  const handleOAuthLogin = async (provider: string) => {
    try {
      const result = await signIn(provider, {
        callbackUrl: "/loading",
        redirect: false,
      });

      if (result?.error) {
        console.error("OAuth login error:", result.error);
        clearError();
      } else if (result?.ok) {
        // Check session and update store
        const session = await getSession();
        if (session) {
          // Redirigir a la página de carga
          router.push("/loading");
        }
      }
    } catch (error) {
      console.error("OAuth login error:", error);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <form className="auth-form">
          <div className="auth-form__icon-wrapper">
            <Icon name="log-in" size={36} className="auth-form__icon" />
          </div>

          <h2 className="auth-form__title">Iniciar sesión</h2>

          {/* Mensaje de error general */}
          {error && (
            <div className="auth-form__error" role="alert">
              {error}
            </div>
          )}

          {/* Botones OAuth */}
          <div className="auth-form__oauth">
            <button
              type="button"
              className="auth-form__oauth-button auth-form__oauth-button--microsoft"
              onClick={() => handleOAuthLogin("azure-ad")}
              disabled={isLoading}
            >
              <Icon name="brand-microsoft" size={20} />
              Continuar con Microsoft
            </button>

            <button
              type="button"
              className="auth-form__oauth-button auth-form__oauth-button--google"
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
            >
              <Icon name="brand-google" size={20} />
              Continuar con Google
            </button>

            <button
              type="button"
              className="auth-form__oauth-button auth-form__oauth-button--github"
              onClick={() => handleOAuthLogin("github")}
              disabled={isLoading}
            >
              <Icon name="github" size={20} />
              Continuar con GitHub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
