import React, { useState, useEffect } from 'react';
import { EditModalField, ValidationResult } from '@/app/types';
import { X } from 'lucide-react';
import ValidationMessage from '../ValidationMessage';

interface EditModalProps {
  title: string;
  fields: EditModalField[];
  onClose: () => void;
  onConfirm?: () => void;
  loading?: boolean;
  confirmText?: string;
  validationConfigs?: { [key: string]: (value: string) => ValidationResult };
}

const EditModal: React.FC<EditModalProps> = ({
  title,
  fields,
  onClose,
  onConfirm,
  loading = false,
  confirmText = 'Salvar',
  validationConfigs = {}
}) => {
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});
  const [showValidations, setShowValidations] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Inicializa o formData com os valores dos campos
  useEffect(() => {
    const initialData: Record<string, string> = {};
    fields.forEach(field => {
      if (field.fieldName) {
        initialData[field.fieldName] = field.value;
      }
    });
    setFormData(initialData);
  }, [fields]);

  const validateField = (fieldName: string, value: string) => {
    const validationConfig = validationConfigs[fieldName];
    if (!validationConfig) {
      return { isValid: true, message: '' };
    }
    return validationConfig(value);
  };

  const handleFieldChange = (field: EditModalField, value: string) => {
    // Atualiza o formData
    if (field.fieldName) {
      setFormData(prev => ({ ...prev, [field.fieldName!]: value }));
    }

    // Chama o onChange original do campo
    const mockEvent = {
      target: { value }
    } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
    field.onChange(mockEvent);

    // Valida o campo se já foi tocado
    if (showValidations[field.fieldName || '']) {
      const validation = validateField(field.fieldName || '', value);
      setValidations(prev => ({ ...prev, [field.fieldName || '']: validation }));
    }
  };

  const handleFieldBlur = (fieldName: string, value: string) => {
    setShowValidations(prev => ({ ...prev, [fieldName]: true }));
    const validation = validateField(fieldName, value);
    setValidations(prev => ({ ...prev, [fieldName]: validation }));
  };

  const handleConfirm = () => {
    // Valida todos os campos antes de confirmar
    const newValidations: Record<string, ValidationResult> = {};
    const newShowValidations: Record<string, boolean> = {};
    let hasErrors = false;

    fields.forEach(field => {
      if (field.fieldName && field.required !== false) {
        const value = formData[field.fieldName] || '';
        const validation = validateField(field.fieldName, value);
        newValidations[field.fieldName] = validation;
        newShowValidations[field.fieldName] = true;
        
        if (!validation.isValid) {
          hasErrors = true;
        }
      }
    });

    setValidations(newValidations);
    setShowValidations(newShowValidations);

    if (!hasErrors && onConfirm) {
      onConfirm();
    }
  };

  const isFormValid = () => {
    return Object.values(validations).every(v => v.isValid) &&
           Object.keys(validationConfigs).length > 0;
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-blue-950">{title}</h2>
        
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required !== false && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  value={field.value}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  onBlur={(e) => field.fieldName && handleFieldBlur(field.fieldName, e.target.value)}
                  className={`w-full p-2 border rounded-md text-black ${
                    field.readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  } ${
                    (showValidations[field.fieldName || ''] && validations[field.fieldName || ''] && !validations[field.fieldName || ''].isValid)
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  disabled={field.readOnly}
                  required={field.required}
                >
                  {field.options?.map((option: any) => (
                    <option key={option.value} value={option.value} className="text-black">
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === 'date' ? 'date' : field.type || 'text'}
                  value={field.value}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  onBlur={(e) => field.fieldName && handleFieldBlur(field.fieldName, e.target.value)}
                  className={`w-full p-2 border rounded-md text-black ${
                    field.readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  } ${
                    (showValidations[field.fieldName || ''] && validations[field.fieldName || ''] && !validations[field.fieldName || ''].isValid)
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  readOnly={field.readOnly}
                  required={field.required}
                />
              )}
              {field.fieldName && (
                <ValidationMessage
                  isValid={validations[field.fieldName]?.isValid ?? false}
                  message={validations[field.fieldName]?.message ?? ''}
                  show={!!(showValidations[field.fieldName] && validations[field.fieldName])}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancelar
          </button>
          {onConfirm && (
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-md disabled:opacity-50 ${
                isFormValid() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={loading || !isFormValid()}
            >
              {loading ? 'Processando...' : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditModal;


