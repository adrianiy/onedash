import { Icon } from "@/common/Icon";
import Head from "next/head";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

type LoaderPageProps = {
  title?: string;
  message?: string;
  requiresAuth?: boolean;
};

export const LoaderPage: React.FC<LoaderPageProps> = ({
  title = "ONE - Cargando",
  message = "Cargando dashboard...",
  requiresAuth = true,
}) => {
  const Content = () => (
    <div className="page-loader">
      <div className="page-loader__container">
        <div className="page-loader__content">
          <Icon name="loader" className="page-loader__icon" size={48} />
          <p className="page-loader__text">{message}</p>
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
