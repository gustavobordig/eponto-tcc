'use client';

import { InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  regex?: RegExp;
  error?: string;
  onInputChange?: (value: string) => void;
  regexErrorMessage?: string;
}

const Input = ({
  label,
  icon,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  iconClassName = '',
  error: externalError,
  onInputChange,
  regex,
  regexErrorMessage = 'Valor inválido',
  type,
  ...props
}: InputProps) => {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const error = externalError || internalError;

  const validateInput = (value: string) => {
    if (regex) {
      const regexPattern = new RegExp(regex);
      if (!regexPattern.test(value)) {
        setInternalError(regexErrorMessage);
      } else {
        setInternalError(undefined);
      }
    }
  };

  const isPassword = type === 'password';

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={props.id} className={`text-[13px] font-semibold text-foreground ${labelClassName}`}>
          {label}
        </label>
      )}

      <div className="relative w-full">
        {icon && (
          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-muted [&_svg]:h-[17px] [&_svg]:w-[17px] ${iconClassName}`}>
            {icon}
          </div>
        )}
        
        <input
          {...props}
          type={isPassword && showPassword ? 'text' : type}
          className={`
            h-12 w-full rounded-[10px] border border-line-strong bg-surface px-3.5 text-[15px] font-medium text-foreground
            placeholder:font-normal placeholder:text-subtle
            transition-[border-color,box-shadow]
            focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-soft
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-11' : ''}
            ${inputClassName}
            ${error ? 'border-danger focus:border-danger focus:ring-danger-soft' : ''}
          `}
          aria-invalid={Boolean(error)}
          onChange={(e) => {
            const value = e.target.value;
            
            if (onInputChange) {
              onInputChange(value);
            }
            if (props.onChange) {
              props.onChange(e);
            }
          }}
          onBlur={(e) => {
            const value = e.target.value;
            validateInput(value);
            
            if (props.onBlur) {
              props.onBlur(e);
            }
          }}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-[13px] text-danger-ink">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
