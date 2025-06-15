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
    if (!reg.dataRegistro) return false;
    const dataRegistro = reg.dataRegistro.split('T')[0];
    return dataRegistro === dataCompleta;
  });

  // Ordenar registros por hora
  registrosDoDia.sort((a, b) => 
    new Date(a.horaRegistro).getTime() - new Date(b.horaRegistro).getTime()
  );

  // Mapear os registros para os campos do modal
  const idsRegistros: { [key: number]: number } = {};

  // Se temos registros, mapear por ordem
  if (registrosDoDia.length > 0) {
    // Mapear os registros por ordem
    registrosDoDia.forEach((reg, index) => {
      switch (index) {
        case 0:
          idsRegistros[1] = reg.idRegistro; // Entrada
          break;
        case 1:
          idsRegistros[2] = reg.idRegistro; // Início do almoço
          break;
        case 2:
          idsRegistros[3] = reg.idRegistro; // Fim do almoço
          break;
        case 3:
          idsRegistros[4] = reg.idRegistro; // Saída
          break;
      }
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