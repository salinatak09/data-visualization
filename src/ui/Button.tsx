import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  disabled?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-50 disabled:pointer-events-none px-4 py-2 text-sm";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-600",
    outline: "border border-blue-600 text-blue-700 hover:bg-blue-700 hover:text-white active:bg-blue-600",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}