import * as React from "react";
import classNames from "classnames";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}) => {
  return (
    <button
      className={classNames(
        "rounded-md font-medium focus:outline-none focus:ring transition-all",
        variant === "default" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "outline" && "border border-gray-300 text-gray-700 hover:bg-gray-100",
        variant === "ghost" && "text-gray-600 hover:bg-gray-100",
        size === "sm" && "px-2 py-1 text-sm",
        size === "md" && "px-4 py-2",
        size === "lg" && "px-6 py-3 text-lg",
        size === "icon" && "p-2 w-9 h-9 flex items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

