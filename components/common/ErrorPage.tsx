import { Icon } from "@/common/Icon";
import Head from "next/head";
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
  const Content = () => (
    <div className="page-error">
      <div className="page-error__container">
        <div className="page-error__content">
          <Icon name="alert-circle" className="page-error__icon" size={48} />
          <p className="page-error__text">{message}</p>
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
