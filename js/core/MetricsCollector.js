/**
 * Registra métricas de execução dos algoritmos.
 * Usa performance.now() para precisão em microssegundos.
 */
export class MetricsCollector {
  constructor() {
    this._records = [];
  }

  /**
   * Executa uma função e mede seu tempo + resultado.
   * @param {string} algorithmName
   * @param {Function} fn - Função que retorna { positions, comparisons }
   * @returns {{ name, positions, comparisons, timeMs }}
   */
  measure(algorithmName, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    const record = {
      name: algorithmName,
      positions: result.positions,
      comparisons: result.comparisons,
      timeMs: +(end - start).toFixed(4),
    };

    this._records.push(record);
    return record;
  }

  /**
   * Retorna todos os registros acumulados.
   */
  getAll() {
    return [...this._records];
  }

  /**
   * Limpa todos os registros.
   */
  clear() {
    this._records = [];
  }

  /**
   * Formata o tempo em ms ou µs dependendo da magnitude.
   * @param {number} ms
   * @returns {string}
   */
  static formatTime(ms) {
    if (ms < 1) return `${(ms * 1000).toFixed(1)} µs`;
    return `${ms.toFixed(3)} ms`;
  }
}
