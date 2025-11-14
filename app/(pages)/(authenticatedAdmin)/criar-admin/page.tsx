'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userService, UserData } from '@/services/user';
import { profileService, ProfileData } from '@/services/profile';
import { listCargos } from '@/services/cargo';
import { jornadaTrabalhoService } from '@/services/jornadaTrabalho';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { userValidations, ValidationResult } from '@/utils/validations/userValidations';
import ValidationMessage from '@/app/components/atoms/ValidationMessage';
import { tokenUtils } from '@/utils/token';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function CriarAdminPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  // Estado para controlar o modo (criar novo ou vincular existente)
  const [mode, setMode] = useState<'create' | 'link'>('create');
  
  // Estados para validação
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});
  const [showValidations, setShowValidations] = useState<Record<string, boolean>>({});

  // Estados para perfis
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');

  // Estados para cargo e jornada
  const [cargos, setCargos] = useState<any[]>([]);
  const [jornadas, setJornadas] = useState<any[]>([]);
  const [selectedCargo, setSelectedCargo] = useState<string>('');
  const [selectedJornada, setSelectedJornada] = useState<string>('');

  // Estados para usuários existentes
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Carregando dados...');
        
        // Carregar perfis
        const profilesResponse = await profileService.getAll();
        console.log('Resposta dos perfis:', profilesResponse);
        
        if (profilesResponse.sucesso && profilesResponse.perfis) {
          setProfiles(profilesResponse.perfis);
          console.log('Perfis carregados:', profilesResponse.perfis);
        } else {
          console.log('Nenhum perfil encontrado ou erro na resposta');
          showErrorToast('Nenhum perfil encontrado');
        }

        // Carregar cargos
        const cargosResponse = await listCargos();
        console.log('Resposta dos cargos:', cargosResponse);
        
        if (cargosResponse.sucesso && cargosResponse.cargos) {
          setCargos(cargosResponse.cargos);
          console.log('Cargos carregados:', cargosResponse.cargos);
        } else {
          console.log('Nenhum cargo encontrado');
          showErrorToast('Nenhum cargo encontrado');
        }

        // Carregar jornadas
        const jornadasResponse = await jornadaTrabalhoService.listar();
        console.log('Resposta das jornadas:', jornadasResponse);
        
        if (jornadasResponse.sucesso && jornadasResponse.jornadas) {
          setJornadas(jornadasResponse.jornadas);
          console.log('Jornadas carregadas:', jornadasResponse.jornadas);
        } else {
          console.log('Nenhuma jornada encontrada');
          showErrorToast('Nenhuma jornada encontrada');
        }

        // Carregar usuários existentes
        const usersResponse = await userService.getAll();
        console.log('Resposta dos usuários:', usersResponse);
        
        if (usersResponse.sucesso && usersResponse.usuarios) {
          setUsers(usersResponse.usuarios);
          console.log('Usuários carregados:', usersResponse.usuarios);
        } else {
          console.log('Nenhum usuário encontrado');
          showErrorToast('Nenhum usuário encontrado');
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showErrorToast('Erro ao carregar dados do formulário');
      }
    };

    loadData();
  }, []);

  // Limpar estados quando o modo muda
  useEffect(() => {
    if (mode === 'create') {
      setSelectedUser('');
      setUserSearchTerm('');
    } else {
      setFormData({});
      setValidations({});
      setShowValidations({});
      setSelectedCargo('');
      setSelectedJornada('');
    }
  }, [mode]);

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

  // Função para lidar com mudanças nos campos
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Validar campo se já foi mostrado antes
    if (showValidations[fieldName]) {
      validateField(fieldName, value);
    }
  };

  // Função para lidar com blur (quando o usuário sai do campo)
  const handleFieldBlur = (fieldName: string) => {
    const value = formData[fieldName] || '';
    validateField(fieldName, value);
    
    setShowValidations(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (!selectedProfile) {
        showErrorToast('Por favor, selecione um perfil para o administrador');
        return;
      }

      if (mode === 'create') {
        // Validação completa antes do envio para modo criar
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

        if (!selectedCargo) {
          showErrorToast('Por favor, selecione um cargo para o administrador');
          return;
        }

        if (!selectedJornada) {
          showErrorToast('Por favor, selecione uma jornada de trabalho para o administrador');
          return;
        }

        // Criar usuário
        const userData: UserData = {
          idUsuario: 0,
          nome: formData.name,
          email: formData.email,
          senha: formData.password,
          dataNascimento: formData.dataNascimento,
          telefone: formData.telefone ? parseInt(formData.telefone.replace(/\D/g, '')) : 0,
          idCargo: parseInt(selectedCargo),
          idJornada: parseInt(selectedJornada),
          indAtivo: 1
        };

        const userResponse = await userService.create(userData);
        console.log('Resposta da criação do usuário:', userResponse);
        
        if (userResponse.sucesso) {
          console.log('Usuário criado com sucesso:', userResponse);
          
          // Tentar vincular perfil se possível
          try {
            let userId = null;
            
            if (userResponse.usuario && userResponse.usuario.idUsuario) {
              userId = userResponse.usuario.idUsuario;
            } else {
              // Buscar o usuário pelo email para obter o ID
              const usersResponse = await userService.getAll();
              if (usersResponse.sucesso && usersResponse.usuarios) {
                const createdUser = usersResponse.usuarios.find(u => u.email === formData.email);
                if (createdUser) {
                  userId = createdUser.idUsuario;
                }
              }
            }

            if (userId) {
              // Vincular usuário ao perfil selecionado
              const linkResponse = await profileService.linkUserToProfile({
                idUsuario: userId,
                idPerfil: parseInt(selectedProfile)
              });
              console.log('Resposta da vinculação do perfil:', linkResponse);
            }
          } catch (linkError) {
            console.error('Erro ao vincular perfil (não crítico):', linkError);
          }

          // Sempre mostrar sucesso se o usuário foi criado
          showSuccessToast(t('admin.administrator-created'));
          router.push('/dashboard');
        } else {
          console.error('Erro na criação do usuário:', userResponse);
          showErrorToast(userResponse.mensagem || 'Erro ao criar administrador');
        }
      } else {
        // Modo vincular usuário existente
        if (!selectedUser) {
          showErrorToast('Por favor, selecione um usuário para vincular como administrador');
          return;
        }

        // Vincular usuário existente ao perfil selecionado
        const linkResponse = await profileService.linkUserToProfile({
          idUsuario: parseInt(selectedUser),
          idPerfil: parseInt(selectedProfile)
        });
        
        console.log('Resposta da vinculação do perfil:', linkResponse);
        
        if (linkResponse.sucesso) {
          showSuccessToast(t('admin.administrator-linked'));
          router.push('/dashboard');
        } else {
          console.error('Erro na vinculação do perfil:', linkResponse);
          showErrorToast(linkResponse.mensagem || 'Erro ao vincular usuário como administrador');
        }
      }
    } catch (error) {
      console.error('Erro ao processar administrador:', error);
      showErrorToast('Erro ao processar administrador. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar usuários
  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Verifica se o formulário está válido
  const isFormValid = () => {
    if (mode === 'create') {
      const requiredFields = ['name', 'email', 'dataNascimento', 'password'];
      const allRequiredFilled = requiredFields.every(field => 
        formData[field] && formData[field].trim() !== ''
      );
      
      const allValidationsValid = Object.values(validations).every(v => v.isValid);
      const profileValid = selectedProfile && selectedProfile !== '';
      const cargoValid = selectedCargo && selectedCargo !== '';
      const jornadaValid = selectedJornada && selectedJornada !== '';
      
      return allRequiredFilled && allValidationsValid && profileValid && cargoValid && jornadaValid;
    } else {
      // Modo vincular usuário existente
      const profileValid = selectedProfile && selectedProfile !== '';
      const userValid = selectedUser && selectedUser !== '';
      
      return profileValid && userValid;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">
                {t('admin.create-administrator')}
              </h1>
              <p className="text-black">
                {t('admin.create-administrator-desc')}
              </p>
            </div>

            {/* Toggle entre criar novo e vincular existente */}
            <div className="mb-8">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    mode === 'create'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('admin.create-new')}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('link')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    mode === 'link'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('admin.link-existing')}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seção para vincular usuário existente */}
              {mode === 'link' && (
                <div className="space-y-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    {t('admin.select-existing-user')}
                  </h3>
                  
                  {/* Campo de busca */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {t('admin.search-user')}
                    </label>
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-black text-black"
                      placeholder={t('admin.placeholder.search-user')}
                    />
                  </div>

                  {/* Lista de usuários */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {t('admin.select-user')} *
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                    >
                      <option value="">{t('admin.select-user-option')}</option>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <option key={user.idUsuario} value={user.idUsuario}>
                            {user.nome} ({user.email})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>{t('admin.no-users-found')}</option>
                      )}
                    </select>
                    {filteredUsers.length === 0 && userSearchTerm && (
                      <p className="text-sm text-red-600 mt-1">
                        {t('admin.no-users-matching')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Campos para criação de novo usuário */}
              {mode === 'create' && (
                <>
                  {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('admin.full-name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-black text-black ${
                    showValidations.name && !validations.name?.isValid 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder={t('admin.placeholder.full-name')}
                />
                {showValidations.name && (
                  <ValidationMessage 
                    isValid={validations.name?.isValid || false} 
                    message={validations.name?.message || ''} 
                  />
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('admin.email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-black text-black ${
                    showValidations.email && !validations.email?.isValid 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder={t('admin.placeholder.email')}
                />
                {showValidations.email && (
                  <ValidationMessage 
                    isValid={validations.email?.isValid || false} 
                    message={validations.email?.message || ''} 
                  />
                )}
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('admin.birth-date')} *
                </label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento || ''}
                  onChange={(e) => handleFieldChange('dataNascimento', e.target.value)}
                  onBlur={() => handleFieldBlur('dataNascimento')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black ${
                    showValidations.dataNascimento && !validations.dataNascimento?.isValid 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                />
                {showValidations.dataNascimento && (
                  <ValidationMessage 
                    isValid={validations.dataNascimento?.isValid || false} 
                    message={validations.dataNascimento?.message || ''} 
                  />
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('admin.phone')}
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone || ''}
                  onChange={(e) => handleFieldChange('telefone', e.target.value)}
                  onBlur={() => handleFieldBlur('telefone')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-black text-black ${
                    showValidations.telefone && !validations.telefone?.isValid 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder={t('admin.placeholder.phone')}
                />
                {showValidations.telefone && (
                  <ValidationMessage 
                    isValid={validations.telefone?.isValid || false} 
                    message={validations.telefone?.message || ''} 
                  />
                )}
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('admin.password')} *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleFieldBlur('password')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-black text-black ${
                    showValidations.password && !validations.password?.isValid 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder={t('admin.placeholder.password')}
                />
                {showValidations.password && (
                  <ValidationMessage 
                    isValid={validations.password?.isValid || false} 
                    message={validations.password?.message || ''} 
                  />
                )}
              </div>

              {/* Cargo */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('admin.position')} *
                </label>
                <select
                  value={selectedCargo}
                  onChange={(e) => setSelectedCargo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                >
                  <option value="">{t('admin.select-position')}</option>
                  {cargos.length > 0 ? (
                    cargos.map((cargo) => (
                      <option key={cargo.idCargo} value={cargo.idCargo}>
                        {cargo.nomeCargo}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>{t('admin.loading-positions')}</option>
                  )}
                </select>
                {cargos.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    {t('admin.no-positions')}
                  </p>
                )}
              </div>

              {/* Jornada de Trabalho */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('admin.work-schedule-field')} *
                </label>
                <select
                  value={selectedJornada}
                  onChange={(e) => setSelectedJornada(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                >
                  <option value="">{t('admin.select-work-schedule')}</option>
                  {jornadas.length > 0 ? (
                    jornadas.map((jornada) => (
                      <option key={jornada.idJornada} value={jornada.idJornada}>
                        {jornada.nomeJornada}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>{t('admin.loading-schedules')}</option>
                  )}
                </select>
                {jornadas.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    {t('admin.no-schedules')}
                  </p>
                )}
              </div>

                </>
              )}

              {/* Perfil - Aparece em ambos os modos */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('admin.access-profile')} *
                </label>
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                >
                  <option value="">{t('admin.select-profile')}</option>
                  {profiles.length > 0 ? (
                    profiles.map((profile) => (
                      <option key={profile.idPerfil} value={profile.idPerfil}>
                        {profile.dscPerfil}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>{t('admin.loading-profiles')}</option>
                  )}
                </select>
                {profiles.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    {t('admin.no-profiles')}
                  </p>
                )}
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-black font-medium hover:bg-gray-50 transition-colors"
                >
                        {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isFormValid() && !loading
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading 
                    ? (mode === 'create' ? t('admin.creating') : t('admin.linking'))
                    : (mode === 'create' ? t('admin.create-administrator-btn') : t('admin.link-administrator-btn'))
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
