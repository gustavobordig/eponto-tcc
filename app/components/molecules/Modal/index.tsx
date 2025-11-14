import React, { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone } from 'date-fns-tz';
import UserImage from "@/public/images/User.png";
import { LogIn, Coffee, UtensilsCrossed, LogOut, MapPin } from "lucide-react";
import { SlideUp } from "@/app/Animations/sliderUp";
import { insertTimeRecord } from "@/services/timeRecord";

// Atoms
import Button from "@/app/components/atoms/Button";
import { tokenUtils } from "@/utils/token";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

type PointType = "entrada" | "inicio_almoco" | "fim_almoco" | "saida";

interface Point {
  type: PointType;
  timestamp: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  userImage?: string;
  points?: Point[];
}

// Fake data for demonstration
const fakePoints: Point[] = [
  { type: "entrada", timestamp: "2024-03-20T08:00:00" },
  { type: "inicio_almoco", timestamp: "2024-03-20T12:00:00" },
  // { type: 'fim_almoco', timestamp: '2024-03-20T13:00:00' },
  // { type: 'saida', timestamp: '2024-03-20T17:00:00' },
];

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userImage = UserImage.src,
  points = fakePoints,
}) => {
  const [location, setLocation] = useState<string>("Carregando localização...");
  const [locationError, setLocationError] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  

  useEffect(() => {
    if (!isOpen) {
      // Reset states when modal closes
      setLocation("Carregando localização...");
      setLocationError("");
      setIsLoadingLocation(true);
      return;
    }

    const getLocation = async () => {
      setIsLoadingLocation(true);
      setLocationError("");
      
      try {
        // Verificar se a geolocalização está disponível
        if (!navigator.geolocation) {
          throw new Error("Geolocalização não suportada pelo navegador");
        }

        // Get user's coordinates
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            reject, 
            {
              enableHighAccuracy: true,
              timeout: 10000, // Aumentado para 10 segundos
              maximumAge: 0
            }
          );
        });

        // Convert coordinates to address using OpenStreetMap's Nominatim API
        // Adiciona delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`,
          {
            headers: {
              'User-Agent': 'MK-Ponto-App/1.0',
              'Accept': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          // Se for erro 429 (rate limit), tenta novamente após delay
          if (response.status === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const retryResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`,
              {
                headers: {
                  'User-Agent': 'MK-Ponto-App/1.0',
                  'Accept': 'application/json'
                }
              }
            );
            
            if (!retryResponse.ok) {
              throw new Error(`Erro na API após retry: ${retryResponse.status}`);
            }
            
            const retryData = await retryResponse.json();
            if (retryData && retryData.display_name) {
              setLocation(retryData.display_name);
              setLocationError("");
              setIsLoadingLocation(false);
              return;
            }
          }
          
          throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.display_name) {
          setLocation(data.display_name);
          setLocationError("");
        } else {
          // Se não tiver display_name, tenta usar outros campos
          const address = data.address;
          if (address) {
            const addressParts = [
              address.road,
              address.house_number,
              address.neighbourhood || address.suburb,
              address.city || address.town || address.village,
              address.state
            ].filter(Boolean);
            
            if (addressParts.length > 0) {
              setLocation(addressParts.join(", "));
              setLocationError("");
            } else {
              setLocation("Localização não disponível");
              setLocationError("Endereço não encontrado");
            }
          } else {
            setLocation("Localização não disponível");
            setLocationError("Endereço não encontrado");
          }
        }
      } catch (error: any) {
        console.error('Erro ao obter localização:', error);
        
        // Mensagens de erro mais específicas
        let errorMessage = "Não foi possível obter sua localização";
        
        if (error.code === 1) {
          errorMessage = "Permissão de localização negada. Por favor, permita o acesso à localização nas configurações do navegador.";
        } else if (error.code === 2) {
          errorMessage = "Localização indisponível. Verifique se o GPS está ativado.";
        } else if (error.code === 3) {
          errorMessage = "Tempo de espera esgotado ao obter localização.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setLocationError(errorMessage);
        setLocation("Localização não disponível");
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getLocation();
  }, [isOpen]);

  if (!isOpen) return null;

  const timeZone = 'America/Sao_Paulo';
  const currentTime = new Date();
  const formattedTime = formatInTimeZone(currentTime, timeZone, "HH:mm");
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };
  const greeting = `${getGreeting()}, ${userName}!`;

  const timeIndicators = [
    {
      type: "entrada" as PointType,
      icon: <LogIn className="w-6 h-6" />,
      label: "Entrada",
      time: "08:00",
    },
    {
      type: "inicio_almoco" as PointType,
      icon: <Coffee className="w-6 h-6" />,
      label: "Início Almoço",
      time: "12:00",
    },
    {
      type: "fim_almoco" as PointType,
      icon: <UtensilsCrossed className="w-6 h-6" />,
      label: "Fim Almoço",
      time: "13:00",
    },
    {
      type: "saida" as PointType,
      icon: <LogOut className="w-6 h-6" />,
      label: "Saída",
      time: "17:00",
    },
  ];

  const getCurrentPoint = (): PointType | null => {
    const markedTypes = points.map((point) => point.type);

    if (!markedTypes.includes("entrada")) return "entrada";
    if (!markedTypes.includes("inicio_almoco")) return "inicio_almoco";
    if (!markedTypes.includes("fim_almoco")) return "fim_almoco";
    if (!markedTypes.includes("saida")) return "saida";

    return null;
  };

  const currentPoint = getCurrentPoint();

  const handleConfirm = async () => {
    try {
      setIsRegistering(true);
      const currentPoint = getCurrentPoint();
      if (!currentPoint) {
        alert("Todos os pontos já foram registrados hoje!");
        return;
      }

      const now = new Date();
      const payload = {
        idUsuario: Number(tokenUtils.getId()),
        horaRegistro: formatInTimeZone(now, timeZone, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
        dataRegistro: formatInTimeZone(now, timeZone, "yyyy-MM-dd"),
        idTipoRegistroPonto: 1,
      };

      await insertTimeRecord(payload);
      showSuccessToast("Ponto registrado com sucesso!");
      onConfirm();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao registrar ponto:", error);
      showErrorToast("Erro ao registrar ponto. Tente novamente.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <SlideUp>
        <div className="bg-white rounded-lg p-6 sm:p-8 w-[90%] max-w-md shadow-xl relative z-10">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            {/* User Image */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#002085]">
              <Image
                src={userImage}
                alt={userName}
                fill
                className="object-cover"
              />
            </div>

            {/* Greeting Text */}
            <p className="text-xl font-semibold text-[#002085]">{greeting}</p>

            <div className="flex flex-col gap-2 justify-center items-center w-full px-2">
              {/* Location */}
              <div className={`flex items-start gap-2 text-sm w-full max-w-[320px] px-3 py-2.5 rounded-lg ${
                locationError ? "bg-red-50 border border-red-200" : isLoadingLocation ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-200"
              }`}>
                <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  locationError ? "text-red-500" : isLoadingLocation ? "text-blue-500" : "text-[#002085]"
                }`} />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  {isLoadingLocation ? (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 text-xs font-medium">Carregando localização...</span>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    </div>
                  ) : locationError ? (
                    <>
                      <span className="text-red-600 text-xs font-medium">Erro ao obter localização</span>
                      <span className="text-red-500 text-xs break-words leading-relaxed">{locationError}</span>
                    </>
                  ) : (
                    <span className="text-gray-700 text-xs break-words leading-relaxed font-medium">{location}</span>
                  )}
                </div>
              </div>

              {/* Date */}
              <p className="text-gray-500 text-sm">
                {format(currentTime, "EEEE',' d 'de' MMMM',' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>

            {/* Time */}
            <p className="text-5xl font-bold text-[#002085]">{formattedTime}</p>

            {/* Time Indicators */}
            <div className="grid grid-cols-4 gap-6 w-full mt-2 mb-8">
              {timeIndicators.map((indicator, index) => {
                const isCurrentPoint = indicator.type === currentPoint;
                const isMarked = points.some(
                  (point) => point.type === indicator.type
                );

                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center text-center transition-all duration-200 ${
                      isCurrentPoint ? "scale-110" : ""
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isCurrentPoint
                          ? "bg-green-100 text-green-600"
                          : isMarked
                          ? "bg-gray-100 text-[#002085]"
                          : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      {indicator.icon}
                    </div>
                    <span
                      className={`text-xs whitespace-nowrap ${
                        isCurrentPoint
                          ? "text-green-600 font-semibold"
                          : "text-[#002085]"
                      }`}
                    >
                      {indicator.label}
                    </span>
                    <span
                      className={`text-sm font-semibold whitespace-nowrap ${
                        isCurrentPoint ? "text-green-600" : "text-[#002085]"
                      }`}
                    >
                      {indicator.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 w-full">
              <Button
                text={isRegistering ? "Registrando..." : "Confirmar"}
                backgroundColor="bg-green-500"
                textColor="text-white"
                onClick={handleConfirm}
                hoverSwapColors={false}
                disabled={isRegistering}
              />
              <Button
                text="Cancelar"
                backgroundColor="bg-red-500"
                textColor="text-white"
                onClick={onClose}
                hoverSwapColors={false}
                disabled={isRegistering}
              />
            </div>
          </div>
        </div>
      </SlideUp>
    </div>
  );
};
