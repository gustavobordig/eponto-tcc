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
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={props.id} className={`text-[13px] font-semibold text-foreground ${labelClassName}`}>
          {label}
        </label>
      )}
      
      <textarea
        {...props}
        className={`
          min-h-[76px] w-full resize-none rounded-[10px] border border-line-strong bg-white px-3.5 py-2.5 text-sm text-foreground
          placeholder:text-subtle
          transition-[border-color,box-shadow]
          focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-soft
          ${textareaClassName}
          ${error ? 'border-danger' : ''}
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
        <span className="text-[13px] text-danger-ink">
          {error}
        </span>
      )}
    </div>
  );
};

export default TextArea; 