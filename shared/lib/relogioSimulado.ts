/**
 * TEMPORÁRIO (gravação de vídeo): com NEXT_PUBLIC_HORA_SIMULADA=18:30, o app
 * inteiro passa a viver nesse horário, e o tempo corre normalmente a partir
 * dele. O ponto é gravado com a hora do navegador, então ele também sai no
 * horário simulado. Sem a variável, nada muda.
 *
 * Roda antes da hidratação, trocando o Date global por um com deslocamento.
 */
export const HORA_SIMULADA = /^\d{1,2}:\d{2}$/.test(process.env.NEXT_PUBLIC_HORA_SIMULADA ?? '')
  ? process.env.NEXT_PUBLIC_HORA_SIMULADA!
  : null;

export const scriptRelogioSimulado = (hora: string) => `try{
var R=Date,p=${JSON.stringify(hora)}.split(':'),alvo=new R();alvo.setHours(+p[0],+p[1],0,0);
var desvio=alvo.getTime()-R.now();
var D=function(){var a=Array.prototype.slice.call(arguments);if(!(this instanceof D))return new R(R.now()+desvio).toString();return a.length?new (Function.prototype.bind.apply(R,[null].concat(a)))():new R(R.now()+desvio);};
D.prototype=R.prototype;D.now=function(){return R.now()+desvio};D.parse=R.parse;D.UTC=R.UTC;
window.__agoraReal=function(){return R.now()};
window.Date=D;
}catch(e){}`;

/**
 * Milissegundos reais, ignorando o horário simulado. A validade da sessão
 * depende do relógio real: com o simulado adiantado, o cookie nascia vencido.
 */
export const agoraReal = (): number =>
  typeof window !== 'undefined' && typeof (window as { __agoraReal?: () => number }).__agoraReal === 'function'
    ? (window as unknown as { __agoraReal: () => number }).__agoraReal()
    : Date.now();
