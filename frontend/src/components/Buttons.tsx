import type { ReactElement } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary";
  text: string;
  fullWidth?: boolean;
  startIcon?: ReactElement;
  onClick: () => void;
  loading?: boolean;
  className?: string;
}

const variantClasses = {
  primary: "bg-purple-600 text-white hover:bg-purple-700",
  secondary: "bg-purple-200 text-purple-600 hover:bg-purple-300",
};

const defaultStyles = "px-4 py-2 rounded-md font-light flex items-center justify-center transition";

export function Button({
  variant,
  text,
  startIcon,
  onClick,
  fullWidth = false,
  loading = false,
  className = "",
  ...rest
}: ButtonProps) {
  const widthClass = fullWidth ? "w-full" : "w-fit";
  const isDisabled = loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${variantClasses[variant]} ${defaultStyles} ${widthClass} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {loading ? (
        <div className="animate-pulse">Loading...</div>
      ) : (
        <>
          {startIcon && <div className="pr-2">{startIcon}</div>}
          {text}
        </>
      )}
    </button>
  );
}
