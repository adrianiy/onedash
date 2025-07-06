import React from "react";
import { Icon, type IconName } from "../../common/Icon";

interface EmptyPlaceholderProps {
  iconName: IconName;
  text: string;
  onClick: () => void;
  referenceProps?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forwardedRef?: React.Ref<any>;
  className?: string;
}

export const EmptyPlaceholder: React.FC<EmptyPlaceholderProps> = ({
  iconName,
  text,
  onClick,
  referenceProps,
  forwardedRef,
  className = "",
}) => {
  // Utilizamos notación BEM para las clases CSS
  const baseClass = "empty-placeholder";

  return (
    <button
      ref={forwardedRef}
      onClick={onClick}
      {...referenceProps}
      className={`${baseClass} ${baseClass}--clickable ${className}`}
    >
      <div className={`${baseClass}__content`}>
        <Icon name={iconName} size={16} className={`${baseClass}__icon`} />
        <p>{text}</p>
      </div>
    </button>
  );
};
