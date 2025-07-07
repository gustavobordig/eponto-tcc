'use client';

import Container from '@/app/components/atoms/container';
import { insertCargo } from '@/services/cargo';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cargoValidations } from '@/utils/validations/cargoValidations';
import ValidationMessage from '@/app/components/atoms/ValidationMessage';
import { ValidationResult } from '@/utils/validations/userValidations';

export default function AdicionarCargo() {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});
  const [showValidations, setShowValidations] = useState<Record<string, boolean>>({});

  const validateField = (fieldName: string, value: string) => {
    let validation;
    if (fieldName === 'nome') {
      validation = cargoValidations.validateNomeCargo(value);
    } else if (fieldName === 'formacaoMinima') {
      validation = cargoValidations.validateFormacaoMinima(value);
    } else if (fieldName === 'salario') {
      validation = cargoValidations.validateSalario(value);
    } else {
      validation = { isValid: true, message: '' };
    }
    setValidations(prev => ({ ...prev, [fieldName]: validation }));
    return validation.isValid;
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleFieldBlur = (fieldName: string, value: string) => {
    setShowValidations(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formValidations = cargoValidations.validateForm(formData);
    const hasErrors = formValidations.some(v => !v.isValid);

    if (hasErrors) {
      showErrorToast('Por favor, corrija os erros antes de enviar.');
      // Mostra todas as validações para o usuário
      const newShowValidations: Record<string, boolean> = {};
      const newValidations: Record<string, ValidationResult> = {};
      formValidations.forEach(val => {
        const fieldName = val.message.includes('nome') ? 'nome' : 'salario';
        newShowValidations[fieldName] = true;
        newValidations[fieldName] = val;
      });
      setShowValidations(newShowValidations);
      setValidations(newValidations);
      return;
    }
    
    try {
      const cargoPayload = {
        idCargo: 0,
        nomeCargo: formData.nome,
        salario: formData.salario,
        formacaoMinima: formData.formacaoMinima,
        indAtivo: 1
      };

      await insertCargo(cargoPayload);
      showSuccessToast('Cargo cadastrado com sucesso!');
      router.push('/dashboard/cargos');
    } catch (error) {
      console.error('Erro ao cadastrar cargo:', error);
      showErrorToast('Erro ao cadastrar cargo. Tente novamente.');
    }
  };

  const isFormValid = () => {
    return Object.values(validations).every(v => v.isValid) &&
           formData.nome && formData.formacaoMinima && formData.salario;
  };

  return (
    <Container className='h-screen flex items-center justify-center'>
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Adicionar Novo Cargo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-medium text-black">
              Nome do Cargo *
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              placeholder="Digite o nome do cargo"
              required
              value={formData.nome || ''}
              onChange={(e) => handleFieldChange('nome', e.target.value)}
              onBlur={(e) => handleFieldBlur('nome', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                (showValidations.nome && validations.nome && !validations.nome.isValid)
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            <ValidationMessage
              isValid={validations.nome?.isValid ?? false}
              message={validations.nome?.message ?? ''}
              show={!!(showValidations.nome && validations.nome)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="formacaoMinima" className="block text-sm font-medium text-black">
              Formação Mínima *
            </label>
            <input
              id="formacaoMinima"
              name="formacaoMinima"
              type="text"
              placeholder="Digite a formação mínima"
              required
              value={formData.formacaoMinima || ''}
              onChange={(e) => handleFieldChange('formacaoMinima', e.target.value)}
              onBlur={(e) => handleFieldBlur('formacaoMinima', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                (showValidations.formacaoMinima && validations.formacaoMinima && !validations.formacaoMinima.isValid)
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            <ValidationMessage
              isValid={validations.formacaoMinima?.isValid ?? false}
              message={validations.formacaoMinima?.message ?? ''}
              show={!!(showValidations.formacaoMinima && validations.formacaoMinima)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="salario" className="block text-sm font-medium text-black">
              Salário *
            </label>
            <input
              id="salario"
              name="salario"
              type="number"
              placeholder="Digite o salário"
              required
              value={formData.salario || ''}
              onChange={(e) => handleFieldChange('salario', e.target.value)}
              onBlur={(e) => handleFieldBlur('salario', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                (showValidations.salario && validations.salario && !validations.salario.isValid)
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            <ValidationMessage
              isValid={validations.salario?.isValid ?? false}
              message={validations.salario?.message ?? ''}
              show={!!(showValidations.salario && validations.salario)}
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid()}
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isFormValid() 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Cadastrar Cargo
          </button>
        </form>
      </div>
    </Container>
  );
}

