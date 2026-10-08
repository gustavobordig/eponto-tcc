/**
 * Envelope que a API devolve em todas as rotas. O payload vem em chaves que
 * mudam por recurso (usuario, cargos, listaFerias…), então cada service
 * declara as suas: ApiResponse<{ cargos: Cargo[] }>.
 */
export type ApiResponse<T extends object = object> = {
  sucesso: boolean;
  mensagem: string | null;
} & T;
