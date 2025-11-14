"use client"; 

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAllTimeRecords } from "@/services/timeRecord";
import { tokenUtils } from "@/utils/token";
import { bancoHorasService } from "@/services/bancoHoras";
import { formatHorasTrabalhadas, formatSaldo } from "@/utils/timeUtils";
import { useLanguage } from "@/app/contexts/LanguageContext";

// Icons
import { LogIn, Coffee, UtensilsCrossed, LogOut, MapPin, Clock, Calendar } from "lucide-react";

// Components
import { HoursBalanceChart } from "@/app/components/atoms/HoursBalanceChart";
import { PunctualityChart } from "@/app/components/atoms/PunctualityChart";
import Button from "@/app/components/atoms/Button";
import { PageEntrance } from "@/app/Animations/pageEntrance";
import { DailyStatus, Point, PointType } from "@/app/components/atoms/DailyStatus";

interface ApiRegistroPonto {
  id_Usuario: number;
  horaRegistro: string;
  dataRegistro: string;
  idTipoRegistroPonto: number;
}

const mockMonthlyData = {
  hours: [
    { date: "2024-02", balance: 2 },
    { date: "2024-03", balance: -1 },
  ],
  punctuality: [
    { date: "2024-02", late: 2, early: 1 },
    { date: "2024-03", late: 1, early: 0 },
  ],
};

export default function Home() {
  const { t, language } = useLanguage();
  const [location, setLocation] = useState<string>("Carregando localização...");
  const [locationError, setLocationError] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [points, setPoints] = useState<Point[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [bancoHoras, setBancoHoras] = useState<{
    horasTrabalhadas: string;
    saldo: string;
  } | null>(null);
  const [userPhoto, setUserPhoto] = useState<string>("/images/User.png");

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const { nome } = JSON.parse(userData);
      setUserName(nome);
    }
    
    // Carregar foto do usuário do localStorage
    const savedPhoto = localStorage.getItem('userProfilePhoto');
    if (savedPhoto) {
      setUserPhoto(savedPhoto);
    }
  }, []);

  useEffect(() => {
    // Atualizar horário a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Obter localização
    const getLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`
        );
        
        const data = await response.json();
        setLocation(data.display_name || "Localização não disponível");
      } catch (error) {
        console.error('Erro ao obter localização:', error);
        setLocationError("Não foi possível obter sua localização");
        setLocation("Localização não disponível");
      }
    };

    getLocation();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const userId = tokenUtils.getId();
        if (!userId) return;

        const response = await getAllTimeRecords();
        if (response.sucesso && response.registros) {
          // Filtra apenas os registros do usuário atual e do dia atual
          const today = new Date().toISOString().split('T')[0];
          const userRegistros = response.registros.filter(
            (reg: ApiRegistroPonto) => 
              reg.id_Usuario === Number(userId) && 
              reg.dataRegistro.split('T')[0] === today
          );

          console.log('Registros filtrados:', userRegistros);
          console.log('IDs de tipo de registro:', userRegistros.map((reg: ApiRegistroPonto) => reg.idTipoRegistroPonto));

          // Converte os registros da API para o formato de Point
          const pontosConvertidos = userRegistros.map((reg: ApiRegistroPonto) => {
            const tipo = getPointTypeFromId(reg.idTipoRegistroPonto);
            console.log('Registro convertido:', {
              id: reg.idTipoRegistroPonto,
              tipo,
              hora: reg.horaRegistro
            });
            return {
              type: tipo,
              timestamp: reg.horaRegistro
            };
          });

          console.log("pontosConvertidos: ", pontosConvertidos);

          setPoints(pontosConvertidos);
        }
      } catch (error) {
        console.error('Erro ao buscar pontos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  useEffect(() => {
    const fetchBancoHoras = async () => {
      try {
        const userId = tokenUtils.getId();
        if (!userId) {
          console.log('ID do usuário não encontrado');
          return;
        }

        console.log('Buscando banco de horas para o usuário:', userId);
        const response = await bancoHorasService.obterSaldoAtual(Number(userId));
        console.log('Resposta do banco de horas:', response);

        if (response.sucesso && response.bancoHoras && response.bancoHoras.length > 0) {
          setBancoHoras({
            horasTrabalhadas: response.bancoHoras[0].horasTrabalhadas,
            saldo: response.bancoHoras[0].saldo
          });
        } else {
          console.log('Resposta sem dados de banco de horas:', response);
          setBancoHoras(null);
        }
      } catch (error) {
        console.error('Erro ao buscar banco de horas:', error);
        setBancoHoras(null);
      }
    };

    fetchBancoHoras();
  }, []);

  const getPointTypeFromId = (id: number): PointType => {
    console.log('Convertendo ID para tipo:', id);
    switch (id) {
      case 1:
        return "entrada";
      case 2:
        return "inicio_almoco";
      case 3:
        return "fim_almoco";
      case 4:
        return "saida";
      default:
        console.warn('ID de tipo de registro desconhecido:', id);
        throw new Error(`ID de tipo de registro inválido: ${id}`);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('home.good-morning');
    if (hour < 18) return t('home.good-afternoon');
    return t('home.good-evening');
  };

  const getCurrentPoint = (): PointType | null => {
    const markedTypes = points.map(point => point.type);
    if (!markedTypes.includes("entrada")) return "entrada";
    if (!markedTypes.includes("inicio_almoco")) return "inicio_almoco";
    if (!markedTypes.includes("fim_almoco")) return "fim_almoco";
    if (!markedTypes.includes("saida")) return "saida";
    return null;
  };

  const currentPoint = getCurrentPoint();

  const timeIndicators = [
    { type: "entrada" as PointType, icon: <LogIn className="w-6 h-6" />, label: t('home.entry'), time: "08:00" },
    { type: "inicio_almoco" as PointType, icon: <Coffee className="w-6 h-6" />, label: t('home.lunch-start'), time: "12:00" },
    { type: "fim_almoco" as PointType, icon: <UtensilsCrossed className="w-6 h-6" />, label: t('home.lunch-end'), time: "13:00" },
    { type: "saida" as PointType, icon: <LogOut className="w-6 h-6" />, label: t('home.exit'), time: "17:00" },
  ];

  const handleMarkPoint = () => {
    const currentPoint = getCurrentPoint();
    if (currentPoint) {
      setPoints([...points, { type: currentPoint, timestamp: new Date().toISOString() }]);
    }
  };

  const getSaldoColor = (saldo: string) => {
    const saldoFormatado = formatSaldo(saldo);
    if (saldoFormatado.startsWith('-')) return 'text-red-600';
    if (saldoFormatado.startsWith('+')) return 'text-green-600';
    return 'text-gray-900';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <PageEntrance>
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* First Row: User Info and Time */}
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-cover bg-center border-4 border-[#002085] flex-shrink-0"
                    style={{
                      backgroundImage: `url(${userPhoto})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="flex flex-col gap-1 sm:gap-2 items-center sm:items-start">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#002085] text-center sm:text-left">
                      {getGreeting()}, {userName}!
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">{t('home.welcome')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2 text-gray-500">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-2xl sm:text-3xl font-bold text-[#002085]">
                    {format(currentTime, "HH:mm")}
                  </span>
                </div>
              </div>

              {/* Second Row: Date and Location */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-center sm:justify-between border-t pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm sm:text-base">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-center sm:text-left">
                    {format(currentTime, "EEEE',' d 'de' MMMM',' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate max-w-[250px] sm:max-w-[300px] md:max-w-[400px] text-center sm:text-left">
                    {locationError || location}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Actions Card */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#002085]">{t('home.actions')}</h2>
              <div className="flex flex-col gap-2 sm:gap-3">
                <Button
                  text={t('home.punch-in')}
                  backgroundColor="bg-[#002085]"
                  className="w-full"
                  textColor="text-white"
                  onClick={handleMarkPoint}
                />
                <Button
                  text={t('home.edit-location')}
                  icon={<MapPin className="w-4 h-4" />}
                  backgroundColor="bg-transparent"
                  className="w-full border border-[#002085]"
                  textColor="text-[#002085]"
                  onClick={() => {}}
                />
              </div>
            </div>

            {/* Points Status Card */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold text-[#002085] mb-3 sm:mb-4">{t('home.daily-punches')}</h2>
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {loading ? (
                  <div className="col-span-4 text-center text-gray-500">
                    {t('common.loading')}
                  </div>
                ) : (
                  timeIndicators.map((indicator, index) => {
                    const isCurrentPoint = indicator.type === currentPoint;
                    const isMarked = points.some(point => point.type === indicator.type);
                    const point = points.find(point => point.type === indicator.type);
                    const time = point ? format(new Date(point.timestamp), "HH:mm") : indicator.time;
                    
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 ${
                          isCurrentPoint 
                            ? "bg-green-100 text-green-600" 
                            : isMarked 
                              ? "bg-gray-100 text-[#002085]" 
                              : "bg-gray-50 text-gray-400"
                        }`}>
                          {React.cloneElement(indicator.icon, { 
                            className: "w-5 h-5 sm:w-6 sm:h-6" 
                          })}
                        </div>
                        <span className={`text-[10px] sm:text-xs text-center ${isCurrentPoint ? "text-green-600 font-semibold" : "text-[#002085]"}`}>
                          {indicator.label}
                        </span>
                        <span className={`text-xs sm:text-sm font-semibold ${isCurrentPoint ? "text-green-600" : "text-[#002085]"}`}>
                          {time}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Punctuality Status Card */}
            {/* <DailyStatus points={points} /> */}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Punctuality Chart */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold text-[#002085] mb-3 sm:mb-4">Pontualidade</h2>
              <div className="h-48 sm:h-64">
                <PunctualityChart data={mockMonthlyData.punctuality} />
              </div>
            </div>
          </div>
        </div>
      </PageEntrance>
    </div>
  );
} 