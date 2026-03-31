import { SearchStrategy } from './SearchStrategy.js';

export class BoyerMooreSearch extends SearchStrategy {
  constructor() {
    super('Boyer-Moore (Bad Character)');
  }

  buildBadChar(pattern) {
    const badChar = {};
    for (let i = 0; i < pattern.length; i++) {
      badChar[pattern[i]] = i;
    }
    return badChar;
  }

  search(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const badChar = this.buildBadChar(pattern);
    const positions = [];
    let comparisons = 0;
    let i = 0;

    while (i <= n - m) {
      let j = m - 1;

      while (j >= 0) {
        comparisons++;
        if (pattern[j] !== text[i + j]) break;
        j--;
      }

      if (j < 0) {
        positions.push(i);
        const nextShift = (i + m < n) ? (m - (badChar[text[i + m]] ?? -1)) : 1;
        i += nextShift;
      } else {
        const bc = badChar[text[i + j]] ?? -1;
        const shift = Math.max(1, j - bc);
        i += shift;
      }
    }

    return { positions, comparisons };
  }

  stepByStep(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const badChar = this.buildBadChar(pattern);
    const steps = [];
    const found = [];
    let comparisons = 0;
    let i = 0;

    while (i <= n - m) {
      // Indica o alinhamento atual — Boyer-Moore começa pelo FIM do padrão
      steps.push({
        textIndex: i + m - 1,
        patternIndex: m - 1,
        windowStart: i,
        action: 'janela',
        found: [...found],
        comparisons,
        log: `[Boyer-Moore] Alinha janela em [${i}..${i+m-1}] — compara do FIM para o início (direita → esquerda)`,
        extra: { badChar: { ...badChar } },
      });

      let j = m - 1;

      while (j >= 0) {
        comparisons++;
        const isMatch = pattern[j] === text[i + j];

        steps.push({
          textIndex: i + j,
          patternIndex: j,
          windowStart: i,
          action: isMatch ? 'match' : 'mismatch',
          found: [...found],
          comparisons,
          log: isMatch
            ? `[Boyer-Moore] texto[${i+j}]='${text[i+j]}' == padrão[${j}]='${pattern[j]}' ✓ — continua para esquerda`
            : `[Boyer-Moore] texto[${i+j}]='${text[i+j]}' != padrão[${j}]='${pattern[j]}' ✗`,
          extra: { badChar: { ...badChar } },
        });

        if (!isMatch) break;
        j--;
      }

      if (j < 0) {
        found.push(i);
        steps.push({
          textIndex: i,
          patternIndex: 0,
          windowStart: i,
          action: 'encontrado',
          found: [...found],
          comparisons,
          log: `[Boyer-Moore] ✔ Encontrado na posição ${i}`,
          extra: { badChar: { ...badChar } },
        });
        const nextShift = (i + m < n) ? (m - (badChar[text[i + m]] ?? -1)) : 1;
        i += nextShift;
      } else {
        const bc = badChar[text[i + j]] ?? -1;
        const shift = Math.max(1, j - bc);

        steps.push({
          textIndex: i + j,
          patternIndex: j,
          windowStart: i,
          action: 'salto',
          found: [...found],
          comparisons,
          log: `[Boyer-Moore] Bad char '${text[i+j]}': última posição no padrão=${bc === -1 ? 'ausente' : bc} → SALTA ${shift} posição(ões) (pula a janela inteira para frente!)`,
          extra: { badChar: { ...badChar } },
        });

        i += shift;
      }
    }

    return steps;
  }
}
