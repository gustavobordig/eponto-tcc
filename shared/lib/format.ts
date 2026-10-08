// Formatação de datas e horas usada em várias telas

/**
 * Formata horas trabalhadas para exibição amigável ao usuário
 * @param horasString - String no formato "HH:MM:SS" ou similar
 * @returns String formatada como "Xh Ymin" ou "Xh"
 * 
 * Exemplos:
 * - "00:00:00" -> "0h"
 * - "08:30:00" -> "8h 30min"
 * - "08:00:00" -> "8h"
 */
export const formatHorasTrabalhadas = (horasString: string): string => {
  try {
    // Remove possíveis espaços e quebras
    const horas = horasString.trim();
    
    // Se já está no formato HH:MM:SS, converte para HH:MM
    if (horas.includes(':')) {
      const partes = horas.split(':');
      if (partes.length >= 2) {
        const horas = parseInt(partes[0]);
        const minutos = parseInt(partes[1]);
        
        // Se não há horas trabalhadas, mostra "0h"
        if (horas === 0 && minutos === 0) {
          return "0h";
        }
        
        // Formata como "Xh Ymin" ou apenas "Xh" se não há minutos
        if (minutos === 0) {
          return `${horas}h`;
        } else {
          return `${horas}h ${minutos}min`;
        }
      }
    }
    
    return horas || "0h";
  } catch (error) {
    console.error('Erro ao formatar horas trabalhadas:', error);
    return "0h";
  }
};

/**
 * Formata saldo de horas para exibição amigável ao usuário
 * @param saldoString - String no formato "-X.YY:HH:MM" ou similar
 * @returns String formatada como "-Xh Ymin" ou "Xh Ymin"
 * 
 * Exemplos:
 * - "-1.18:00:00" -> "-42h" (1 dia + 18% de 24h = 24 + 4.32 ≈ 28h, negativo)
 * - "00:30:00" -> "30min"
 * - "02:15:00" -> "2h 15min"
 * - "-00:30:00" -> "-30min"
 */
export const formatSaldo = (saldoString: string): string => {
  try {
    // Remove possíveis espaços e quebras
    const saldo = saldoString.trim();
    
    // Se já está no formato -X.YY:HH:MM, converte para formato mais amigável
    if (saldo.includes(':')) {
      const partes = saldo.split(':');
      if (partes.length >= 3) {
        // Se tem formato -X.YY:HH:MM, extrai os valores
        const primeiroParte = partes[0];
        const horas = parseInt(partes[1]);
        const minutos = parseInt(partes[2]);
        
        // Verifica se é negativo
        const isNegativo = primeiroParte.startsWith('-');
        const valorAbsoluto = isNegativo ? primeiroParte.substring(1) : primeiroParte;
        
        // Se tem formato decimal (ex: 1.18), converte
        if (valorAbsoluto.includes('.')) {
          const [dias, decimais] = valorAbsoluto.split('.');
          const diasInt = parseInt(dias);
          const decimaisInt = parseInt(decimais);
          
          // Converte decimais para horas (assumindo que 1.00 = 24h)
          const horasAdicionais = Math.round((decimaisInt / 100) * 24);
          const totalHoras = (diasInt * 24) + horasAdicionais + horas;
          
          const prefixo = isNegativo ? "-" : "";
          
          if (totalHoras === 0 && minutos === 0) {
            return "0h";
          }
          
          if (minutos === 0) {
            return `${prefixo}${totalHoras}h`;
          } else {
            return `${prefixo}${totalHoras}h ${minutos}min`;
          }
        } else {
          // Formato simples HH:MM
          const prefixo = isNegativo ? "-" : "";
          
          if (horas === 0 && minutos === 0) {
            return "0h";
          }
          
          if (minutos === 0) {
            return `${prefixo}${horas}h`;
          } else {
            return `${prefixo}${horas}h ${minutos}min`;
          }
        }
      }
    }
    
    // Se não conseguiu parsear, retorna o valor original
    return saldo || "0h";
  } catch (error) {
    console.error('Erro ao formatar saldo:', error);
    return "0h";
  }
};

/**
 * Formata uma data para exibição amigável
 * @param dateValue - Valor da data (string, Date ou null/undefined)
 * @param includeTime - Se deve incluir hora na formatação
 * @returns String formatada ou '-' se a data for inválida
 */
export const formatDate = (dateValue: string | Date | null | undefined, includeTime: boolean = false): string => {
  try {
    if (!dateValue) {
      return '-';
    }

    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) {
      return '-';
    }

    if (includeTime) {
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
}; 