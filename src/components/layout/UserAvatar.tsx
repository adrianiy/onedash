import React from "react";

interface UserAvatarProps {
  name?: string;
  size?: number;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = "Usuario",
  size = 32,
  className = "",
}) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div
      className={`user-avatar ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
      title={name}
    >
      <span className="user-avatar-initials">{initials}</span>
    </div>
  );
};
