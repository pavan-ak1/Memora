import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ placeholder, value, onChange, type = "text", className = "", ...rest }, ref) {
    return (
      <div className="w-full">
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          className={`px-4 py-3 border border-gray-300 rounded-lg w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className || ''}`}
          {...rest}
        />
      </div>
    );
  }
);
