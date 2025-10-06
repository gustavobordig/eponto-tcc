"use client";

import { useState } from "react";
import { UsuarioHierarquia } from "@/app/types";
import { ChevronDown, ChevronRight, User, Users } from "lucide-react";

interface HierarchyNodeProps {
  usuario: UsuarioHierarquia;
  subordinados: UsuarioHierarquia[];
  nivel: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function HierarchyNode({ 
  usuario, 
  subordinados, 
  nivel, 
  isExpanded = false,
  onToggle 
}: HierarchyNodeProps) {
  const [isLocalExpanded, setIsLocalExpanded] = useState(false);
  
  const hasSubordinados = subordinados.length > 0;
  const expanded = onToggle ? isExpanded : isLocalExpanded;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsLocalExpanded(!isLocalExpanded);
    }
  };

  const getNodeColor = (nivel: number) => {
    switch (nivel) {
      case -1: return "bg-indigo-700"; // Nó virtual raiz
      case 0: return "bg-blue-600";
      case 1: return "bg-green-600";
      case 2: return "bg-purple-600";
      case 3: return "bg-orange-600";
      default: return "bg-gray-600";
    }
  };

  const getIcon = (nivel: number) => {
    if (nivel === -1) {
      return <Users className="w-5 h-5 text-white" />;
    }
    if (nivel === 0) {
      return <Users className="w-5 h-5 text-white" />;
    }
    return <User className="w-5 h-5 text-white" />;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Nó do usuário */}
      <div className="relative">
        <div className={`
          ${getNodeColor(usuario.nivel)} 
          rounded-lg p-2 min-w-[140px] max-w-[180px] 
          shadow-lg border-2 border-white
          hover:shadow-xl transition-all duration-200
          cursor-pointer
          flex-shrink-0
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                {getIcon(usuario.nivel)}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-xs leading-tight">
                  {usuario.nome}
                </h3>
                <p className="text-white/80 text-xs leading-tight">
                  {usuario.chefe || `Nível ${usuario.nivel}`}
                </p>
              </div>
            </div>
            {hasSubordinados && (
              <button
                onClick={handleToggle}
                className="text-white hover:text-white/80 transition-colors"
              >
                {expanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Linhas de conexão e subordinados */}
      {hasSubordinados && expanded && (
        <div className="mt-8 relative">
          {/* Linha vertical principal */}
          <div className="absolute left-1/2 top-0 w-0.5 h-8 bg-white transform -translate-x-1/2"></div>
          
          {/* Container dos subordinados */}
          <div className="flex space-x-4 justify-center flex-wrap gap-y-[50px] mt-[25px]">
            {subordinados.map((subordinado, index) => (
              <div key={subordinado.idUsuario} className="relative">
                {/* Linha horizontal */}
                <div className="absolute -top-8 left-1/2 w-full h-0.5 bg-white transform -translate-x-1/2"></div>
                
                {/* Linha vertical para o subordinado */}
                <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-white transform -translate-x-1/2"></div>
                
                {/* Recursão para o subordinado com seus próprios subordinados */}
                <HierarchyNode
                  usuario={subordinado}
                  subordinados={[]}
                  nivel={nivel + 1}
                  isExpanded={true} // Sempre expandido para mostrar todos os níveis
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
