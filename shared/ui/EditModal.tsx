import React, { useState, useEffect } from 'react';
import { EditModalField, ValidationResult } from '@/shared/types/ui';
import Modal, { BotaoModal } from '@/shared/ui/Modal';
import ValidationMessage from '@/shared/ui/ValidationMessage';

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

  // Sem regras de validação o formulário é válido. Antes exigia ao menos uma
  // regra, e Salvar ficava sempre desabilitado em usuários, jornadas e ajustes.
  const isFormValid = () => Object.values(validations).every(v => v.isValid);

  const erro = (field: EditModalField) =>
    showValidations[field.fieldName || ''] && validations[field.fieldName || ''] && !validations[field.fieldName || ''].isValid;
  const classeCampo = (field: EditModalField) =>
    `h-11 w-full rounded-[10px] border bg-surface px-3.5 text-[15px] font-medium text-foreground focus:outline-none focus:ring-4 ${
      field.readOnly ? 'cursor-not-allowed bg-background text-muted' : ''
    } ${erro(field) ? 'border-danger focus:ring-danger-soft' : 'border-line-strong focus:border-primary focus:ring-primary-soft'}`;

  return (
    <Modal
      isOpen
      onClose={onClose}
      titulo={title}
      bloqueado={loading}
      rodape={
        <>
          <BotaoModal variante="secundario" onClick={onClose} disabled={loading}>
            Cancelar
          </BotaoModal>
          {onConfirm && (
            <BotaoModal onClick={handleConfirm} disabled={loading || !isFormValid()}>
              {loading ? 'Processando...' : confirmText}
            </BotaoModal>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold">
              {field.label}
              {field.required !== false && <span className="ml-0.5 text-danger">*</span>}
            </label>
            {field.type === 'select' ? (
              <select
                value={field.value}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                onBlur={(e) => field.fieldName && handleFieldBlur(field.fieldName, e.target.value)}
                className={classeCampo(field)}
                disabled={field.readOnly}
                required={field.required}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
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
                className={classeCampo(field)}
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
    </Modal>
  );
};

export default EditModal;
