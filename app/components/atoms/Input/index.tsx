import { InputHTMLAttributes, useState } from 'react';

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
  ...props
}: InputProps) => {
  const [internalError, setInternalError] = useState<string | undefined>();
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
