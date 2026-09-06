/* pure / tools/lens-map.mjs
   Gera o mapa de deslocamento da lente e imprime o data URI.

   O mapa e uma imagem, nao um token: feImage e feDisplacementMap nao leem
   var(), pela mesma razao que os numeros do filtro goo ficam escritos a
   mao no template. Este arquivo existe para o mapa ser REPRODUZIVEL em
   vez de uma string opaca colada no template.

   Como ele funciona, e sao tres linhas:

     canal R carrega o deslocamento horizontal, canal G o vertical, e 128
     e o repouso. Acima de 128 a amostra vem da esquerda (ou de cima),
     abaixo vem da direita (ou de baixo).

     um degrade linear de 255 a 0 atravessando o circulo faz a amostra
     vir sempre de mais perto do centro, e amostrar de mais perto E
     ampliar. Por isso a lente aumenta sem ninguem escalar nada.

     o PERFIL do degrade decide onde ela distorce. Plano no miolo e
     ingreme na beirada e o que faz o centro ampliar limpo enquanto a
     borda entorta, que e como vidro grosso se comporta de verdade. A
     razao de inclinacao entre beirada e miolo passa de 25 vezes.

   Rodar: node tools/lens-map.mjs
   Colar: no <filter id="pure-lens"> de templates/page.html */

/* Dois mapas, e a razao de serem dois e que um so nao faz as duas coisas.

   CORPO: plano no miolo e ingreme na beirada. Ele amplia.

   ANEL: exatamente 128 (repouso) nos 80 por cento centrais e vertical
   nos 10 por cento de cada ponta. Ele nao amplia nada, so entorta o que
   passa rente a borda. Encadeado DEPOIS do corpo, e a deformacao a mais
   da beirada, e separa-los e o que permite mexer numa sem mexer na
   outra. Num mapa so, subir a beirada arrasta o miolo junto. */

const BODY = [
  [0.00, 255], [0.06, 190], [0.30, 136],
  [0.50, 128],
  [0.70, 120], [0.94, 66], [1.00, 0],
];

const RIM = [
  [0.00, 255], [0.10, 128],
  [0.90, 128], [1.00, 0],
];

const grad = (profile, id, x2, y2, chan) => {
  const col = (v) => (chan === "r" ? `rgb(${v},0,0)` : `rgb(0,${v},0)`);
  const stops = profile.map(([o, v]) => `<stop offset="${o}" stop-color="${col(v)}"/>`).join("");
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops}</linearGradient>`;
};

/* o retangulo de fundo e 128,128: fora do circulo nada se desloca, entao
   a lente nao arrasta o que esta do lado de fora dela.

   O anel usa raio 100 tambem, e nao um raio menor: a mascara circular ja
   concentra o efeito na beirada, porque e la que x e y chegam ao extremo
   dentro do circulo. Recortar um anel de verdade exigiria uma segunda
   mascara e nao muda o que se ve. */
const map = (profile) => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs>` +
    grad(profile, "r", "1", "0", "r") + grad(profile, "g", "0", "1", "g") +
    `</defs><rect width="200" height="200" fill="rgb(128,128,0)"/>` +
    `<circle cx="100" cy="100" r="100" fill="url(#r)"/>` +
    `<circle cx="100" cy="100" r="100" fill="url(#g)" style="mix-blend-mode:screen"/></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
};

console.log("CORPO\n" + map(BODY) + "\n\nANEL\n" + map(RIM));
