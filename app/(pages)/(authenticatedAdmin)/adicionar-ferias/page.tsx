'use client';

import { useEffect, useState } from 'react';
import Container from '@/app/components/atoms/container';
import { feriasService } from '@/services/ferias';
import { userService, UserData } from '@/services/user';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { feriasValidations } from '@/utils/validations/feriasValidations';
import ValidationMessage from '@/app/components/atoms/ValidationMessage';
import { ValidationResult } from '@/utils/validations/userValidations';

export default function AdicionarFerias() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});
  const [showValidations, setShowValidations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getAll();
        if (response.usuarios) {
          setUsers(response.usuarios);
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showErrorToast('Erro ao carregar lista de usuários');
      }
    };
    fetchUsers();
  }, []);
  
  const validateField = (fieldName: string, value: string) => {
    let validation;
    if (fieldName === 'descricao') {
      validation = feriasValidations.validateDescricao(value);
    } else if (fieldName === 'dataInicio') {
      validation = feriasValidations.validateDataInicio(value);
      // Re-validate dataFim if dataInicio changes
      if (formData.dataFim) {
        validateField('dataFim', formData.dataFim);
      }
    } else if (fieldName === 'dataFim') {
      validation = feriasValidations.validateDataFim(value, formData.dataInicio);
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

    const formValidations = feriasValidations.validateForm(formData);
    const hasErrors = formValidations.some(v => !v.isValid);

    if (hasErrors) {
      showErrorToast('Por favor, corrija os erros antes de enviar.');
      return;
    }
    
    try {
      const dataInicio = new Date(formData.dataInicio);
      const dataFim = new Date(formData.dataFim);
      dataInicio.setUTCHours(0, 0, 0, 0);
      dataFim.setUTCHours(23, 59, 59, 999);

      const feriasPayload = {
        dscFerias: formData.descricao,
        datIncioFerias: dataInicio.toISOString(),
        datFimFerias: dataFim.toISOString(),
        idUsuario: selectedUserId ? parseInt(selectedUserId) : null
      };

      await feriasService.cadastrarFerias(feriasPayload);
      showSuccessToast('Férias cadastradas com sucesso!');
      router.push('/dashboard/ferias'); 
    } catch (error) {
      console.error('Erro ao cadastrar férias:', error);
      showErrorToast('Erro ao cadastrar férias. Tente novamente.');
    }
  };

  const isFormValid = () => {
    const requiredFieldsValid = formData.descricao && formData.dataInicio && formData.dataFim;
    return Object.values(validations).every(v => v.isValid) && requiredFieldsValid;
  };

  return (
    <Container className='h-screen flex items-center justify-center'>
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Adicionar Novo Período de Férias</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="descricao" className="block text-sm font-medium text-black">
              Descrição *
            </label>
            <input
              id="descricao"
              name="descricao"
              type="text"
              placeholder="Digite a descrição das férias"
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
            <label htmlFor="dataInicio" className="block text-sm font-medium text-black">
              Data de Início *
            </label>
            <input
              id="dataInicio"
              name="dataInicio"
              type="date"
              required
              value={formData.dataInicio || ''}
              onChange={(e) => handleFieldChange('dataInicio', e.target.value)}
              onBlur={(e) => handleFieldBlur('dataInicio', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                (showValidations.dataInicio && validations.dataInicio && !validations.dataInicio.isValid)
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            <ValidationMessage
              isValid={validations.dataInicio?.isValid ?? false}
              message={validations.dataInicio?.message ?? ''}
              show={!!(showValidations.dataInicio && validations.dataInicio)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dataFim" className="block text-sm font-medium text-black">
              Data de Fim *
            </label>
            <input
              id="dataFim"
              name="dataFim"
              type="date"
              required
              value={formData.dataFim || ''}
              onChange={(e) => handleFieldChange('dataFim', e.target.value)}
              onBlur={(e) => handleFieldBlur('dataFim', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                (showValidations.dataFim && validations.dataFim && !validations.dataFim.isValid)
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            <ValidationMessage
              isValid={validations.dataFim?.isValid ?? false}
              message={validations.dataFim?.message ?? ''}
              show={!!(showValidations.dataFim && validations.dataFim)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="idUsuario" className="block text-sm font-medium text-black">
              Usuário (opcional)
            </label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full text-gray-600">
                <SelectValue placeholder="Selecione um usuário (opcional)" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {users.map((user) => (
                  <SelectItem key={user.idUsuario} value={user.idUsuario.toString()}>
                    {user.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            Cadastrar Férias
          </button>
        </form>
      </div>
    </Container>
  );
} 