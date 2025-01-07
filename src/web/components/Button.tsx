// src/web/components/Button.tsx
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  type?: "button" | "submit" | "reset";
}

export const Button = ({
  children,
  onClick,
  disabled = false,
  className = "",
  variant = "default",
  type = "button",
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
    outline:
      "border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-500",
    ghost: "hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-500",
    link: "text-indigo-600 hover:underline focus-visible:ring-indigo-500",
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
};
