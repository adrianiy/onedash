import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  description,
  actions,
  padding = "md",
  shadow = "sm",
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-sm",
    md: "p-md",
    lg: "p-lg",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  return (
    <div
      className={`
        bg-surface border border-radius transition
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${className}
      `}
    >
      {(title || description || actions) && (
        <div className="flex justify-between items-start mb-md">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-primary mb-xs">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-secondary">{description}</p>
            )}
          </div>
          {actions && <div className="ml-md">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
