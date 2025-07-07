'use client';

import Container from '@/app/components/atoms/container';
import { jornadaTrabalhoService } from '@/services/jornadaTrabalho';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { jornadaValidations } from '@/utils/jornadaValidations';
import ValidationMessage from '@/app/components/atoms/ValidationMessage';
import { ValidationResult } from '@/utils/validations/userValidations';

export default function AdicionarJornada() {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});
  const [showValidations, setShowValidations] = useState<Record<string, boolean>>({});

  const validateField = (fieldName: string, value: string) => {
    let validation;
    if (fieldName === 'nome') {
      validation = jornadaValidations.validateNomeJornada(value);
    } else if (fieldName === 'horasDiarias') {
      validation = jornadaValidations.validateHorasDiarias(value);
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

    const formValidations = jornadaValidations.validateForm({
      nome: formData.nome,
      horasDiarias: formData.horasDiarias
    });
    const hasErrors = formValidations.some(v => !v.isValid);

    if (hasErrors) {
      showErrorToast('Por favor, corrija os erros antes de enviar.');
      // Mostra todas as validações para o usuário
      const newShowValidations: Record<string, boolean> = {};
      const newValidations: Record<string, ValidationResult> = {};
      formValidations.forEach(val => {
        const fieldName = val.message.includes('nome') ? 'nome' : 'horasDiarias';
        newShowValidations[fieldName] = true;
        newValidations[fieldName] = val;
      });
      setShowValidations(newShowValidations);
      setValidations(newValidations);
      return;
    }
    
    try {
      const jornadaPayload = {
        nomeJornada: formData.nome,
        qtdHorasDiarias: Number(formData.horasDiarias),
      };

      await jornadaTrabalhoService.inserir(jornadaPayload);
      showSuccessToast('Jornada cadastrada com sucesso!');
      router.push('/dashboard/jornada-trabalho');
    } catch (error) {
      console.error('Erro ao cadastrar jornada:', error);
      showErrorToast('Erro ao cadastrar jornada. Tente novamente.');
    }
  };

  const isFormValid = () => {
    return Object.values(validations).every(v => v.isValid) &&
           formData.nome && formData.horasDiarias;
  };

  return (
    <Container className='h-screen flex items-center justify-center'>
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Adicionar Nova Jornada</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-medium text-black">
              Nome da Jornada *
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              placeholder="Digite o nome da jornada"
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
            <label htmlFor="horasDiarias" className="block text-sm font-medium text-black">
              Quantidade de Horas Diárias *
            </label>
            <input
              id="horasDiarias"
              name="horasDiarias"
              type="number"
              placeholder="Digite a quantidade de horas diárias"
              required
              value={formData.horasDiarias || ''}
              onChange={(e) => handleFieldChange('horasDiarias', e.target.value)}
              onBlur={(e) => handleFieldBlur('horasDiarias', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                (showValidations.horasDiarias && validations.horasDiarias && !validations.horasDiarias.isValid)
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            <ValidationMessage
              isValid={validations.horasDiarias?.isValid ?? false}
              message={validations.horasDiarias?.message ?? ''}
              show={!!(showValidations.horasDiarias && validations.horasDiarias)}
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
            Cadastrar Jornada
          </button>
        </form>
      </div>
    </Container>
  );
} 