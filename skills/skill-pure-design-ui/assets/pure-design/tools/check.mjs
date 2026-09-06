#!/usr/bin/env node
// pure / check.mjs
//
// Torna as afirmações do README verificáveis. Roda sem dependência:
//
//   node tools/check.mjs
//
// O que checa:
//   1. paleta categórica: banda de luminosidade, piso de croma, separação
//      sob protanopia e deuteranopia, piso de visão normal, contraste
//      contra a superfície, nos modos claro e escuro
//   2. rampas ordinais: monotonia, passo mínimo de luminosidade, ponta
//      clara acima de 2:1 contra a superfície do próprio modo
//   3. contraste dos tokens semânticos, com a regra de uso declarada
//   4. consistência: tokens.json, web/tokens.css, python/pure/palette.py
//      e python/streamlit/app.css precisam concordar nas mesmas cores
//
// Sai com código 1 em qualquer falha.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const T = JSON.parse(read("tokens/tokens.json"));

// limiares, os mesmos citados no README
const L_BAND = { light: [0.43, 0.77], dark: [0.48, 0.67] };
const CHROMA_FLOOR = 0.1;
const CVD_TARGET = 8;
const NORMAL_FLOOR = 15;
const MARK_CONTRAST = 3;
const ORDINAL_STEP = 0.06;
const ORDINAL_LIGHT_END = 2;

let failures = 0;
const pass = (name, msg) => console.log(`  [PASS] ${name.padEnd(26)} ${msg}`);
const fail = (name, msg) => { failures++; console.log(`  [FAIL] ${name.padEnd(26)} ${msg}`); };
const check = (ok, name, msg) => (ok ? pass : fail)(name, msg);

// cor

const hex2rgb = (h) => {
  const s = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
};
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linear = (h) => hex2rgb(h).map(toLinear);

const relLum = (h) => {
  const [r, g, b] = linear(h);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const oklab = ([r, g, b]) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};
const oklch = (h) => {
  const [L, a, b] = oklab(linear(h));
  return { L, C: Math.hypot(a, b) };
};

// Machado, Oliveira e Fernandes 2009, severidade 1.0, aplicadas em RGB linear
const CVD = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
};
const simulate = (h, m) => {
  const rgb = linear(h);
  return m.map((row) => row.reduce((acc, k, i) => acc + k * rgb[i], 0));
};
const deltaE = (a, b) => {
  const [l1, a1, b1] = a, [l2, a2, b2] = b;
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2) * 100;
};
const pairDelta = (x, y, mode) => {
  if (mode === "normal") return deltaE(oklab(linear(x)), oklab(linear(y)));
  return deltaE(oklab(simulate(x, CVD[mode])), oklab(simulate(y, CVD[mode])));
};

// 1. paleta categórica

function categorical(mode, surface) {
  console.log(`\ncategórica, modo ${mode} sobre ${surface}`);
  const p = T.chart.categorical;
  const [lo, hi] = L_BAND[mode];

  const outside = p.filter((h) => { const { L } = oklch(h); return L < lo || L > hi; });
  check(!outside.length, "banda de luminosidade",
    outside.length ? `fora de ${lo}-${hi}: ${outside}` : `todos os ${p.length} dentro de L ${lo}-${hi}`);

  const gray = p.filter((h) => oklch(h).C < CHROMA_FLOOR);
  check(!gray.length, "piso de croma",
    gray.length ? `abaixo de ${CHROMA_FLOOR}: ${gray}` : `todos >= ${CHROMA_FLOOR}`);

  let worstCvd = { d: Infinity }, worstNormal = { d: Infinity };
  for (let i = 0; i < p.length - 1; i++) {
    for (const m of ["protan", "deutan"]) {
      const d = pairDelta(p[i], p[i + 1], m);
      if (d < worstCvd.d) worstCvd = { d, pair: `${p[i]} e ${p[i + 1]}`, m };
    }
    const d = pairDelta(p[i], p[i + 1], "normal");
    if (d < worstNormal.d) worstNormal = { d, pair: `${p[i]} e ${p[i + 1]}` };
  }
  check(worstCvd.d >= CVD_TARGET, "separação sob daltonismo",
    `pior par adjacente ${worstCvd.pair} delta-E ${worstCvd.d.toFixed(1)} (${worstCvd.m}), alvo ${CVD_TARGET}`);
  check(worstNormal.d >= NORMAL_FLOOR, "piso de visão normal",
    `pior par adjacente ${worstNormal.pair} delta-E ${worstNormal.d.toFixed(1)}, piso ${NORMAL_FLOOR}`);

  const dim = p.filter((h) => contrast(h, surface) < MARK_CONTRAST);
  check(!dim.length, "contraste da marca",
    dim.length ? `abaixo de ${MARK_CONTRAST}:1: ${dim}` : `todos os ${p.length} acima de ${MARK_CONTRAST}:1`);
}

// 2. rampas ordinais

function ordinal(name, ramp, surface) {
  const Ls = ramp.map((h) => oklch(h).L);
  const monotone = Ls.every((L, i) => i === 0 || L < Ls[i - 1]);
  check(monotone, `${name}: monotonia`, monotone ? "claro para escuro" : `luminosidade quebra: ${Ls.map((L) => L.toFixed(2))}`);

  const tight = [];
  for (let i = 1; i < Ls.length; i++) if (Ls[i - 1] - Ls[i] < ORDINAL_STEP) tight.push(`${ramp[i - 1]} e ${ramp[i]}`);
  check(!tight.length, `${name}: passo mínimo`,
    tight.length ? `abaixo de ${ORDINAL_STEP}: ${tight}` : `todos >= ${ORDINAL_STEP}`);

  // a ponta que precisa se destacar é a que fica mais perto da superfície
  const end = contrast(surface, "#ffffff") > 4 ? ramp[0] : ramp[ramp.length - 1];
  const r = contrast(end, surface);
  check(r >= ORDINAL_LIGHT_END, `${name}: ponta contra fundo`,
    `${end} em ${r.toFixed(2)}:1, piso ${ORDINAL_LIGHT_END}`);
}

// 3. tokens semânticos

const MODES = ["light", "paper-like", "deep-blue", "dark"];
const RULES = MODES.flatMap((m) => [
  [m, "text", "bg", 4.5, "texto principal"],
  [m, "muted", "bg", 4.5, "prosa de apoio"],
  // a excecao do deep-blue caiu em 1.5.1: muted subiu para o passo 400 e
  // agora limpa 4,5 sobre a superficie. O piso e o mesmo nos quatro modos,
  // e o hover tambem entra: era sobre --surface-hover que o 400 original
  // ficava em 4,49, um centesimo abaixo do piso.
  [m, "muted", "surface", 4.5, "prosa em cartão"],
  [m, "muted", "surface-hover", 4.5, "prosa em cartão sob o ponteiro"],
  [m, "accent", "bg", 3, "anel de foco"],
]);

function semantic() {
  console.log("\ntokens semânticos");
  for (const [mode, fg, bgKey, floor, role] of RULES) {
    const c = T.color[mode];
    const r = contrast(c[fg], c[bgKey]);
    check(r >= floor, `${mode}: ${fg}/${bgKey}`,
      `${r.toFixed(2)}:1, piso ${floor} (${role})`);
  }
}

// 4. consistência entre arquivos

function consistency() {
  console.log("\nconsistência entre arquivos");
  // espaços de alinhamento no CSS não são divergência
  const squash = (s) => s.replace(/:[ \t]+/g, ": ");
  const css = squash(read("web/tokens.css"));
  const py = read("python/pure/palette.py");
  const st = squash(read("python/streamlit/app.css"));

  // a rampa slate precisa existir com o mesmo hex em CSS e Python
  for (const ramp of ["slate", "graphite"]) {
    const bad = [];
    for (const [step, hex] of Object.entries(T.ramp[ramp])) {
      if (!css.includes(`--${ramp}-${step}: ${hex.toLowerCase()}`)) bad.push(`css --${ramp}-${step}`);
      if (!py.includes(`"${step}": "${hex.toLowerCase()}"`)) bad.push(`py ${ramp} ${step}`);
    }
    check(!bad.length, `rampa ${ramp}`,
      bad.length ? `divergem: ${bad.join(", ")}` : `${Object.keys(T.ramp[ramp]).length} passos batem em json, css e python`);
  }

  // os oito slots de gráfico
  const chartMismatch = T.chart.categorical.filter((hex, i) =>
    !css.includes(`--chart-${i + 1}: ${hex.toLowerCase()}`) || !py.includes(hex.toLowerCase()));
  check(!chartMismatch.length, "slots de gráfico",
    chartMismatch.length ? `divergem: ${chartMismatch}` : "os 8 batem em json, css e python");

  // app.css é uma cópia manual: os semânticos do modo claro precisam bater
  const stMismatch = ["bg", "surface", "surface-hover", "dim", "border", "text", "muted"]
    .filter((k) => !st.includes(`--${k}: ${T.color.light[k].toLowerCase()}`));
  check(!stMismatch.length, "cópia do streamlit",
    stMismatch.length ? `divergem de tokens.json: ${stMismatch.join(", ")}` : "os semânticos claros batem");

  // as familias agora moram em cinco arquivos: json, css, streamlit,
  // palette.py e os dois mplstyle. Divergir aqui e o jeito silencioso de
  // uma pagina cair na fonte de reserva sem ninguem notar.
  const mplLight = read("python/pure-light.mplstyle");
  const mplDark = read("python/pure-dark.mplstyle");
  const first = (stack) => stack.split(",")[0].replace(/"/g, "").trim();
  const fontBad = [];
  for (const [key, cssVar] of [["sans", "--font-sans"], ["mono", "--font-mono"], ["display", "--font-display"]]) {
    if (!css.includes(`${cssVar}: ${T.font[key]}`)) fontBad.push(`css ${cssVar}`);
  }
  for (const [key, cssVar] of [["sans", "--font-sans"], ["mono", "--font-mono"]]) {
    if (!st.includes(`${cssVar}: ${T.font[key]}`)) fontBad.push(`streamlit ${cssVar}`);
  }
  if (!css.includes(`--font-display-stretch: ${T.font["display-stretch"]}`)) fontBad.push("css --font-display-stretch");
  if (!py.includes(`FONT_SANS = ["${first(T.font.sans)}"`)) fontBad.push("palette.py FONT_SANS");
  if (!py.includes(`FONT_MONO = ["${first(T.font.mono)}"`)) fontBad.push("palette.py FONT_MONO");
  for (const [name, src] of [["mplstyle claro", mplLight], ["mplstyle escuro", mplDark]]) {
    if (!src.includes(`font.sans-serif: ${first(T.font.sans)},`)) fontBad.push(name);
  }
  check(!fontBad.length, "famílias tipográficas",
    fontBad.length ? `divergem de tokens.json: ${fontBad.join(", ")}`
                   : `sans, mono e display batem em json, css, streamlit, palette.py e os dois mplstyle`);

  // desfoque: card e overlay são os dois raios que o material do vidro usa
  // fora das quatro texturas, e não passavam por nenhuma verificação
  const blur = Object.entries(T.blur).filter(([k]) => !k.startsWith("$"));
  const blurDrift = blur.filter(([k, v]) => !css.includes(`--blur-${k}: ${v}`));
  check(!blurDrift.length, "tokens de desfoque",
    blurDrift.length ? `divergem de tokens.json: ${blurDrift.map(([k]) => k).join(", ")}`
                     : `${blur.length} valores batem em json e css`);

  // raio por papel: o token de papel é apelido de um passo numérico, e a
  // escada concêntrica quebra em silêncio se o apelido apontar para o passo
  // errado. Resolve o var() antes de comparar com tokens.json.
  const ROLES = ["surface", "field", "media", "control", "mark"];
  const step = (name) => T.radius[name.replace("radius-", "")];
  const radiusDrift = ROLES.filter((role) => {
    const alias = css.match(new RegExp(`--radius-${role}: var\\(--(radius-[a-z0-9]+)\\)`))?.[1];
    return !alias || step(alias) !== T.radius[role];
  });
  check(!radiusDrift.length, "raio por papel",
    radiusDrift.length ? `apelido aponta para o passo errado: ${radiusDrift.join(", ")}`
                       : `${ROLES.length} papéis resolvem para o passo declarado em json`);

  // a versão precisa bater em todo lugar que a exibe
  const html = read("preview/index.html");
  const readme = read("LANGUAGE.md") /* README.md renamed to LANGUAGE.md inside the skill bundle */;
  const initPy = read("python/pure/__init__.py");
  const v = T.$version;
  const stale = [];
  if (!initPy.includes(`__version__ = "${v}"`)) stale.push("python/__init__.py");
  if ((html.match(/1\.\d+\.\d+/g) || []).some((m) => m !== v)) stale.push("preview/index.html");
  const inReadme = readme.match(/[Pp]ure [Dd]esign (1\.\d+\.\d+)/g) || [];
  if (!inReadme.length || inReadme.some((m) => !m.endsWith(v))) stale.push("README.md");
  check(!stale.length, "versão",
    stale.length ? `divergem de ${v}: ${stale.join(", ")}` : `${v} em json, python, guia e README`);

  // nenhum slot além dos oito
  const extra = css.match(/--chart-(\d+)/g) || [];
  const beyond = [...new Set(extra)].filter((s) => +s.split("-")[2] > 8);
  check(!beyond.length, "sem nono slot",
    beyond.length ? `a paleta não gera matiz nova: ${beyond}` : "a paleta para em 8, como manda a regra");
}

// 5. regras de ofício verificáveis em CSS

function craft() {
  console.log("\nregras de ofício");
  const css = read("web/tokens.css");
  const patterns = read("web/patterns.css");
  const agent = read("web/agent.css");
  const motion = read("web/motion.css");
  const light = read("web/light.css");
  const icons = read("web/icons.svg");
  const lightJs = read("web/light.js");
  const html = read("preview/index.html");
  const tpl = read("templates/page.html");

  // color-scheme: sem ele o navegador pinta barra de rolagem, cursor de
  // texto e controle nativo com o tema do sistema, não com o da página
  const blocks = {
    light: /:root\s*\{[\s\S]*?\n\}/,
    "paper-like": /:root\.paper-like\s*\{[\s\S]*?\n\}/,
    "deep-blue": /:root\.deep-blue\s*\{[\s\S]*?\n\}/,
    dark: /:root\.dark\s*\{[\s\S]*?\n\}/,
  };
  const missing = Object.entries(blocks).filter(([mode, re]) => {
    const block = css.match(re)?.[0] ?? "";
    return !block.includes(`color-scheme: ${T.scheme[mode]}`);
  });
  check(!missing.length, "color-scheme por modo",
    missing.length ? `faltando em: ${missing.map(([m]) => m).join(", ")}`
                   : "os quatro modos declaram claro ou escuro ao navegador");

  // as três fontes de CSS escrito à mão passam pelas mesmas regras
  const SOURCES = [
    ["web/patterns.css", patterns],
    ["web/motion.css", motion],
    ["web/agent.css", agent],
    ["web/light.css", light],
    ["preview/index.html", html],
    ["templates/page.html", tpl],
  ];

  // transition: all pega propriedade de layout sem querer e é proibida
  const wildcard = SOURCES.filter(([, src]) => /transition:\s*all\b/.test(src));
  check(!wildcard.length, "sem transition all",
    wildcard.length ? `curinga em: ${wildcard.map(([f]) => f).join(", ")}`
                    : "toda transição lista as propriedades que anima");

  // só transform e opacity são compostas fora da thread principal.
  // grid-template-rows entra na lista porque é o jeito comum de animar
  // abertura de acordeão, e ele recalcula layout a cada quadro.
  const LAYOUT_PROPS =
    /transition:[^;]*\b(top|left|right|bottom|width|height|margin|padding|grid-template-rows|flex-basis)\b/g;
  const animated = SOURCES.flatMap(([f, src]) => (src.match(LAYOUT_PROPS) || []).map(() => f));
  check(!animated.length, "sem transição de layout",
    animated.length ? `${animated.length} transição(ões) de propriedade de layout em ${[...new Set(animated)].join(", ")}`
                    : "nada anima top, left, width ou grid-template-rows");

  // componente não inventa cor: todo hex mora em tokens.css
  const litLimit = /#[0-9a-fA-F]{3,8}\b/;
  const literal = [
    ["web/patterns.css", patterns],
    ["web/motion.css", motion],
    ["web/agent.css", agent],
    ["web/light.css", light],
    ["templates/page.html", tpl.slice(tpl.indexOf("<style>"), tpl.indexOf("</style>"))],
  ].filter(([, src]) => litLimit.test(src));
  check(!literal.length, "sem cor literal",
    literal.length ? `hex fora de tokens.css em: ${literal.map(([f]) => f).join(", ")}`
                   : "patterns.css, agent.css e o template só usam var(--token)");

  // theme-color é o único hex copiado à mão: sem ele o navegador pinta a
  // moldura antes do script rodar. Ele precisa bater com --bg do modo claro.
  const wantMeta = T.color.light.bg;
  const metaOff = [["preview/index.html", html], ["templates/page.html", tpl]]
    .filter(([, src]) => !new RegExp(`name="theme-color" content="${wantMeta}"`, "i").test(src));
  check(!metaOff.length, "moldura do navegador",
    metaOff.length ? `theme-color diverge de ${wantMeta} em: ${metaOff.map(([f]) => f).join(", ")}`
                   : `theme-color inicial bate com --bg do modo claro (${wantMeta})`);

  // os tokens de interação precisam existir nos dois lados
  const iface = Object.entries(T.interaction).filter(([k]) => !k.startsWith("$"));
  const drift = iface.filter(([k, v]) => !css.includes(`--${k}: ${v}`));
  check(!drift.length, "tokens de interação",
    drift.length ? `divergem de tokens.json: ${drift.map(([k]) => k).join(", ")}`
                 : `${iface.length} valores batem em json e css`);

  // as duas familias que nasceram em 1.5.0 cruzam json e css como as
  // outras: um token que so existe de um lado e um token que mente
  for (const fam of ["motion", "liquid", "light"]) {
    const entries = Object.entries(T[fam]).filter(([k]) => !k.startsWith("$"));
    const off = entries.filter(([k, v]) =>
      !new RegExp(`--${fam}-${k}:\\s+${v.replace(".", "\\.")};`).test(css));
    const famName = { motion: "movimento", liquid: "líquido", light: "luz" }[fam];
    check(!off.length, `tokens de ${famName}`,
      off.length ? `divergem de tokens.json: ${off.map(([k]) => k).join(", ")}`
                 : `${entries.length} valores batem em json e css`);
  }

  // idem para a camada de agente
  const ag = Object.entries(T.agent).filter(([k]) => !k.startsWith("$"));
  const agDrift = ag.filter(([k, v]) => !css.includes(`--${k}: ${v}`));
  check(!agDrift.length, "tokens de agente",
    agDrift.length ? `divergem de tokens.json: ${agDrift.map(([k]) => k).join(", ")}`
                   : `${ag.length} valores batem em json e css`);

  // ---------- camada de movimento ----------
  // a escala nao cresce: motion.css so pode usar as seis duracoes e as
  // cinco curvas que ja existem. Um cubic-bezier ou um valor em ms
  // escrito a mao aqui e uma sexta curva ou um setimo degrau entrando
  // pela porta dos fundos, que e como toda escala se desfaz.
  // comentario fora antes de medir: o cabecalho de motion.css carrega a
  // tabela de remapeamento, e ela CITA os numeros do catalogo de origem.
  // Contar a citacao como declaracao reprovaria justamente o arquivo que
  // documenta a conversao.
  const motionCode = motion.replace(/\/\*[\s\S]*?\*\//g, "");
  const rawEase = [...motionCode.matchAll(/cubic-bezier\([^)]*\)/g)].length;
  const rawMs = [...motionCode.matchAll(/:\s*[^;{]*?\b\d+m?s\b/g)]
    .filter((m) => !/var\(/.test(m[0]) && !/\b0m?s\b/.test(m[0])).length;
  check(!rawEase && !rawMs, "escala de movimento",
    rawEase || rawMs
      ? `motion.css escreve ${rawEase} curva(s) e ${rawMs} duração(ões) fora da escala`
      : "motion.css só usa os seis --duration-* e as cinco --ease-*");

  // ---------- contexto de superficie ----------
  // a varredura de contraste resolve o fundo por --surface-context, e
  // nao pela ancestralidade, porque em .liquid quem pinta e um IRMAO do
  // texto. Uma classe que pinta fundo sem declarar o token faz a
  // varredura medir contra --bg e aprovar uma página errada.
  const PAINTERS = [".surface", ".card-glass", ".glass:not(.card-glass)",
    ".glass-thin", ".glass-frost", ".glass-deep", ".pill", ".overlay", ".liquid"];
  const noCtx = PAINTERS.filter((sel) => {
    const i = patterns.indexOf(`\n${sel} {`);
    if (i < 0) return true;
    return !patterns.slice(i, patterns.indexOf("}", i)).includes("--surface-context:");
  });
  check(!noCtx.length, "contexto de superfície",
    noCtx.length ? `pintam fundo sem declarar --surface-context: ${noCtx.join(", ")}`
                 : `${PAINTERS.length} classes que pintam fundo declaram o fundo que pintam`);

  // ---------- material liquido ----------
  // trocar a variante do filtro sem trocar a folga e o jeito silencioso
  // de o aglomerado sair como pilulas soltas: a ponte fecha enquanto o
  // vao fica abaixo do desvio do desfoque, medido na tela.
  const variants = [["liquid-tight", "liquid-bridge-tight"], ["liquid-wide", "liquid-bridge-wide"]];
  const loose = variants.filter(([cls, tok]) =>
    !new RegExp(`\\.${cls}\\s*\\{[^}]*--liquid-bridge:\\s*var\\(--${tok}\\)`).test(patterns));
  check(!loose.length, "folga do líquido",
    loose.length ? `variante sem folga própria: ${loose.map(([c]) => c).join(", ")}`
                 : "cada variante do filtro goo troca de folga junto com o filtro");

  // um transform por elemento, composto de tokens. Duas regras
  // escrevendo transform no mesmo blob e o defeito de 1.4.2 e 1.4.3 por
  // outro caminho: `:has()` pesa a especificidade do argumento mais
  // especifico, entao o inchaco (0,6,0) vencia o leque (0,3,0) qualquer
  // que fosse a ordem, e o aglomerado dobrado se espalhava no hover.
  // A fatia depende de dois comentarios de capitulo. Renomear qualquer um
  // esvazia a fatia e as duas checagens que a usam passam sem olhar nada,
  // que e pior que nao existirem. O guarda torna isso uma falha.
  const liqFrom = patterns.indexOf("/* ---------- liquido ----------");
  const liqTo = patterns.indexOf("/* ---------- pilulas ----------");
  const liquidChapter = liqFrom >= 0 && liqTo > liqFrom ? patterns.slice(liqFrom, liqTo) : "";
  check(liquidChapter.length > 0, "capítulo do líquido",
    liquidChapter.length ? `${liquidChapter.split("\n").length} linhas entre os dois marcadores de capítulo`
                         : "marcadores de capítulo não encontrados: as checagens do líquido passariam sem ler nada");
  const stateTransforms = [...liquidChapter.matchAll(/^\s*transform:/gm)].length;
  check(stateTransforms === 1, "transform do líquido",
    stateTransforms === 1
      ? "um transform composto de --liquid-shift-* e --liquid-swell, e nenhum estado o reescreve"
      : `${stateTransforms} declarações de transform no capítulo: um estado sobrescreve o outro`);

  // efeito de percurso nao mora no estado de repouso. O desfoque de
  // conteudo do liquido existe ENQUANTO a massa escorre, e prende-lo ao
  // estado permanente deixa o rotulo desfocado para sempre: foi o que
  // aconteceu com .liquid-fold e .liquid-drip antes de virarem .is-flux.
  const fluxLeak = [...liquidChapter.matchAll(/^([^\n{]*\.liquid-content[^\n{]*)\{([^}]*)\}/gm)]
    .filter(([, sel, body]) => /filter:\s*blur\(\s*var/.test(body) && !/\.is-flux/.test(sel))
    .map(([, sel]) => sel.trim());
  check(!fluxLeak.length, "desfoque de percurso",
    fluxLeak.length ? `desfoca o conteúdo fora de .is-flux: ${fluxLeak.join(", ")}`
                    : "o desfoque de conteúdo do líquido só existe enquanto a massa escorre");

  // os tres filtros goo precisam existir no template, senao .liquid
  // referencia url() morta e a folha some sem erro nenhum
  const gooMissing = ["pure-goo-tight", "pure-goo", "pure-goo-wide"]
    .filter((id) => !tpl.includes(`id="${id}"`));
  check(!gooMissing.length, "filtro do líquido",
    gooMissing.length ? `sem definição no template: ${gooMissing.join(", ")}`
                      : "os três filtros goo estão definidos no template");

  // a lente do cursor cai no mesmo buraco: .lit-cursor referencia
  // #pure-lens dentro de um @supports, e uma url() morta ali nao gera
  // erro nenhum. Ela apenas para de dobrar, e o piso de desfoque
  // continua funcionando, o que torna a falha INVISIVEL em revisão.
  const lensUsed = /url\("?#pure-lens"?\)/.test(light);
  const lensDefined = tpl.includes('id="pure-lens"');
  const lensPasses = (tpl.match(/in2="lens-(body|rim)"/g) || []).length;
  check(!lensUsed || (lensDefined && lensPasses === 2), "lente do cursor",
    !lensUsed ? "light.css não referencia a lente"
      : !lensDefined ? "#pure-lens sem definição no template: a lente para de dobrar sem erro nenhum"
      : `os dois passes da lente estão definidos, corpo e anel`);

  // o piso precisa existir FORA do @supports, senão onde a referência a
  // filtro não vale a lente sai sem material nenhum em vez de sair como
  // vidro fino. É o mesmo raciocínio da ordem do backdrop-filter, visto
  // do outro lado: uma declaração que não vale tem que cair em cima de
  // uma que vale.
  const lensFloor = /\.lit-cursor \{[^}]*backdrop-filter: blur\(/.test(light);
  check(!lensUsed || lensFloor, "piso da lente",
    !lensUsed ? "sem lente, sem piso a checar"
      : lensFloor ? "onde a referência a filtro não vale, a lente vira vidro fino"
                  : ".lit-cursor não declara desfoque fora do @supports: sem suporte ela sai sem material");

  // ---------- estreito ----------
  // o ponto de quebra e literal na consulta de midia porque @media nao
  // le var(). Ele precisa bater com --breakpoint-stack, e sem esta
  // checagem os dois divergem em silencio, que e como o token ficou
  // sendo lido por nada ate 1.5.0.
  const wantBp = T.layout["breakpoint-stack"];
  // os TRES lugares que escrevem largura, nao so patterns.css: o
  // template e o guia carregam o proprio bloco de empilhamento, e eram
  // eles que ja divergiam entre si (768 contra 1080) antes de 1.5.0.
  // 640px no guia e um segundo degrau declarado, nao divergencia.
  const bpSources = [["web/patterns.css", patterns], ["web/agent.css", agent], ["web/light.css", light],
    ["templates/page.html", tpl], ["preview/index.html", html]];
  const bpQueries = bpSources.flatMap(([f, src]) =>
    [...src.matchAll(/@media \(max-width:\s*([^)]+)\)/g)]
      .map((m) => m[1].trim())
      .filter((v) => v !== "640px")
      .map((v) => ({ f, v })));
  const bpOff = bpQueries.filter((q) => q.v !== wantBp);
  check(bpQueries.length > 0 && !bpOff.length, "ponto de quebra",
    !bpQueries.length ? "nenhuma consulta de largura: o estreito não é da linguagem"
      : bpOff.length ? `divergem de --breakpoint-stack (${wantBp}): ${bpOff.map((q) => `${q.v} em ${q.f}`).join(", ")}`
                     : `${bpQueries.length} consulta(s) de largura em ${wantBp}, o valor de --breakpoint-stack`);

  // ---------- area de toque ----------
  // o piso de 44px e Must na tabela de oficio, e ate 1.5.0 o bloco
  // pointer: coarse cobria campo e .hit e mais nada: a pilula media 35px
  // no toque. O dedo nao sabe que a regra existia.
  const blockOf = (src) => {
    const i = src.indexOf("@media (pointer: coarse)");
    return i < 0 ? "" : src.slice(i, src.indexOf("\n}\n", i));
  };
  const coarseBlock = blockOf(patterns) + blockOf(agent);
  // a camada de agente e a que tem mais coisa apertavel por tela, e ela
  // nao tinha bloco de toque nenhum ate 1.5.0
  const TOUCH = [".pill", ".link-cta", ".control-round", ".liquid-item", ".check",
    ".tab", ".filter", ".trace-head", ".menu-item", ".palette-item", ".side-item",
    ".ask-option", ".followup", ".seg button", ".numfield", ".selection-bar button"];
  const untouched = TOUCH.filter((sel) => !coarseBlock.includes(sel));
  check(!untouched.length, "alvo de toque",
    untouched.length ? `sem piso de 44px no toque: ${untouched.join(", ")}`
                     : `${TOUCH.length} classes de controle sobem para --hit-min-touch no toque`);

  // ---------- tabela ----------
  // o corpo da pagina nunca rola na horizontal, e essa regra so e
  // cumprivel se alguem rolar no lugar dele
  const scroller = /\.table-scroll \{[^}]*overflow-x:\s*auto/.test(patterns);
  check(scroller, "rolagem da tabela",
    scroller ? ".table-scroll rola no lugar do corpo da página"
             : "sem .table-scroll: uma tabela larga empurra a página inteira de lado");

  // ---------- classe sem regra ----------
  // uma classe escrita na marcacao e definida em lugar nenhum nao gera
  // erro: o elemento so sai sem estilo. Foi assim que duas tabelas do
  // guia sairam cruas, com o check passando nas duas vezes. Aqui todo
  // nome usado em class= precisa ter regra em algum dos tres CSS ou no
  // <style> local do proprio guia.
  const declared = new Set();
  const localStyle = html.slice(html.indexOf("<style>"), html.indexOf("</style>"));
  for (const src of [patterns, motion, agent, light, localStyle]) {
    for (const m of src.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) declared.add(m[1]);
  }
  const used = new Set();
  for (const m of html.matchAll(/class="([^"]+)"/g)) {
    for (const c of m[1].trim().split(/\s+/)) if (c) used.add(c);
  }
  const orphans = [...used].filter((c) => !declared.has(c));
  check(!orphans.length, "classe sem regra",
    orphans.length ? `usadas no guia e definidas em lugar nenhum: ${orphans.slice(0, 8).join(", ")}`
                   : `${used.size} classes do guia têm regra em algum dos cinco lugares`);

  // foco visível: outline none só é aceitável com substituto declarado
  const bareNone = /outline:\s*none/.test(patterns) && !/:focus-visible/.test(patterns);
  check(!bareNone, "foco visível",
    bareNone ? "outline removido sem :focus-visible no lugar" : "o anel de foco existe e usa --accent");

  // um modificador só modifica se ganhar na cascata. .glass-accent mora no
  // capítulo do material e os componentes que ele tinge declaram fundo
  // depois dele, no hover com uma classe a mais: por ordem e por
  // especificidade, o componente ganhava e o botão primário saía idêntico
  // ao secundário, sem nenhum sinal de erro. Aqui a cascata é resolvida de
  // verdade, elemento por elemento, em vez de conferida no olho.
  // light.css entra concatenado DEPOIS de patterns.css porque essa e a
  // ordem de importacao declarada, e a cascata depende dela: .lit-edge
  // empata em especificidade com .glass:not(.card-glass) e so ganha por
  // vir depois. Resolver so patterns.css deixaria o terceiro modificador
  // da linguagem sem a checagem que os outros dois ja tem.
  const naked = (patterns + "\n" + light).replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [...naked.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap((m) =>
    m[1].split(",").map((s) => ({ sel: s.trim(), body: m[2], at: m.index })))
    .filter((r) => /^\.[a-z0-9-]+(\.[a-z0-9-]+|:[a-z-]+(\([^)]*\))?)*$/.test(r.sel));

  // classes e pseudoclasses pesam na mesma coluna, e :not() soma o que carrega
  const spec = (s) =>
    ((s.replace(/:not\([^)]*\)/g, "").match(/[.:]/g) || []).length) +
    (([...s.matchAll(/:not\(([^)]*)\)/g)].map((m) => m[1]).join("").match(/\./g) || []).length);

  const hits = (sel, classes, state) => {
    const nots = [...sel.matchAll(/:not\(([^)]*)\)/g)].map((m) => m[1]);
    const bare = sel.replace(/:not\([^)]*\)/g, "");
    const need = [...bare.matchAll(/\.([a-z0-9-]+)/g)].map((m) => m[1]);
    const states = [...bare.matchAll(/:([a-z-]+)/g)].map((m) => m[1]);
    if (!need.every((c) => classes.includes(c))) return false;
    if (nots.some((n) => n.split(".").filter(Boolean).every((c) => classes.includes(c)))) return false;
    return states.every((p) => p === state);
  };

  const winner = (classes, state, prop) => {
    let best = null;
    for (const r of rules) {
      if (!hits(r.sel, classes, state)) continue;
      const decl = [...r.body.matchAll(new RegExp(`(?:^|;)\\s*${prop}:\\s*([^;]+)`, "g"))].pop();
      if (!decl) continue;
      const s = spec(r.sel);
      if (!best || s > best.s || (s === best.s && r.at >= best.at)) best = { s, at: r.at, value: decl[1].trim() };
    }
    return best;
  };

  const TINTED = ["pill", "card-glass", "glass"];
  const shadowed = TINTED.flatMap((c) => ["", "hover"].map((st) => ({ c, st })))
    .filter(({ c, st }) => {
      const w = winner([c, "glass-accent"], st, "background-image");
      return !w || !w.value.includes("--glass-tint-accent");
    });
  check(!shadowed.length, "modificador de material",
    shadowed.length
      ? `o componente cobre o tingimento em: ${shadowed.map(({ c, st }) => `.${c}${st ? ":" + st : ""}`).join(", ")}`
      : `.glass-accent vence .${TINTED.join(", .")} em repouso e no hover`);

  // as quatro texturas têm o mesmo problema do tingimento, pela mesma
  // razão: .glass:not(.card-glass) vale duas classes e a textura sozinha
  // vale uma, então class="glass glass-frost" saía com o preenchimento do
  // .glass padrão e as quatro texturas viravam uma só.
  const TEXTURES = [
    ["glass-thin", "--glass-fill-thin"],
    ["glass-frost", "--glass-fill-frost"],
    ["glass-deep", "--glass-fill-deep"],
  ];
  const flattened = TEXTURES.flatMap(([c, fill]) => ["", "hover"].map((st) => ({ c, fill, st })))
    .filter(({ c, fill, st }) => {
      const w = winner(["glass", c], st, "background-image");
      return !w || !w.value.includes(fill);
    });
  check(!flattened.length, "textura de material",
    flattened.length
      ? `.glass cobre a textura em: ${flattened.map(({ c, st }) => `.${c}${st ? ":" + st : ""}`).join(", ")}`
      : `.glass-thin, .glass-frost e .glass-deep vencem .glass em repouso e no hover`);

  // o aro aceso e o TERCEIRO modificador que disputa cascata com o
  // material, depois de .glass-accent e das quatro texturas, e a licao ja
  // custou duas versoes: um modificador que perde a cascata e um
  // modificador que nao existe. Aqui ele resolve contra os quatro
  // componentes que pintam sombra de vidro, em repouso e no hover.
  const RIMMED = ["glass", "card-glass", "pill", "overlay"];
  const unlit = RIMMED.flatMap((c) => ["", "hover"].map((st) => ({ c, st })))
    .filter(({ c, st }) => {
      const w = winner([c, "lit-edge"], st, "box-shadow");
      return !w || !w.value.includes("--light-rim");
    });
  check(!unlit.length, "aro da luz",
    unlit.length
      ? `o componente cobre o aro em: ${unlit.map(({ c, st }) => `.${c}${st ? ":" + st : ""}`).join(", ")}`
      : `.lit-edge vence .${RIMMED.join(", .")} em repouso e no hover`);

  // ---------- camada de luz ----------
  // mesmo defeito do líquido por outro caminho: inclinação, ímã e
  // inchaço agem no MESMO elemento, e duas regras escrevendo transform
  // brigam por especificidade em vez de somar. Uma composição, e os
  // efeitos escrevem token.
  const lightTransforms = [...light.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/^\s*transform:/gm)]
    .filter((m) => !light.slice(0, m.index).endsWith("")).length;
  const litComposition = /\.lit-tilt,\s*\n\.lit-pull,\s*\n\.lit-swell \{[^}]*transform:[^;]*--light-shift-x[^;]*--light-turn-x[^;]*--light-grow/.test(light);
  check(litComposition, "transform da luz",
    litComposition
      ? "um transform composto de --light-shift-*, --light-turn-* e --light-grow"
      : "a composição da luz não reúne deslocamento, giro e inchaço numa declaração só");

  // nenhum efeito da camada pode escrever transform por conta própria:
  // .lit-cursor é a única exceção, e ela é um elemento sozinho na página
  const litWriters = [...light.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((m) => /^\s*transform:/m.test(m[2]))
    .map((m) => m[1].trim().replace(/\s+/g, " "))
    .filter((sel) => !sel.includes(".lit-cursor"));
  check(litWriters.length === 1, "escritores de transform da luz",
    litWriters.length === 1
      ? "só a composição escreve transform; cada efeito escreve o seu token"
      : `${litWriters.length} regras escrevem transform: ${litWriters.join(" | ")}`);

  // o fallback de var() na composição não é redundância: sem suporte a
  // @property o calc fica inválido em tempo de valor computado e a
  // declaração INTEIRA cai para transform: none. Foi medido no líquido.
  const litFallback = !/var\(--light-(shift-[xy]|turn-[xy]|grow)\)/.test(light);
  check(litFallback, "reserva da luz",
    litFallback ? "todo var() da composição declara reserva"
                : "um var() da composição sem reserva: sem @property a declaração inteira vira none");

  // a reação ao ponteiro é decidida por pointer: coarse, nunca por
  // largura, e os DOIS lados precisam concordar: o CSS zera a camada e o
  // script nem se registra. Um dos dois sozinho deixa metade viva.
  const litCoarseCss = /@media \(pointer: coarse\)[^}]*--light-near:\s*0/.test(light);
  const litCoarseJs = /matchMedia\("\(pointer: coarse\)"\)\.matches\)\s*return/.test(lightJs);
  check(litCoarseCss && litCoarseJs, "luz no toque",
    litCoarseCss && litCoarseJs
      ? "sem ponteiro fino a folha zera a proximidade e o script não se registra"
      : `só um lado desiste no toque: css ${litCoarseCss}, js ${litCoarseJs}`);

  // o cursor cedido e o TERCEIRO modificador da luz que disputa cascata,
  // e o adversario aqui nao mora nesta linguagem: e o `cursor: pointer`
  // que qualquer app escreve no proprio cartao. `.lit-cursor-only *` pesa
  // uma classe so, empata, e empate perde para quem vem depois. Medido:
  // metade da tela ficava com dois ponteiros.
  const cursorOnly = light.includes(".lit-cursor-only");
  const cursorDoubled = /\.lit-cursor-only\.lit-cursor-only \*\s*\{[^}]*cursor:\s*none/.test(light);
  check(!cursorOnly || cursorDoubled, "cursor cedido",
    !cursorOnly ? "a página não cede o cursor do sistema"
      : cursorDoubled ? ".lit-cursor-only vence o cursor que o app escreve no próprio controle"
      : ".lit-cursor-only pesa uma classe só: empata com .card { cursor: pointer } e perde por ordem");

  // e ele nunca pode deixar a tela sem ponteiro nenhum: onde a lente não
  // existe, o cursor do sistema volta na MESMA consulta que a apaga
  const coarseBack = /@media \(pointer: coarse\)[\s\S]*?cursor:\s*auto/.test(light);
  const motionBack = /@media \(prefers-reduced-motion: reduce\)[\s\S]*?cursor:\s*auto/.test(light);
  check(!cursorOnly || (coarseBack && motionBack), "ponteiro de reserva",
    !cursorOnly ? "sem cursor cedido, sem reserva a checar"
      : coarseBack && motionBack ? "onde a lente some, o cursor do sistema volta"
      : `a lente some e o cursor não volta: coarse ${coarseBack}, movimento reduzido ${motionBack}`);

  // ---------- conjunto de ícones ----------
  // um <use> apontando para um id que não existe não gera erro: o
  // elemento sai vazio. Foi exatamente assim que duas tabelas do guia
  // saíram cruas, e a lição vale para o desenho também.
  const symbols = new Set([...icons.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
  // só o <use> do sprite. Uma âncora de navegação (href="#main") não é
  // referência a desenho nenhum, e contá-la reprovava o guia por um link.
  const referenced = [...html.matchAll(/<use[^>]*href="[^"#]*#([^"]+)"/g)].map((m) => m[1])
    .filter((id) => !id.startsWith("pure-goo"));
  const ghosts = [...new Set(referenced)].filter((id) => !symbols.has(id));
  check(!ghosts.length, "ícone sem desenho",
    ghosts.length ? `usados no guia e sem símbolo em icons.svg: ${ghosts.join(", ")}`
                  : `${symbols.size} símbolos, e os ${new Set(referenced).size} usados no guia existem`);

  // a espessura do traço é a mesma da página, e ela precisa dos dois
  // lados: o atributo no sprite (a propriedade não é herdada e o
  // conteúdo de um <use> mora em shadow tree) e o token no CSS.
  const nonScaling = (icons.match(/vector-effect="non-scaling-stroke"/g) || []).length;
  const shapes = (icons.match(/<(path|circle|rect|ellipse) /g) || []).length;
  const iconStroke = /\.icon \{[^}]*stroke-width:\s*var\(--stroke\)/.test(patterns);
  check(nonScaling === shapes && shapes > 0 && iconStroke,
    "traço do ícone",
    nonScaling === shapes && iconStroke
      ? `${shapes} formas com traço fixo, e .icon usa var(--stroke)`
      : `${nonScaling} de ${shapes} formas com o atributo, .icon com o token: ${iconStroke}`);

  // o Lightning CSS, que é o minificador do tailwind v4 e do next, guarda
  // só a última declaração do par prefixado e não recoloca a padrão: na
  // ordem inversa o vidro sai sem desfoque nenhum no navegador, sem erro
  // em lugar algum. A padrão vem sempre depois da -webkit-.
  // os tres arquivos de CSS escritos a mao, nao so patterns.css: uma
  // regra nova em motion.css ou em agent.css reintroduz o defeito pelo
  // mesmo caminho, e ele nao aparece em revisao nenhuma.
  const bdSrc = patterns + agent + motion + light;
  const wrongOrder = [...bdSrc.matchAll(/\n( *)backdrop-filter: [^;]+;\n *-webkit-backdrop-filter:/g)].length;
  const pairs = [...bdSrc.matchAll(/\n( *)-webkit-backdrop-filter: [^;]+;\n *backdrop-filter:/g)].length;
  check(!wrongOrder, "ordem do backdrop-filter",
    wrongOrder
      ? `${wrongOrder} regra(s) declaram backdrop-filter antes da -webkit-: o minificador descarta a padrão`
      : `${pairs} pares com a declaração padrão depois da -webkit-`);
}

// execução

console.log("pure: verificação das afirmações do README");
categorical("light", T.chart.surface.light);
categorical("light", T.chart.surface["paper-like"]);
categorical("dark", T.chart.surface["deep-blue"]);
categorical("dark", T.chart.surface.dark);
console.log("\nrampas ordinais");
ordinal("ordinal claro", T.chart.sequential["ordinal-light"], T.chart.surface.light);
ordinal("ordinal deep-blue", T.chart.sequential["ordinal-dark"], T.chart.surface["deep-blue"]);
ordinal("ordinal dark", T.chart.sequential["ordinal-dark"], T.chart.surface.dark);
semantic();
consistency();
craft();

console.log(failures ? `\n${failures} falha(s)` : "\ntudo passa");
process.exit(failures ? 1 : 0);
