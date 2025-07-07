'use client';

import { useState } from 'react';
import Container from '@/app/components/atoms/container';
import { feriadoService } from '@/services/feriado';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { feriadoValidations } from '@/utils/feriadoValidations';
import ValidationMessage from '@/app/components/atoms/ValidationMessage';
import { ValidationResult } from '@/utils/validations/userValidations';

export default function AdicionarFeriado() {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});
  const [showValidations, setShowValidations] = useState<Record<string, boolean>>({});
  const [selectedTipo, setSelectedTipo] = useState<string>('');

  const validateField = (fieldName: string, value: string) => {
    let validation;
    if (fieldName === 'descricao') {
      validation = feriadoValidations.validateDescricao(value);
    } else if (fieldName === 'dataFeriado') {
      validation = feriadoValidations.validateDataFeriado(value);
    } else if (fieldName === 'tipoFeriado') {
      validation = feriadoValidations.validateTipoFeriado(value);
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
  
  const handleSelectChange = (value: string) => {
    setSelectedTipo(value);
    setShowValidations(prev => ({ ...prev, tipoFeriado: true }));
    validateField('tipoFeriado', value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formValidations = feriadoValidations.validateForm(formData, selectedTipo);
    const hasErrors = formValidations.some(v => !v.isValid);

    if (hasErrors) {
      showErrorToast('Por favor, corrija os erros antes de enviar.');
      return;
    }
    
    try {
      const dataFeriado = new Date(formData.dataFeriado);
      dataFeriado.setUTCHours(0, 0, 0, 0);

      const feriadoPayload = {
        dscFeriado: formData.descricao,
        datFeriado: dataFeriado.toISOString(),
        indTipoFeriado: parseInt(selectedTipo)
      };

      await feriadoService.cadastrarFeriado(feriadoPayload);
      showSuccessToast('Feriado cadastrado com sucesso!');
      router.push('/dashboard/feriados');
    } catch (error) {
      console.error('Erro ao cadastrar feriado:', error);
      showErrorToast('Erro ao cadastrar feriado. Tente novamente.');
    }
  };

  const isFormValid = () => {
    return Object.values(validations).every(v => v.isValid) &&
           formData.descricao && formData.dataFeriado && selectedTipo;
  };

  return (
    <Container className='h-screen flex items-center justify-center'>
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Adicionar Novo Feriado</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="descricao" className="block text-sm font-medium text-black">
              Descrição *
            </label>
            <input
              id="descricao"
              name="descricao"
              type="text"
              placeholder="Digite a descrição do feriado"
              required
              value={formData.descricao || ''}
              onChange={(e) => handleFieldChange('descricao', e.target.value)}
              onBlur={(e) => handleFieldBlur('descricao', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                (showValidations.descricao && validations.descricao && !validations.descricao.isValid)
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            <ValidationMessage
              isValid={validations.descricao?.isValid ?? false}
              message={validations.descricao?.message ?? ''}
              show={!!(showValidations.descricao && validations.descricao)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dataFeriado" className="block text-sm font-medium text-black">
              Data do Feriado *
            </label>
            <input
              id="dataFeriado"
              name="dataFeriado"
              type="date"
              required
              value={formData.dataFeriado || ''}
              onChange={(e) => handleFieldChange('dataFeriado', e.target.value)}
              onBlur={(e) => handleFieldBlur('dataFeriado', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                (showValidations.dataFeriado && validations.dataFeriado && !validations.dataFeriado.isValid)
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            <ValidationMessage
              isValid={validations.dataFeriado?.isValid ?? false}
              message={validations.dataFeriado?.message ?? ''}
              show={!!(showValidations.dataFeriado && validations.dataFeriado)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="tipoFeriado" className="block text-sm font-medium text-black">
              Tipo de Feriado *
            </label>
            <Select value={selectedTipo} onValueChange={handleSelectChange}>
              <SelectTrigger className={`w-full text-gray-600 ${
                (showValidations.tipoFeriado && !selectedTipo)
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}>
                <SelectValue placeholder="Selecione o tipo de feriado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Integral</SelectItem>
                <SelectItem value="2">Meio Período</SelectItem>
              </SelectContent>
            </Select>
            <ValidationMessage
              isValid={!!selectedTipo}
              message={validations.tipoFeriado?.message ?? ''}
              show={!!(showValidations.tipoFeriado && validations.tipoFeriado)}
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
            Cadastrar Feriado
          </button>
        </form>
      </div>
    </Container>
  );
} 