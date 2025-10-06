"use client";

import { useState, useEffect } from "react";
import { UsuarioHierarquia } from "@/app/types";
import { hierarquiaService } from "@/services/hierarquia";
import HierarchyNode from "@/app/components/atoms/HierarchyNode";
import Container from "@/app/components/atoms/container";
import { Loader2, AlertCircle, Users } from "lucide-react";

export default function HierarchyContainer() {
  const [hierarquia, setHierarquia] = useState<UsuarioHierarquia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([0])); // Expandir o nó raiz por padrão

  useEffect(() => {
    loadHierarquia();
  }, []);

  const loadHierarquia = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hierarquiaService.getHierarquia();
      setHierarquia(data);
    } catch (err) {
      setError("Erro ao carregar a hierarquia. Tente novamente.");
      console.error("Erro ao carregar hierarquia:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (userId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedNodes(newExpanded);
  };

  const buildHierarchy = (usuarios: UsuarioHierarquia[]) => {
    if (!usuarios || usuarios.length === 0) return null;

    // Função recursiva para construir a árvore
    const buildTree = (usuario: UsuarioHierarquia): any => {
      const subordinados = usuarios.filter(u => u.idChefe === usuario.idUsuario);
      return {
        ...usuario,
        subordinados: subordinados.map(buildTree)
      };
    };

    // Encontrar usuários de nível 0 (sem chefe ou nível 0)
    const rootUsers = usuarios.filter(u => u.nivel === 0 || !u.idChefe);
    
    if (rootUsers.length === 1) {
      // Se há apenas um usuário raiz, retornar a árvore
      return buildTree(rootUsers[0]);
    } else if (rootUsers.length > 1) {
      // Se há múltiplos usuários raiz, criar um nó virtual raiz
      return {
        idUsuario: 0,
        nome: "Hierarquia Organizacional",
        dataNascimento: "",
        senha: "",
        email: "",
        telefone: 0,
        idCargo: 0,
        idJornada: 0,
        indAtivo: 1,
        fotoPerfil: "",
        idChefe: null,
        chefe: "",
        subordinados: rootUsers.map(buildTree),
        nivel: -1
      };
    }

    return null;
  };

  const renderHierarchyByLevels = (usuarios: UsuarioHierarquia[]) => {
    // Agrupar usuários por nível
    const usersByLevel = usuarios.reduce((acc, usuario) => {
      const level = usuario.nivel;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(usuario);
      return acc;
    }, {} as Record<number, UsuarioHierarquia[]>);

    // Ordenar os níveis
    const sortedLevels = Object.keys(usersByLevel)
      .map(Number)
      .sort((a, b) => a - b);

    return (
      <div className="flex flex-col space-y-12">
        {sortedLevels.map((level) => (
          <div key={level} className="flex flex-col items-center">
            <h3 className="text-white text-lg font-semibold mb-4">
              Nível {level}
            </h3>
            <div className="flex space-x-6 justify-center flex-wrap gap-y-4">
              {usersByLevel[level].map((usuario) => (
                <HierarchyNode
                  key={usuario.idUsuario}
                  usuario={usuario}
                  subordinados={[]}
                  nivel={usuario.nivel}
                  isExpanded={true}
                  onToggle={() => toggleNode(usuario.idUsuario)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHierarchy = (usuario: UsuarioHierarquia & { subordinados: UsuarioHierarquia[] }, nivel: number = 0) => {
    return (
      <div className="flex flex-col items-center space-y-8">
        <HierarchyNode
          key={usuario.idUsuario}
          usuario={usuario}
          subordinados={usuario.subordinados}
          nivel={nivel}
          isExpanded={true} // Sempre expandido para mostrar todos os níveis
          onToggle={() => toggleNode(usuario.idUsuario)}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#002085]" />
            <p className="text-gray-600">Carregando hierarquia...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={loadHierarquia}
              className="px-4 py-2 bg-[#002085] text-white rounded-lg hover:bg-[#001a6b] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </Container>
    );
  }

  const hierarchyTree = buildHierarchy(hierarquia);

  if (!hierarchyTree) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Users className="w-12 h-12 text-gray-400" />
            <p className="text-gray-600">Nenhuma hierarquia encontrada</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Hierarquia Organizacional
          </h1>
          <p className="text-gray-600">
            Visualize a estrutura organizacional da empresa
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-8 min-h-[700px] overflow-x-auto">
          <div className="flex justify-center items-start">
            {renderHierarchyByLevels(hierarquia)}
          </div>
        </div>

      </div>
    </Container>
  );
}
