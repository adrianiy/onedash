import { Icon } from "@/common/Icon";
import Head from "next/head";
import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

type ErrorPageProps = {
  title?: string;
  message: string;
  requiresAuth?: boolean;
};

export const ErrorPage: React.FC<ErrorPageProps> = ({
  title = "ONE - Error",
  message,
  requiresAuth = true,
}) => {
  const router = useRouter();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const Content = () => (
    <div className="page-error">
      <div className="page-error__container">
        <div className="page-error__content">
          <Icon name="alert-circle" className="page-error__icon" size={48} />
          <p className="page-error__text">{message}</p>
          <div className="page-error__actions">
            <button
              className="page-error__button page-error__button--back"
              onClick={handleGoBack}
            >
              <Icon
                name="corner-up-left"
                size={16}
                className="page-error__button-icon"
              />
              <span>Volver atrás</span>
            </button>
            <button
              className="page-error__button page-error__button--home"
              onClick={handleGoHome}
            >
              <Icon
                name="layout-dashboard"
                size={16}
                className="page-error__button-icon"
              />
              <span>Ir al inicio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      {requiresAuth ? (
        <ProtectedRoute>
          <Content />
        </ProtectedRoute>
      ) : (
        <Content />
      )}
    </>
  );
};
