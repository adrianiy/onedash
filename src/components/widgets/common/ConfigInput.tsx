import React from "react";

interface ConfigInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ConfigInput: React.FC<ConfigInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`config-field ${className}`}>
      <label htmlFor={id} className="config-label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="config-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
};
