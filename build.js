/* =====================================================================
   OTIMIZAÇÃO DA PÁGINA — rode depois de editar style.css ou script.js:

       node build.js

   O que faz (sem instalar nada):
   1. Minifica style.css e coloca o CSS direto no <head> do index.html,
      entre os marcadores CSS-INLINE (a página não espera baixar o .css).
   2. Minifica script.js e grava script.min.js (é o que a página carrega).
   3. Escreve os links de checkout do CONFIG direto nos botões, para eles
      funcionarem desde o primeiro segundo, antes do JavaScript carregar.

   Edite sempre style.css e script.js — nunca o CSS dentro do index.html
   nem o script.min.js, porque eles são gerados de novo a cada build.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const write = (f, s) => fs.writeFileSync(path.join(dir, f), s);

/* Separa strings ("..." e '...') para nunca mexer no que está dentro delas */
function splitStrings(src) {
  const parts = [];
  let buf = '', i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== ch) { if (src[j] === '\\') j++; j++; }
      parts.push({ code: buf }, { str: src.slice(i, j + 1) });
      buf = ''; i = j + 1;
    } else { buf += ch; i++; }
  }
  parts.push({ code: buf });
  return parts;
}

function minifyCss(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return splitStrings(css).map(p => p.str !== undefined ? p.str :
    p.code
      .replace(/\s+/g, ' ')
      .replace(/\s*([{};,>])\s*/g, '$1')
      .replace(/:\s+/g, ':')
      .replace(/;}/g, '}')
  ).join('').trim();
}

/* Minificação conservadora: remove comentários de bloco, indentação e
   linhas vazias. Mantém as quebras de linha (seguro para qualquer JS). */
function minifyJs(js) {
  return splitStrings(js).map(p => p.str !== undefined ? p.str :
    p.code.replace(/\/\*[\s\S]*?\*\//g, '')
  ).join('')
    .split('\n').map(l => l.trim()).filter(Boolean).join('\n');
}

/* 1. CSS inline */
const css = minifyCss(read('style.css'));
let html = read('index.html');
const START = '<!-- CSS-INLINE:START -->', END = '<!-- CSS-INLINE:END -->';
const a = html.indexOf(START), b = html.indexOf(END);
if (a < 0 || b < 0) throw new Error('Marcadores CSS-INLINE não encontrados no index.html');
html = html.slice(0, a + START.length) + '\n<style>' + css + '</style>\n' + html.slice(b);

/* 2. JS minificado */
const js = read('script.js');
write('script.min.js', minifyJs(js));

/* 3. Links de checkout direto no HTML */
const urls = {
  basico: (js.match(/CHECKOUT_BASICO:\s*"([^"]*)"/) || [])[1],
  completo: (js.match(/CHECKOUT_COMPLETO:\s*"([^"]*)"/) || [])[1],
};
html = html.replace(/<a\b[^>]*\bdata-checkout="(basico|completo)"[^>]*>/g, (tag, plan) => {
  const url = urls[plan];
  return /^https?:\/\//.test(url || '') ? tag.replace(/href="[^"]*"/, `href="${url}"`) : tag;
});

write('index.html', html);
console.log(`OK — CSS inline: ${(css.length / 1024).toFixed(1)} KB | script.min.js: ${(fs.statSync(path.join(dir, 'script.min.js')).size / 1024).toFixed(1)} KB`);
