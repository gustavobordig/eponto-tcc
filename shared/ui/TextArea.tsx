'use client';

import { TextareaHTMLAttributes, useState } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  containerClassName?: string;
  labelClassName?: string;
  textareaClassName?: string;
  regex?: RegExp;
  error?: string;
  onTextareaChange?: (value: string) => void;
  regexErrorMessage?: string;
}

const TextArea = ({
  label,
  containerClassName = '',
  labelClassName = '',
  textareaClassName = '',
  error: externalError,
  onTextareaChange,
  regex,
  regexErrorMessage = 'Valor inválido',
  ...props
}: TextAreaProps) => {
  const [internalError, setInternalError] = useState<string | undefined>();
  const error = externalError || internalError;

  const validateTextarea = (value: string) => {
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
      
      <textarea
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
          resize-none
          min-h-[100px]
          ${textareaClassName}
          ${error ? 'border-red-500' : ''}
        `}
        onChange={(e) => {
          const value = e.target.value;
          
          if (onTextareaChange) {
            onTextareaChange(value);
          }
          if (props.onChange) {
            props.onChange(e);
          }
        }}
        onBlur={(e) => {
          const value = e.target.value;
          validateTextarea(value);
          
          if (props.onBlur) {
            props.onBlur(e);
          }
        }}
      />

      {error && (
        <span className="text-red-500 text-sm mt-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default TextArea; 