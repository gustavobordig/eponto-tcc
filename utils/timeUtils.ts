import { TimeEntry } from "@/app/components/atoms/TimeEntryInput";

interface ApiRegistroPonto {
  id_Usuario: number;
  horaRegistro: string;
  dataRegistro: string;
  idTipoRegistroPonto: number;
}

interface RegistroPonto {
  data: string;
  entradaSaida: string;
  horasExtras: string;
  faltantes: string;
  saldo: string;
}

export const getHorariosDoDia = (
  selectedRegistro: RegistroPonto | null,
  registrosApi: ApiRegistroPonto[]
): {
  entrada: TimeEntry;
  inicioAlmoco: TimeEntry;
  fimAlmoco: TimeEntry;
  saida: TimeEntry;
} => {
  if (!selectedRegistro || !registrosApi.length) {
    return {
      entrada: { time: "", location: "" },
      inicioAlmoco: { time: "", location: "" },
      fimAlmoco: { time: "", location: "" },
      saida: { time: "", location: "" },
    };
  }

  // Extrair a data do registro selecionado (formato: "seg, 27/04")
  const match = selectedRegistro.data.match(/(\d{2})\/(\d{2})/);
  if (!match) {
    return {
      entrada: { time: "", location: "" },
      inicioAlmoco: { time: "", location: "" },
      fimAlmoco: { time: "", location: "" },
      saida: { time: "", location: "" },
    };
  }

  const [, dia, mes] = match;
  const ano = new Date().getFullYear();
  const dataCompleta = `${ano}-${mes}-${dia}`;

  // Filtrar registros do dia selecionado
  const registrosDoDia = registrosApi.filter(reg => {
    // Verificar se o registro tem a propriedade dataRegistro
    if (!reg.dataRegistro) {
      return false;
    }

    // Extrair apenas a parte da data (YYYY-MM-DD) do registro da API
    const dataRegistro = reg.dataRegistro.split('T')[0];
    
    // Verificar se as datas são iguais
    return dataRegistro === dataCompleta;
  });

  // Se não encontrou registros, tentar uma abordagem alternativa
  if (registrosDoDia.length === 0) {
    // Tentar encontrar registros pelo horário de entrada/saída
    const [entrada, saida] = selectedRegistro.entradaSaida.split(" - ");
    
    // Procurar registros que correspondam ao horário de entrada ou saída
    const registrosAlternativos = registrosApi.filter(reg => {
      if (!reg.horaRegistro) return false;
      
      const horaRegistro = new Date(reg.horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Verificar se o horário está próximo do horário de entrada ou saída (dentro de 5 minutos)
      const horaRegistroMinutos = parseInt(horaRegistro.split(':')[0]) * 60 + parseInt(horaRegistro.split(':')[1]);
      const horaEntradaMinutos = parseInt(entrada.split(':')[0]) * 60 + parseInt(entrada.split(':')[1]);
      const horaSaidaMinutos = parseInt(saida.split(':')[0]) * 60 + parseInt(saida.split(':')[1]);
      
      const diferencaEntrada = Math.abs(horaRegistroMinutos - horaEntradaMinutos);
      const diferencaSaida = Math.abs(horaRegistroMinutos - horaSaidaMinutos);
      
      // Se o horário está próximo do horário de entrada ou saída, ou se é um horário intermediário
      return diferencaEntrada <= 5 || diferencaSaida <= 5 || 
             (horaRegistroMinutos > horaEntradaMinutos && horaRegistroMinutos < horaSaidaMinutos);
    });
    
    if (registrosAlternativos.length > 0) {
      // Usar os registros alternativos
      registrosDoDia.push(...registrosAlternativos);
    }
  }

  // Mapear os registros para os campos do modal
  const horarios: { [key: number]: string } = {};
  
  // Se temos registros com o mesmo tipo, precisamos determinar qual é qual
  if (registrosDoDia.length > 0) {
    // Ordenar registros por hora
    registrosDoDia.sort((a, b) => 
      new Date(a.horaRegistro).getTime() - new Date(b.horaRegistro).getTime()
    );
    
    // Extrair os horários de entrada e saída do registro selecionado
    const [entrada, saida] = selectedRegistro.entradaSaida.split(" - ");
    
    // Mapear os registros para os campos do modal
    if (registrosDoDia.length === 1) {
      // Se temos apenas um registro, verificar se é entrada ou saída
      const horaRegistro = new Date(registrosDoDia[0].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      if (horaRegistro === entrada) {
        horarios[1] = horaRegistro; // Entrada
      } else if (horaRegistro === saida) {
        horarios[4] = horaRegistro; // Saída
      } else {
        // Se não corresponde a nenhum, assumir que é entrada
        horarios[1] = horaRegistro; // Entrada
      }
    } else if (registrosDoDia.length === 2) {
      // Se temos dois registros, assumir que são entrada e saída
      const horaEntrada = new Date(registrosDoDia[0].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const horaSaida = new Date(registrosDoDia[1].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      horarios[1] = horaEntrada; // Entrada
      horarios[4] = horaSaida;   // Saída
    } else if (registrosDoDia.length === 3) {
      // Se temos três registros, precisamos determinar qual é qual
      const horaRegistro1 = new Date(registrosDoDia[0].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const horaRegistro2 = new Date(registrosDoDia[1].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const horaRegistro3 = new Date(registrosDoDia[2].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Verificar se o primeiro registro corresponde ao horário de entrada
      if (horaRegistro1 === entrada) {
        horarios[1] = horaRegistro1; // Entrada
        
        // Verificar se o terceiro registro corresponde ao horário de saída
        if (horaRegistro3 === saida) {
          horarios[4] = horaRegistro3; // Saída
          
          // O segundo registro é um registro intermediário
          horarios[2] = horaRegistro2; // Início do almoço
        } else {
          // Se o terceiro registro não corresponde ao horário de saída, verificar o segundo
          if (horaRegistro2 === saida) {
            horarios[4] = horaRegistro2; // Saída
            
            // O terceiro registro é um registro intermediário
            horarios[2] = horaRegistro3; // Início do almoço
          } else {
            // Se nenhum dos registros corresponde ao horário de saída, assumir que o terceiro é a saída
            horarios[4] = horaRegistro3; // Saída
            
            // O segundo registro é um registro intermediário
            horarios[2] = horaRegistro2; // Início do almoço
          }
        }
      } else if (horaRegistro3 === saida) {
        // Se o terceiro registro corresponde ao horário de saída
        horarios[4] = horaRegistro3; // Saída
        
        // Verificar se o primeiro registro corresponde ao horário de entrada
        if (horaRegistro1 === entrada) {
          horarios[1] = horaRegistro1; // Entrada
          
          // O segundo registro é um registro intermediário
          horarios[2] = horaRegistro2; // Início do almoço
        } else {
          // Se o primeiro registro não corresponde ao horário de entrada, verificar o segundo
          if (horaRegistro2 === entrada) {
            horarios[1] = horaRegistro2; // Entrada
            
            // O primeiro registro é um registro intermediário
            horarios[2] = horaRegistro1; // Início do almoço
          } else {
            // Se nenhum dos registros corresponde ao horário de entrada, assumir que o primeiro é a entrada
            horarios[1] = horaRegistro1; // Entrada
            
            // O segundo registro é um registro intermediário
            horarios[2] = horaRegistro2; // Início do almoço
          }
        }
      } else {
        // Se nenhum dos registros corresponde aos horários de entrada e saída, assumir que são entrada, início do almoço e saída
        horarios[1] = horaRegistro1; // Entrada
        horarios[2] = horaRegistro2; // Início do almoço
        horarios[4] = horaRegistro3; // Saída
      }
    } else if (registrosDoDia.length === 4) {
      // Se temos quatro registros, assumir que são entrada, início do almoço, fim do almoço e saída
      const horaEntrada = new Date(registrosDoDia[0].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const horaInicioAlmoco = new Date(registrosDoDia[1].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const horaFimAlmoco = new Date(registrosDoDia[2].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const horaSaida = new Date(registrosDoDia[3].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      horarios[1] = horaEntrada;       // Entrada
      horarios[2] = horaInicioAlmoco;  // Início do almoço
      horarios[3] = horaFimAlmoco;     // Fim do almoço
      horarios[4] = horaSaida;         // Saída
    } else {
      // Se temos mais de 4 registros, usar apenas os 4 primeiros
      const horaEntrada = new Date(registrosDoDia[0].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const horaInicioAlmoco = new Date(registrosDoDia[1].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const horaFimAlmoco = new Date(registrosDoDia[2].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const horaSaida = new Date(registrosDoDia[3].horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      horarios[1] = horaEntrada;       // Entrada
      horarios[2] = horaInicioAlmoco;  // Início do almoço
      horarios[3] = horaFimAlmoco;     // Fim do almoço
      horarios[4] = horaSaida;         // Saída
    }
  } else {
    // Mapeamento normal por tipo
    registrosDoDia.forEach(reg => {
      const horaFormatada = new Date(reg.horaRegistro).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      horarios[reg.idTipoRegistroPonto] = horaFormatada;
    });
  }

  // Retornar os horários formatados
  return {
    entrada: { time: horarios[1] || "", location: "Escritório" },
    inicioAlmoco: { time: horarios[2] || "", location: "Escritório" },
    fimAlmoco: { time: horarios[3] || "", location: "Escritório" },
    saida: { time: horarios[4] || "", location: "Escritório" },
  };
}; 