import React from "react";
import * as Tooltip from '@radix-ui/react-tooltip';
import { AlertCircle, LogIn, Coffee, UtensilsCrossed, LogOut } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";

export type PointType = "entrada" | "inicio_almoco" | "fim_almoco" | "saida";

export interface Point {
  type: PointType;
  timestamp: string;
}

interface DailyStatusProps {
  points: Point[];
}

const timeIndicators = [
  { type: "entrada" as PointType, icon: <LogIn className="w-6 h-6" />, label: "Entrada", time: "08:00" },
  { type: "inicio_almoco" as PointType, icon: <Coffee className="w-6 h-6" />, label: "Início Almoço", time: "12:00" },
  { type: "fim_almoco" as PointType, icon: <UtensilsCrossed className="w-6 h-6" />, label: "Fim Almoço", time: "13:00" },
  { type: "saida" as PointType, icon: <LogOut className="w-6 h-6" />, label: "Saída", time: "17:00" },
];

const getDelayTime = (expectedTime: string, actualTime: string) => {
  const [expectedHours, expectedMinutes] = expectedTime.split(':').map(Number);
  const [actualHours, actualMinutes] = actualTime.split(':').map(Number);
  
  const expectedDate = new Date();
  expectedDate.setHours(expectedHours, expectedMinutes);
  
  const actualDate = new Date();
  actualDate.setHours(actualHours, actualMinutes);
  
  const delayMinutes = differenceInMinutes(actualDate, expectedDate);
  return delayMinutes;
};

export function DailyStatus({ points }: DailyStatusProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#002085] mb-4">Status do Dia</h2>
      <div className="space-y-4">
        {points.map((point, index) => {
          const indicator = timeIndicators.find(i => i.type === point.type);
          const expectedTime = indicator?.time;
          const actualTime = format(new Date(point.timestamp), "HH:mm");
          const isLate = actualTime > expectedTime!;
          const delayMinutes = isLate ? getDelayTime(expectedTime!, actualTime) : 0;
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-black">
                {indicator?.icon}
                <span className="text-sm">{indicator?.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-black">{actualTime}</span>
                {isLate && (
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content 
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                          sideOffset={5}
                        >
                          {delayMinutes} {delayMinutes === 1 ? 'minuto' : 'minutos'} de atraso
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
