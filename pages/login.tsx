import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, getSession } from "next-auth/react";
import { Card } from "../components/common/Card";
import { Icon } from "../components/common/Icon";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } =
    useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard/default");
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      errors.email = "El email es obligatorio";
      isValid = false;
    } else if (!/^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      errors.email = "El formato del email no es válido";
      isValid = false;
    }

    if (!password) {
      errors.password = "La contraseña es obligatoria";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    await login(email, password);
  };

  const handleOAuthLogin = async (provider: string) => {
    try {
      const result = await signIn(provider, {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        console.error("OAuth login error:", result.error);
      } else if (result?.ok) {
        // Check session and redirect
        const session = await getSession();
        if (session) {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("OAuth login error:", error);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-page__card" padding="lg" shadow="md">
        <form className="auth-form" onSubmit={handleSubmit}>
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

          {/* Campo de email */}
          <div className="auth-form__input-group">
            <label htmlFor="email" className="auth-form__label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`auth-form__input ${
                validationErrors.email ? "error" : ""
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={isLoading}
            />
            {validationErrors.email && (
              <div className="auth-form__error">{validationErrors.email}</div>
            )}
          </div>

          {/* Campo de contraseña */}
          <div className="auth-form__input-group">
            <label htmlFor="password" className="auth-form__label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className={`auth-form__input ${
                validationErrors.password ? "error" : ""
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {validationErrors.password && (
              <div className="auth-form__error">
                {validationErrors.password}
              </div>
            )}
          </div>

          {/* Botón de login */}
          <button
            type="submit"
            className="auth-form__button"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          {/* Separador OAuth */}
          <div className="auth-form__separator">
            <span className="auth-form__separator-line"></span>
            <span className="auth-form__separator-text">O</span>
            <span className="auth-form__separator-line"></span>
          </div>

          {/* Botones OAuth */}
          <div className="auth-form__oauth">
            <button
              type="button"
              className="auth-form__oauth-button auth-form__oauth-button--google"
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
            >
              <Icon name="google" size={20} />
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

            <button
              type="button"
              className="auth-form__oauth-button auth-form__oauth-button--microsoft"
              onClick={() => handleOAuthLogin("azure-ad")}
              disabled={isLoading}
            >
              <Icon name="microsoft" size={20} />
              Continuar con Microsoft
            </button>
          </div>

          {/* Footer con link a registro */}
          <div className="auth-form__footer">
            ¿No tienes una cuenta?
            <Link href="/register" className="auth-form__link">
              Regístrate
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
