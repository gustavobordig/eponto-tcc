'use client';

import { SelectHTMLAttributes, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  error?: string;
  onSelectChange?: (value: string) => void;
}

const Select = ({
  label,
  options,
  containerClassName = '',
  labelClassName = '',
  selectClassName = '',
  error: externalError,
  onSelectChange,
  ...props
}: SelectProps) => {
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
        <select
          {...props}
          className={`
            w-full
            px-4
            py-3
            rounded-lg
            border
            border-gray-200
            text-gray-700
            focus:outline-none
            focus:border-[#D97745]
            transition-all
            appearance-none
            bg-white
            ${selectClassName}
            ${externalError ? 'border-red-500' : ''}
          `}
          onChange={(e) => {
            const value = e.target.value;
            
            if (onSelectChange) {
              onSelectChange(value);
            }
            if (props.onChange) {
              props.onChange(e);
            }
          }}
        >
          <option value="">Selecione uma opção</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={20}
        />
      </div>

      {externalError && (
        <span className="text-red-500 text-sm mt-1">
          {externalError}
        </span>
      )}
    </div>
  );
};

export default Select; 