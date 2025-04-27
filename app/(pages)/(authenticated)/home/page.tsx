"use client"; 

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAllTimeRecords } from "@/services/timeRecord";
import { tokenUtils } from "@/utils/token";

// Assets
import UserImage from "@/public/images/User.png";
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
  const [location, setLocation] = useState<string>("Carregando localização...");
  const [locationError, setLocationError] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [points, setPoints] = useState<Point[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const { nome } = JSON.parse(userData);
      setUserName(nome);
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
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
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
    { type: "entrada" as PointType, icon: <LogIn className="w-6 h-6" />, label: "Entrada", time: "08:00" },
    { type: "inicio_almoco" as PointType, icon: <Coffee className="w-6 h-6" />, label: "Início Almoço", time: "12:00" },
    { type: "fim_almoco" as PointType, icon: <UtensilsCrossed className="w-6 h-6" />, label: "Fim Almoço", time: "13:00" },
    { type: "saida" as PointType, icon: <LogOut className="w-6 h-6" />, label: "Saída", time: "17:00" },
  ];

  const handleMarkPoint = () => {
    const currentPoint = getCurrentPoint();
    if (currentPoint) {
      setPoints([...points, { type: currentPoint, timestamp: new Date().toISOString() }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageEntrance>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              {/* First Row: User Info and Time */}
              <div className="flex flex-col md:flex-row items-center  justify-center md:justify-between">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-[#002085]">
                    <Image src={UserImage} alt="User" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-2 items-center md:items-start">
                    <h1 className="text-2xl font-bold text-[#002085]">{getGreeting()}, {userName}!</h1>
                    <p className="text-gray-500 text-sm">Bem-vindo de volta</p>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-end my-2 md:my-0 gap-2 text-gray-500">
                  <Clock className="w-5 h-5" />
                  <span className="text-3xl font-bold text-[#002085]">
                    {format(currentTime, "HH:mm")}
                  </span>
                </div>
              </div>

              {/* Second Row: Date and Location */}
              <div className="flex flex-col md:flex-row gap-2 items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {format(currentTime, "EEEE',' d 'de' MMMM',' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-5 h-5" />
                  <span className="truncate max-w-[200px] md:max-w-[300px]">{locationError || location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Actions Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-[#002085]">Ações</h2>
              <div className="flex flex-col gap-3">
                <Button
                  text="Bater Ponto"
                  backgroundColor="bg-[#002085]"
                  className="w-full"
                  textColor="text-white"
                  onClick={handleMarkPoint}
                />
                <Button
                  text="Editar localização"
                  icon={<MapPin className="w-4 h-4" />}
                  backgroundColor="bg-transparent"
                  className="w-full border border-[#002085]"
                  textColor="text-[#002085]"
                  onClick={() => {}}
                />
              </div>
            </div>

            {/* Points Status Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#002085] mb-4">Pontos do Dia</h2>
              <div className="grid grid-cols-4 gap-4">
                {loading ? (
                  <div className="col-span-4 text-center text-gray-500">
                    Carregando pontos...
                  </div>
                ) : (
                  timeIndicators.map((indicator, index) => {
                    const isCurrentPoint = indicator.type === currentPoint;
                    const isMarked = points.some(point => point.type === indicator.type);
                    const point = points.find(point => point.type === indicator.type);
                    const time = point ? format(new Date(point.timestamp), "HH:mm") : indicator.time;
                    
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                          isCurrentPoint 
                            ? "bg-green-100 text-green-600" 
                            : isMarked 
                              ? "bg-gray-100 text-[#002085]" 
                              : "bg-gray-50 text-gray-400"
                        }`}>
                          {indicator.icon}
                        </div>
                        <span className={`text-xs ${isCurrentPoint ? "text-green-600 font-semibold" : "text-[#002085]"}`}>
                          {indicator.label}
                        </span>
                        <span className={`text-sm font-semibold ${isCurrentPoint ? "text-green-600" : "text-[#002085]"}`}>
                          {time}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Punctuality Status Card */}
            <DailyStatus points={points} />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Hours Balance Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#002085] mb-4">Saldo de Horas</h2>
              <div className="h-64">
                <HoursBalanceChart data={mockMonthlyData.hours} />
              </div>
            </div>

            {/* Punctuality Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#002085] mb-4">Pontualidade</h2>
              <div className="h-64">
                <PunctualityChart data={mockMonthlyData.punctuality} />
              </div>
            </div>
          </div>
        </div>
      </PageEntrance>
    </div>
  );
} 