import { SearchStrategy } from './SearchStrategy.js';

export class NaiveSearch extends SearchStrategy {
  constructor() {
    super('Naive (Força Bruta)');
  }

  search(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const positions = [];
    let comparisons = 0;

    for (let i = 0; i <= n - m; i++) {
      let j = 0;
      while (j < m) {
        comparisons++;
        if (text[i + j] !== pattern[j]) break;
        j++;
      }
      if (j === m) positions.push(i);
    }

    return { positions, comparisons };
  }

  stepByStep(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const steps = [];
    const found = [];
    let comparisons = 0;

    for (let i = 0; i <= n - m; i++) {
      // Indica o início de uma nova tentativa de alinhamento
      steps.push({
        textIndex: i,
        patternIndex: 0,
        windowStart: i,
        action: 'janela',
        found: [...found],
        comparisons,
        log: `[Naive] Alinha padrão na posição ${i} — vai comparar ${m} caractere(s) um por um`,
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
            ? `[Naive] texto[${i + j}]='${text[i + j]}' == padrão[${j}]='${pattern[j]}' ✓`
            : `[Naive] texto[${i + j}]='${text[i + j]}' != padrão[${j}]='${pattern[j]}' ✗ → abandona e desloca +1`,
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
          log: `[Naive] ✔ Padrão encontrado na posição ${i} — desloca +1 e continua`,
        });
      }
    }

    return steps;
  }
}
