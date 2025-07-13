import React from "react";
import { Icon } from "./Icon";
import { useNewsStore } from "@/store/newsStore";

interface NewsBannerProps {
  onOpenNewsModal: () => void;
}

export const NewsBanner: React.FC<NewsBannerProps> = ({ onOpenNewsModal }) => {
  const { items, dismissBanner, bannerDismissed, hasUnreadNews } =
    useNewsStore();

  // Si el banner está desestimado o no hay noticias no leídas, no mostramos nada
  if (bannerDismissed || !hasUnreadNews()) return null;

  // Obtener la primera noticia funcional no leída para mostrar en el banner
  const firstUnreadFunctionalNews = items.find(
    (item) => item.category === "functional" && !item.read
  );

  if (!firstUnreadFunctionalNews) return null;

  const handleOpenBanner = () => {
    onOpenNewsModal();
    dismissBanner();
  };

  return (
    <div className="news-banner">
      <div className="news-banner__icon">
        <Icon name="bell" size={16} />
      </div>
      <div className="news-banner__content">
        <span className="news-banner__message">
          Nuevas funcionalidades disponibles
        </span>
        <button
          className="news-banner__action"
          onClick={handleOpenBanner}
          type="button"
        >
          <span>Ver Novedades</span>
        </button>
      </div>
      <button
        className="news-banner__close"
        onClick={() => dismissBanner()}
        aria-label="Cerrar"
        type="button"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
};
