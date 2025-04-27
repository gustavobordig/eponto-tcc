import { InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  regex?: string;
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
    <div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
      {label && (
        <label 
          className={`text-gray-600 text-sm font-medium ${labelClassName}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        {icon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${iconClassName}`}>
            {icon}
          </div>
        )}
        
        <input
          {...props}
          type={isPassword && showPassword ? 'text' : type}
          className={`
            w-full
            px-4
            py-3
            rounded-lg
            border
            border-gray-200
            text-gray-700
            placeholder:text-gray-400
            focus:outline-none
            focus:border-[#D97745]
            transition-all
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${inputClassName}
            ${error ? 'border-red-500' : ''}
          `}
          onChange={(e) => {
            const value = e.target.value;
            validateInput(value);
            
            if (onInputChange) {
              onInputChange(value);
            }
            if (props.onChange) {
              props.onChange(e);
            }
          }}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-red-500 text-sm mt-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
