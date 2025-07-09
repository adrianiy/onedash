import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Card } from "../components/common/Card";
import { Icon } from "../components/common/Icon";
import { useAuthStore } from "../store/authStore";

export default function Register() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading, error, clearError } =
    useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard/default");
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    // Validación del nombre
    if (!name) {
      errors.name = "El nombre es obligatorio";
      isValid = false;
    } else if (name.length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
      isValid = false;
    }

    // Validación del email
    if (!email) {
      errors.email = "El email es obligatorio";
      isValid = false;
    } else if (!/^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      errors.email = "El formato del email no es válido";
      isValid = false;
    }

    // Validación de la contraseña
    if (!password) {
      errors.password = "La contraseña es obligatoria";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    // Validación de confirmación de contraseña
    if (!confirmPassword) {
      errors.confirmPassword = "Por favor confirma tu contraseña";
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    await register(name, email, password);
  };

  return (
    <div className="auth-page">
      <Card className="auth-page__card" padding="lg" shadow="md">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__icon-wrapper">
            <Icon name="user-plus" size={36} className="auth-form__icon" />
          </div>

          <h2 className="auth-form__title">Crear cuenta</h2>

          {/* Mensaje de error general */}
          {error && (
            <div className="auth-form__error" role="alert">
              {error}
            </div>
          )}

          {/* Campo de nombre */}
          <div className="auth-form__input-group">
            <label htmlFor="name" className="auth-form__label">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              className={`auth-form__input ${
                validationErrors.name ? "error" : ""
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              disabled={isLoading}
            />
            {validationErrors.name && (
              <div className="auth-form__error">{validationErrors.name}</div>
            )}
          </div>

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

          {/* Campo de confirmación de contraseña */}
          <div className="auth-form__input-group">
            <label htmlFor="confirmPassword" className="auth-form__label">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`auth-form__input ${
                validationErrors.confirmPassword ? "error" : ""
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {validationErrors.confirmPassword && (
              <div className="auth-form__error">
                {validationErrors.confirmPassword}
              </div>
            )}
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            className="auth-form__button"
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Crear cuenta"}
          </button>

          {/* Footer con link a login */}
          <div className="auth-form__footer">
            ¿Ya tienes una cuenta?
            <Link href="/login" className="auth-form__link">
              Iniciar sesión
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
