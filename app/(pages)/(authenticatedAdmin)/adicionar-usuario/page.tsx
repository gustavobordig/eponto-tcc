'use client';

import { userService } from '@/services/user';
import { regexPatterns } from '@/utils/regexPatterns';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { listCargos } from '@/services/cargo';
import { jornadaTrabalhoService } from '@/services/jornadaTrabalho';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userValidations, ValidationResult } from '@/utils/userValidations';
import ValidationMessage from '@/app/components/atoms/ValidationMessage';

interface Cargo {
  idCargo: number;
  nomeCargo: string;
}

interface Jornada {
  idJornada: number;
  nomeJornada: string;
}

export default function AdicionarUsuario() {

  const router = useRouter();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [selectedCargo, setSelectedCargo] = useState<string>('');
  const [selectedJornada, setSelectedJornada] = useState<string>('');
  
  // Estados para validação
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});
  const [showValidations, setShowValidations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [cargosResponse, jornadasResponse] = await Promise.all([
          listCargos(),
          jornadaTrabalhoService.listar()
        ]);
        setCargos(cargosResponse.cargos || []);
        setJornadas(jornadasResponse.jornadas || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showErrorToast('Erro ao carregar dados dos selects');
      }
    };

    carregarDados();
  }, []);

  // Função para validar campo específico
  const validateField = (fieldName: string, value: string) => {
    let validation: ValidationResult;

    switch (fieldName) {
      case 'name':
        validation = userValidations.validateName(value);
        break;
      case 'email':
        validation = userValidations.validateEmail(value);
        break;
      case 'dataNascimento':
        validation = userValidations.validateBirthDate(value);
        break;
      case 'telefone':
        validation = userValidations.validatePhone(value);
        break;
      case 'password':
        validation = userValidations.validatePassword(value);
        break;
      default:
        validation = { isValid: true, message: '' };
    }

    setValidations(prev => ({
      ...prev,
      [fieldName]: validation
    }));

    return validation.isValid;
  };

  // Função para lidar com mudanças nos campos (apenas atualiza o valor)
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Função para lidar quando o usuário termina de digitar (onBlur)
  const handleFieldBlur = (fieldName: string, value: string) => {
    // Mostra validação apenas quando o usuário termina de digitar
    setShowValidations(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Valida o campo
    validateField(fieldName, value);
  };

  // Função para lidar com mudanças nos selects
  const handleSelectChange = (fieldName: string, value: string) => {
    if (fieldName === 'cargo') {
      setSelectedCargo(value);
    } else if (fieldName === 'jornada') {
      setSelectedJornada(value);
    }

    // Mostra validação apenas quando o usuário seleciona algo (valor não vazio)
    if (value !== '') {
      setShowValidations(prev => ({
        ...prev,
        [fieldName]: true
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Validação completa antes do envio
      const allValidations = userValidations.validateForm(formData, selectedCargo, selectedJornada);
      const hasErrors = allValidations.some(v => !v.isValid);

      if (hasErrors) {
        const errorMessages = allValidations
          .filter(v => !v.isValid)
          .map(v => v.message)
          .join(', ');
        
        showErrorToast(`Por favor, corrija os seguintes erros: ${errorMessages}`);
        return;
      }

      const userData = {
        idUsuario: 0, // Será gerado pelo backend
        nome: formData.name,
        email: formData.email,
        senha: formData.password,
        dataNascimento: formData.dataNascimento,
        telefone: formData.telefone ? parseInt(formData.telefone.replace(/\D/g, '')) : 0,
        idCargo: parseInt(selectedCargo),
        idJornada: parseInt(selectedJornada),
        indAtivo: 1
      };

      const response = await userService.create(userData);
      
      if (response.sucesso) {
        showSuccessToast('Usuário cadastrado com sucesso!');
        router.push('/dashboard');
      } else {
        showErrorToast(response.mensagem || 'Erro ao cadastrar usuário');
      }
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      showErrorToast('Erro ao cadastrar usuário. Por favor, tente novamente.');
    }
  };

  // Verifica se o formulário está válido
  const isFormValid = () => {
    const requiredFields = ['name', 'email', 'dataNascimento', 'password'];
    const allRequiredFilled = requiredFields.every(field => 
      formData[field] && formData[field].trim() !== ''
    );
    
    const allValidationsValid = Object.values(validations).every(v => v.isValid);
    const selectsValid = selectedCargo && selectedJornada;
    
    return allRequiredFilled && allValidationsValid && selectsValid;
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Adicionar Novo Usuário
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Preencha os dados do usuário com atenção às validações
          </p>
        </div>
        <div className="mt-8">
          <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl text-black font-bold mb-6 text-center">Cadastro de Usuário</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Campo Nome */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-black">
                  Nome *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Digite o nome completo"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={(e) => handleFieldBlur('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                    validations.name && showValidations.name
                      ? validations.name.isValid
                        ? 'border-green-500 focus:ring-green-200'
                        : 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                />
                <ValidationMessage
                  isValid={validations.name?.isValid ?? false}
                  message={validations.name?.message ?? ''}
                  show={!!(showValidations.name && validations.name)}
                />
              </div>

              {/* Campo Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-black">
                  E-mail *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Digite o e-mail"
                  required
                  value={formData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={(e) => handleFieldBlur('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                    validations.email && showValidations.email
                      ? validations.email.isValid
                        ? 'border-green-500 focus:ring-green-200'
                        : 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                />
                <ValidationMessage
                  isValid={validations.email?.isValid ?? false}
                  message={validations.email?.message ?? ''}
                  show={!!(showValidations.email && validations.email)}
                />
              </div>

              {/* Campo Data de Nascimento */}
              <div className="space-y-2">
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-black">
                  Data de Nascimento *
                </label>
                <input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  required
                  value={formData.dataNascimento || ''}
                  onChange={(e) => handleFieldChange('dataNascimento', e.target.value)}
                  onBlur={(e) => handleFieldBlur('dataNascimento', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                    validations.dataNascimento && showValidations.dataNascimento
                      ? validations.dataNascimento.isValid
                        ? 'border-green-500 focus:ring-green-200'
                        : 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                />
                <ValidationMessage
                  isValid={validations.dataNascimento?.isValid ?? false}
                  message={validations.dataNascimento?.message ?? ''}
                  show={!!(showValidations.dataNascimento && validations.dataNascimento)}
                />
              </div>

              {/* Campo Telefone */}
              <div className="space-y-2">
                <label htmlFor="telefone" className="block text-sm font-medium text-black">
                  Telefone (opcional)
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="text"
                  placeholder="Digite o telefone"
                  value={formData.telefone || ''}
                  onChange={(e) => handleFieldChange('telefone', e.target.value)}
                  onBlur={(e) => handleFieldBlur('telefone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                    validations.telefone && showValidations.telefone
                      ? validations.telefone.isValid
                        ? 'border-green-500 focus:ring-green-200'
                        : 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                />
                <ValidationMessage
                  isValid={validations.telefone?.isValid ?? false}
                  message={validations.telefone?.message ?? ''}
                  show={!!(showValidations.telefone && validations.telefone)}
                />
              </div>

              {/* Campo Cargo */}
              <div className="space-y-2">
                <label htmlFor="cargo" className="block text-sm font-medium text-black">
                  Cargo *
                </label>
                <Select
                  value={selectedCargo}
                  onValueChange={(value) => handleSelectChange('cargo', value)}
                >
                  <SelectTrigger className="w-full text-gray-600">
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo.idCargo} value={cargo.idCargo.toString()}>
                        {cargo.nomeCargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ValidationMessage
                  isValid={!!selectedCargo}
                  message={selectedCargo ? 'Cargo selecionado' : 'Cargo é obrigatório'}
                  show={!!(showValidations.cargo && selectedCargo !== '')}
                />
              </div>

              {/* Campo Jornada */}
              <div className="space-y-2">
                <label htmlFor="jornada" className="block text-sm font-medium text-black">
                  Jornada de Trabalho *
                </label>
                <Select
                  value={selectedJornada}
                  onValueChange={(value) => handleSelectChange('jornada', value)}
                >
                  <SelectTrigger className="w-full text-gray-600">
                    <SelectValue placeholder="Selecione a jornada de trabalho" />
                  </SelectTrigger>
                  <SelectContent>
                    {jornadas.map((jornada) => (
                      <SelectItem key={jornada.idJornada} value={jornada.idJornada.toString()}>
                        {jornada.nomeJornada}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ValidationMessage
                  isValid={!!selectedJornada}
                  message={selectedJornada ? 'Jornada selecionada' : 'Jornada de trabalho é obrigatória'}
                  show={!!(showValidations.jornada && selectedJornada !== '')}
                />
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-black">
                  Senha *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Digite a senha"
                  required
                  value={formData.password || ''}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={(e) => handleFieldBlur('password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-600 placeholder:text-gray-600 ${
                    validations.password && showValidations.password
                      ? validations.password.isValid
                        ? 'border-green-500 focus:ring-green-200'
                        : 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                />
                <ValidationMessage
                  isValid={validations.password?.isValid ?? false}
                  message={validations.password?.message ?? ''}
                  show={!!(showValidations.password && validations.password)}
                />
                <div className="mt-2 text-xs text-gray-600">
                  <p>A senha deve conter:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li className={validations.password && showValidations.password && /.{8,}/.test(formData.password || '') ? 'text-green-600' : 'text-gray-500'}>
                      Pelo menos 8 caracteres
                    </li>
                    <li className={validations.password && showValidations.password && /(?=.*[a-z])/.test(formData.password || '') ? 'text-green-600' : 'text-gray-500'}>
                      Uma letra minúscula
                    </li>
                    <li className={validations.password && showValidations.password && /(?=.*[A-Z])/.test(formData.password || '') ? 'text-green-600' : 'text-gray-500'}>
                      Uma letra maiúscula
                    </li>
                    <li className={validations.password && showValidations.password && /(?=.*\d)/.test(formData.password || '') ? 'text-green-600' : 'text-gray-500'}>
                      Um número
                    </li>
                    <li className={validations.password && showValidations.password && /(?=.*[@$!%*?&])/.test(formData.password || '') ? 'text-green-600' : 'text-gray-500'}>
                      Um caractere especial (@$!%*?&)
                    </li>
                  </ul>
                </div>
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
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 