import { NaiveSearch }      from '../algorithms/NaiveSearch.js';
import { KMPSearch }        from '../algorithms/KMPSearch.js';
import { RabinKarpSearch }  from '../algorithms/RabinKarp.js';
import { BoyerMooreSearch } from '../algorithms/BoyerMoore.js';

/**
 * Mantém a estratégia ativa e oferece acesso centralizado
 * a todos os algoritmos disponíveis.
 */
export class SearchContext {
  constructor() {
    this.algorithms = {
      naive:      new NaiveSearch(),
      kmp:        new KMPSearch(),
      rabinkarp:  new RabinKarpSearch(),
      boyermoore: new BoyerMooreSearch(),
    };

    this._strategy = this.algorithms.naive;
  }

  /**
   * Define o algoritmo ativo pelo identificador.
   * @param {string} key - 'naive' | 'kmp' | 'rabinkarp' | 'boyermoore'
   */
  setStrategy(key) {
    if (!this.algorithms[key]) {
      throw new Error(`Algoritmo desconhecido: ${key}`);
    }
    this._strategy = this.algorithms[key];
  }

  get strategy() {
    return this._strategy;
  }

  /**
   * Lista todos os algoritmos disponíveis.
   * @returns {{ key: string, name: string }[]}
   */
  listAlgorithms() {
    return Object.entries(this.algorithms).map(([key, alg]) => ({
      key,
      name: alg.name,
    }));
  }

  /**
   * Executa a busca com o algoritmo ativo.
   */
  search(text, pattern) {
    return this._strategy.search(text, pattern);
  }

  /**
   * Executa todos os algoritmos e retorna os resultados.
   * @returns {{ key, name, positions, comparisons }[]}
   */
  searchAll(text, pattern) {
    return Object.entries(this.algorithms).map(([key, alg]) => {
      const result = alg.search(text, pattern);
      return { key, name: alg.name, ...result };
    });
  }

  /**
   * Executa passo a passo com o algoritmo ativo.
   */
  stepByStep(text, pattern) {
    return this._strategy.stepByStep(text, pattern);
  }
}
