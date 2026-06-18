import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type InputType = "text" | "email" | "password" | "date" | "number" | "textarea" | "select";
type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  type?: InputType;
  size?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  options?: { value: string; label: string }[];
}

const sizeStyles: Record<InputSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      size = "md",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      options,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      w-full rounded-lg border bg-white
      outline-none transition-all duration-200
      focus:ring-2 focus:ring-offset-0
      disabled:cursor-not-allowed disabled:opacity-50
      ${fullWidth ? "" : "max-w-md"}
    `;

    const stateStyles = error
      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
      : "border-slate-200 focus:border-brand focus:ring-brand/20";

    const inputStyles = `${baseStyles} ${stateStyles} ${sizeStyles[size]} ${className}`;

    const inputElement = type === "textarea" ? (
      <textarea
        ref={ref as any}
        className={`${inputStyles} resize-y min-h-[80px]`}
        disabled={disabled}
        {...(props as any)}
      />
    ) : type === "select" ? (
      <select
        ref={ref as any}
        className={inputStyles}
        disabled={disabled}
        {...(props as any)}
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        ref={ref}
        type={type}
        className={inputStyles}
        disabled={disabled}
        {...props}
      />
    );

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <div className={leftIcon ? "pl-10" : ""}>{inputElement}</div>
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-rose-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
