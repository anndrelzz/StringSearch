/**
 * Classe base para todos os algoritmos de busca.
 * Cada algoritmo deve estender esta classe.
 */
export class SearchStrategy {
  constructor(name) {
    this.name = name;
  }

  /**
   * Executa a busca completa.
   * @param {string} text
   * @param {string} pattern
   * @returns {{ positions: number[], comparisons: number }}
   */
  search(text, pattern) {
    throw new Error(`${this.name}: search() não implementado.`);
  }

  /**
   * Executa passo a passo, retornando array de steps.
   * @param {string} text
   * @param {string} pattern
   * @returns {Step[]}
   */
  stepByStep(text, pattern) {
    throw new Error(`${this.name}: stepByStep() não implementado.`);
  }
}

/**
 * @typedef {Object} Step
 * @property {number} textIndex     - Posição atual no texto
 * @property {number} patternIndex  - Posição atual no padrão
 * @property {number} windowStart   - Início da janela de comparação
 * @property {string} action        - 'match' | 'mismatch' | 'encontrado' | 'salto'
 * @property {number[]} found       - Ocorrências encontradas até agora
 * @property {number} comparisons   - Total de comparações até este passo
 * @property {string} log           - Mensagem descritiva do passo
 * @property {any}    [extra]       - Dados extras do algoritmo (lps, badChar, etc)
 */
