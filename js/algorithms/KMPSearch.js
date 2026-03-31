import { SearchStrategy } from './SearchStrategy.js';

export class KMPSearch extends SearchStrategy {
  constructor() {
    super('KMP (Knuth-Morris-Pratt)');
  }

  buildLPS(pattern) {
    const m = pattern.length;
    const lps = new Array(m).fill(0);
    let len = 0;
    let i = 1;

    while (i < m) {
      if (pattern[i] === pattern[len]) {
        len++;
        lps[i] = len;
        i++;
      } else if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }

    return lps;
  }

  search(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const lps = this.buildLPS(pattern);
    const positions = [];
    let comparisons = 0;
    let i = 0;
    let j = 0;

    while (i < n) {
      comparisons++;
      if (text[i] === pattern[j]) {
        i++;
        j++;
      } else {
        if (j !== 0) {
          j = lps[j - 1];
        } else {
          i++;
        }
      }
      if (j === m) {
        positions.push(i - j);
        j = lps[j - 1];
      }
    }

    return { positions, comparisons };
  }

  stepByStep(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const lps = this.buildLPS(pattern);
    const steps = [];
    const found = [];
    let comparisons = 0;
    let i = 0;
    let j = 0;

    while (i < n) {
      comparisons++;
      const isMatch = text[i] === pattern[j];

      if (isMatch) {
        steps.push({
          textIndex: i,
          patternIndex: j,
          windowStart: i - j,
          action: 'match',
          found: [...found],
          comparisons,
          log: `[KMP] texto[${i}]='${text[i]}' == padrão[${j}]='${pattern[j]}' ✓ — avança ambos`,
          extra: { lps: [...lps] },
        });
        i++;
        j++;
      } else {
        if (j !== 0) {
          const salto = lps[j - 1];
          steps.push({
            textIndex: i,
            patternIndex: j,
            windowStart: i - j,
            action: 'mismatch',
            found: [...found],
            comparisons,
            log: `[KMP] texto[${i}]='${text[i]}' != padrão[${j}]='${pattern[j]}' ✗ — usa LPS[${j-1}]=${salto} → recua padrão para ${salto} (NÃO recua no texto!)`,
            extra: { lps: [...lps] },
          });
          j = salto;
        } else {
          steps.push({
            textIndex: i,
            patternIndex: j,
            windowStart: i,
            action: 'mismatch',
            found: [...found],
            comparisons,
            log: `[KMP] texto[${i}]='${text[i]}' != padrão[0]='${pattern[0]}' ✗ — padrão já no início, avança texto`,
            extra: { lps: [...lps] },
          });
          i++;
        }
      }

      if (j === m) {
        found.push(i - j);
        steps.push({
          textIndex: i - j,
          patternIndex: 0,
          windowStart: i - j,
          action: 'encontrado',
          found: [...found],
          comparisons,
          log: `[KMP] ✔ Encontrado na posição ${i - j} — usa LPS[${m-1}]=${lps[m-1]} para continuar sem reiniciar`,
          extra: { lps: [...lps] },
        });
        j = lps[j - 1];
      }
    }

    return steps;
  }
}
