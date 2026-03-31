import { SearchStrategy } from './SearchStrategy.js';

const BASE = 256;
const MOD  = 101;

export class RabinKarpSearch extends SearchStrategy {
  constructor() {
    super('Rabin-Karp');
  }

  search(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const positions = [];
    let comparisons = 0;

    if (m > n) return { positions, comparisons };

    let h = 1;
    for (let i = 0; i < m - 1; i++) h = (h * BASE) % MOD;

    let hashP = 0;
    let hashT = 0;

    for (let i = 0; i < m; i++) {
      hashP = (BASE * hashP + pattern.charCodeAt(i)) % MOD;
      hashT = (BASE * hashT + text.charCodeAt(i)) % MOD;
    }

    for (let i = 0; i <= n - m; i++) {
      if (hashP === hashT) {
        let j = 0;
        while (j < m) {
          comparisons++;
          if (text[i + j] !== pattern[j]) break;
          j++;
        }
        if (j === m) positions.push(i);
      }

      if (i < n - m) {
        hashT = (BASE * (hashT - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % MOD;
        if (hashT < 0) hashT += MOD;
      }
    }

    return { positions, comparisons };
  }

  stepByStep(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const steps = [];
    const found = [];
    let comparisons = 0;

    if (m > n) return steps;

    let h = 1;
    for (let i = 0; i < m - 1; i++) h = (h * BASE) % MOD;

    let hashP = 0;
    let hashT = 0;

    for (let i = 0; i < m; i++) {
      hashP = (BASE * hashP + pattern.charCodeAt(i)) % MOD;
      hashT = (BASE * hashT + text.charCodeAt(i)) % MOD;
    }

    for (let i = 0; i <= n - m; i++) {
      const hashMatch = hashP === hashT;

      if (!hashMatch) {
        // Hash diferente: pula a janela inteira sem comparar caracteres
        steps.push({
          textIndex: i,
          patternIndex: 0,
          windowStart: i,
          action: 'salto',
          found: [...found],
          comparisons,
          log: `[Rabin-Karp] Hash janela[${i}..${i+m-1}]=${hashT} != hash padrão=${hashP} → pula janela inteira SEM comparar caracteres`,
          extra: { hashT, hashP },
        });
      } else {
        // Hash igual: precisa verificar caractere a caractere (pode ser falso positivo)
        steps.push({
          textIndex: i,
          patternIndex: 0,
          windowStart: i,
          action: 'janela',
          found: [...found],
          comparisons,
          log: `[Rabin-Karp] Hash janela[${i}..${i+m-1}]=${hashT} == hash padrão=${hashP} → verifica caractere a caractere (evitar falso positivo)`,
          extra: { hashT, hashP },
        });

        let j = 0;
        while (j < m) {
          comparisons++;
          const isMatch = text[i + j] === pattern[j];
          steps.push({
            textIndex: i + j,
            patternIndex: j,
            windowStart: i,
            action: isMatch ? 'match' : 'mismatch',
            found: [...found],
            comparisons,
            log: isMatch
              ? `[Rabin-Karp] texto[${i+j}]='${text[i+j]}' == padrão[${j}]='${pattern[j]}' ✓`
              : `[Rabin-Karp] texto[${i+j}]='${text[i+j]}' != padrão[${j}]='${pattern[j]}' ✗ → falso positivo de hash!`,
            extra: { hashT, hashP },
          });
          if (!isMatch) break;
          j++;
        }

        if (j === m) {
          found.push(i);
          steps.push({
            textIndex: i,
            patternIndex: 0,
            windowStart: i,
            action: 'encontrado',
            found: [...found],
            comparisons,
            log: `[Rabin-Karp] ✔ Encontrado na posição ${i}`,
            extra: { hashT, hashP },
          });
        }
      }

      if (i < n - m) {
        hashT = (BASE * (hashT - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % MOD;
        if (hashT < 0) hashT += MOD;
      }
    }

    return steps;
  }
}
