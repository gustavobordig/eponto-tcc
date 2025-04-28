interface ApiRegistroPonto {
  id_Usuario: number;
  horaRegistro: string;
  dataRegistro: string;
  idTipoRegistroPonto: number;
  idRegistro: number;
}

interface RegistroPonto {
  data: string;
  entradaSaida: string;
  horasExtras: string;
  faltantes: string;
  saldo: string;
}

export const getIdRegistroDoDia = (
  selectedRegistro: RegistroPonto | null,
  registrosApi: ApiRegistroPonto[]
): {
  entrada: number;
  inicioAlmoco: number;
  fimAlmoco: number;
  saida: number;
} => {
  if (!selectedRegistro || !registrosApi.length) {
    return {
      entrada: 0,
      inicioAlmoco: 0,
      fimAlmoco: 0,
      saida: 0,
    };
  }

  // Extrair a data do registro selecionado (formato: "seg, 27/04")
  const match = selectedRegistro.data.match(/(\d{2})\/(\d{2})/);
  if (!match) {
    return {
      entrada: 0,
      inicioAlmoco: 0,
      fimAlmoco: 0,
      saida: 0,
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
  const idsRegistros: { [key: number]: number } = {};
  
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
        idsRegistros[1] = registrosDoDia[0].idRegistro; // Entrada
      } else if (horaRegistro === saida) {
        idsRegistros[4] = registrosDoDia[0].idRegistro; // Saída
      } else {
        // Se não corresponde a nenhum, assumir que é entrada
        idsRegistros[1] = registrosDoDia[0].idRegistro; // Entrada
      }
    } else if (registrosDoDia.length === 2) {
      // Se temos dois registros, assumir que são entrada e saída
      idsRegistros[1] = registrosDoDia[0].idRegistro; // Entrada
      idsRegistros[4] = registrosDoDia[1].idRegistro; // Saída
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
        idsRegistros[1] = registrosDoDia[0].idRegistro; // Entrada
        
        // Verificar se o terceiro registro corresponde ao horário de saída
        if (horaRegistro3 === saida) {
          idsRegistros[4] = registrosDoDia[2].idRegistro; // Saída
          
          // O segundo registro é um registro intermediário
          idsRegistros[2] = registrosDoDia[1].idRegistro; // Início do almoço
        } else {
          // Se o terceiro registro não corresponde ao horário de saída, verificar o segundo
          if (horaRegistro2 === saida) {
            idsRegistros[4] = registrosDoDia[1].idRegistro; // Saída
            
            // O terceiro registro é um registro intermediário
            idsRegistros[2] = registrosDoDia[2].idRegistro; // Início do almoço
          } else {
            // Se nenhum dos registros corresponde ao horário de saída, assumir que o terceiro é a saída
            idsRegistros[4] = registrosDoDia[2].idRegistro; // Saída
            
            // O segundo registro é um registro intermediário
            idsRegistros[2] = registrosDoDia[1].idRegistro; // Início do almoço
          }
        }
      } else if (horaRegistro3 === saida) {
        // Se o terceiro registro corresponde ao horário de saída
        idsRegistros[4] = registrosDoDia[2].idRegistro; // Saída
        
        // Verificar se o primeiro registro corresponde ao horário de entrada
        if (horaRegistro1 === entrada) {
          idsRegistros[1] = registrosDoDia[0].idRegistro; // Entrada
          
          // O segundo registro é um registro intermediário
          idsRegistros[2] = registrosDoDia[1].idRegistro; // Início do almoço
        } else {
          // Se o primeiro registro não corresponde ao horário de entrada, verificar o segundo
          if (horaRegistro2 === entrada) {
            idsRegistros[1] = registrosDoDia[1].idRegistro; // Entrada
            
            // O primeiro registro é um registro intermediário
            idsRegistros[2] = registrosDoDia[0].idRegistro; // Início do almoço
          } else {
            // Se nenhum dos registros corresponde ao horário de entrada, assumir que o primeiro é a entrada
            idsRegistros[1] = registrosDoDia[0].idRegistro; // Entrada
            
            // O segundo registro é um registro intermediário
            idsRegistros[2] = registrosDoDia[1].idRegistro; // Início do almoço
          }
        }
      } else {
        // Se nenhum dos registros corresponde aos horários de entrada e saída, assumir que são entrada, início do almoço e saída
        idsRegistros[1] = registrosDoDia[0].idRegistro; // Entrada
        idsRegistros[2] = registrosDoDia[1].idRegistro; // Início do almoço
        idsRegistros[4] = registrosDoDia[2].idRegistro; // Saída
      }
    } else if (registrosDoDia.length === 4) {
      // Se temos quatro registros, assumir que são entrada, início do almoço, fim do almoço e saída
      idsRegistros[1] = registrosDoDia[0].idRegistro; // Entrada
      idsRegistros[2] = registrosDoDia[1].idRegistro; // Início do almoço
      idsRegistros[3] = registrosDoDia[2].idRegistro; // Fim do almoço
      idsRegistros[4] = registrosDoDia[3].idRegistro; // Saída
    } else {
      // Se temos mais de 4 registros, usar apenas os 4 primeiros
      idsRegistros[1] = registrosDoDia[0].idRegistro; // Entrada
      idsRegistros[2] = registrosDoDia[1].idRegistro; // Início do almoço
      idsRegistros[3] = registrosDoDia[2].idRegistro; // Fim do almoço
      idsRegistros[4] = registrosDoDia[3].idRegistro; // Saída
    }
  } else {
    // Mapeamento normal por tipo
    registrosDoDia.forEach(reg => {
      idsRegistros[reg.idTipoRegistroPonto] = reg.idRegistro;
    });
  }

  // Retornar os IDs dos registros
  return {
    entrada: idsRegistros[1] || 0,
    inicioAlmoco: idsRegistros[2] || 0,
    fimAlmoco: idsRegistros[3] || 0,
    saida: idsRegistros[4] || 0,
  };
}; 