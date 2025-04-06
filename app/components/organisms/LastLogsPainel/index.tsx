"use client";

import { EditIcon, PlusIcon } from "lucide-react";

// Atoms
import Divisor from "@/app/components/atoms/Divisor";

// Molecules
import LastLogsList from "@/app/components/molecules/LastLogsList";
import Button from "../../atoms/Button";

export default function LastLogsPainel() {
    const items = [
        {
            data: "2024-03-20 08:30",
            local: "Entrada - Portão Principal"
        },
        {
            data: "2024-03-20 12:15",
            local: "Saída - Portão Principal"
        },
        {
            data: "2024-03-20 13:45",
            local: "Entrada - Portão Principal"
        },
        {
            data: "2024-03-20 17:30",
            local: "Saída - Portão Principal"
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center
        border-2 border-[#002085] rounded-lg p-4 md:p-8">
            
            <div className="flex items-center justify-between w-full h-full">
                <h2 className="text-xl md:text-2xl font-bold text-[#002085]">
                    Registros recentes
                </h2>

                <p className="text-sm md:text-base text-[#002085] hover:underline cursor-pointer">
                    Ver todos
                </p>
            </div>

            <Divisor />

            <LastLogsList items={items} />

            <Divisor />

            <div className="flex flex-col md:flex-row gap-4 justify-start w-full">
                <Button 
                    icon={<EditIcon />}
                    text="Editar localização"
                    onClick={() => {}}
                    className="w-full md:w-[200px] bg-transparent text-[#002085] border-[#002085] border"
                    textColor="#002085"
                    fullWidth={false}
                />

                <Button 
                    icon={<PlusIcon />}
                    text="Bater ponto"
                    onClick={() => {}}
                    className="w-full md:w-[200px]"
                    fullWidth={false}
                />
            </div>


        </div>
    )
}
