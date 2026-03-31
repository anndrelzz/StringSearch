import { SearchContext }    from '../core/SearchContext.js';
import { MetricsCollector } from '../core/MetricsCollector.js';
import { LogPanel }         from './LogPanel.js';
import { ChartRenderer }    from './ChartRenderer.js';

export class UIController {
  constructor() {
    this.context  = new SearchContext();
    this.metrics  = new MetricsCollector();

    // --- Elementos da UI ---
    this.textArea       = document.getElementById('text-input');
    this.patternInput   = document.getElementById('pattern-input');
    this.algorithmSel   = document.getElementById('algorithm-select');
    this.fileInput      = document.getElementById('file-input');
    this.fileLabel      = document.getElementById('file-label');

    this.btnRun         = document.getElementById('btn-run');
    this.btnStep        = document.getElementById('btn-step');
    this.btnPrev        = document.getElementById('btn-prev');
    this.btnNext        = document.getElementById('btn-next');
    this.btnAuto        = document.getElementById('btn-auto');

    this.textDisplay    = document.getElementById('text-display');
    this.logOutput      = document.getElementById('log-output');
    this.stepCounter    = document.getElementById('step-counter');
    this.auxPanel       = document.getElementById('aux-panel');
    this.resultsTable   = document.getElementById('results-table');
    this.resultsBody    = document.getElementById('results-body');
    this.chartCanvas    = document.getElementById('chart-canvas');
    this.chartSection   = document.getElementById('chart-section');
    this.stepSection    = document.getElementById('step-section');
    this.positionsList  = document.getElementById('positions-list');
    this.errorMsg       = document.getElementById('error-msg');

    this.algoDescription = document.getElementById('algo-description');
    this.logPanel   = new LogPanel(this.textDisplay, this.logOutput, this.stepCounter, this.auxPanel);
    this.chart      = new ChartRenderer(this.chartCanvas);

    this.ALGO_INFO = {
      naive: {
        nome: 'Naive (Força Bruta)',
        como: 'Alinha o padrão em cada posição do texto e compara caractere por caractere da esquerda para a direita. Se houver mismatch, abandona e desloca +1. Nunca pula posições.',
        complexidade: 'O(n · m) pior caso',
      },
      kmp: {
        nome: 'KMP (Knuth-Morris-Pratt)',
        como: 'Usa a tabela LPS para aproveitar comparações já feitas. Em caso de mismatch, recua o padrão (não o texto) para o maior prefixo que também é sufixo — evitando recomparar caracteres já visitados.',
        complexidade: 'O(n + m) sempre',
      },
      rabinkarp: {
        nome: 'Rabin-Karp',
        como: 'Calcula um hash da janela atual e compara com o hash do padrão. Se os hashes forem diferentes, pula a janela inteira sem comparar nenhum caractere. Só compara char a char quando o hash bate (para evitar falsos positivos).',
        complexidade: 'O(n + m) médio, O(n · m) pior caso',
      },
      boyermoore: {
        nome: 'Boyer-Moore (Bad Character)',
        como: 'Compara o padrão da direita para a esquerda. Em caso de mismatch, usa a tabela Bad Character para calcular um salto maior que 1 — pulando posições que certamente não podem casar.',
        complexidade: 'O(n / m) melhor caso, O(n · m) pior caso',
      },
    };

    this._populateAlgorithmSelect();
    this._bindEvents();
  }

  _populateAlgorithmSelect() {
    // Opção "Comparar TODOS"
    const optAll = document.createElement('option');
    optAll.value = 'all';
    optAll.textContent = '▶ Comparar TODOS';
    this.algorithmSel.appendChild(optAll);

    // Algoritmos individuais
    this.context.listAlgorithms().forEach(({ key, name }) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = name;
      this.algorithmSel.appendChild(opt);
    });

    // Seleciona naive por padrão
    this.algorithmSel.value = 'naive';
  }

  _bindEvents() {
    this.btnRun.addEventListener('click', () => this._onRun());
    this.btnStep.addEventListener('click', () => this._onStep());
    this.btnPrev.addEventListener('click', () => this.logPanel.prev());
    this.btnNext.addEventListener('click', () => this.logPanel.next());
    this.btnAuto.addEventListener('click', () => this._toggleAuto());

    this.fileInput.addEventListener('change', (e) => this._onFileUpload(e));

    // Desabilita passo a passo no modo "Comparar TODOS"
    this.algorithmSel.addEventListener('change', () => {
      this.btnStep.disabled = this.algorithmSel.value === 'all';
    });
  }

  _validate() {
    const text    = this.textArea.value.trim();
    const pattern = this.patternInput.value.trim();

    if (!text) {
      this._showError('Insira ou carregue um texto.');
      return null;
    }
    if (!pattern) {
      this._showError('Insira um padrão para buscar.');
      return null;
    }
    if (pattern.length > text.length) {
      this._showError('O padrão é maior que o texto.');
      return null;
    }

    this._clearError();
    return { text, pattern };
  }

  _onRun() {
    const input = this._validate();
    if (!input) return;

    const { text, pattern } = input;
    const selectedKey = this.algorithmSel.value;

    this.metrics.clear();
    this._hideStep();
    this.logPanel.reset();

    if (selectedKey === 'all') {
      this._runAll(text, pattern);
    } else {
      this._runSingle(selectedKey, text, pattern);
    }
  }

  _runSingle(key, text, pattern) {
    this.context.setStrategy(key);
    const record = this.metrics.measure(
      this.context.strategy.name,
      () => this.context.search(text, pattern)
    );

    this._renderResultsTable([record]);
    this._renderPositions(record.positions);
    this.chartSection.hidden = true;
    this._showTextDisplay(text, record.positions, pattern.length);
  }

  _runAll(text, pattern) {
    const rawResults = this.context.searchAll(text, pattern);
    const records = rawResults.map(r =>
      this.metrics.measure(r.name, () => ({ positions: r.positions, comparisons: r.comparisons }))
    );

    this._renderResultsTable(records);

    // Usa posições do primeiro algoritmo (todos devem ser iguais)
    this._renderPositions(records[0].positions);
    this._showTextDisplay(text, records[0].positions, pattern.length);

    // Gráfico
    this.chartSection.hidden = false;
    this.chart.render(records);
  }

  _onStep() {
    const input = this._validate();
    if (!input) return;

    const { text, pattern } = input;
    const key = this.algorithmSel.value;

    this.context.setStrategy(key);
    const steps = this.context.stepByStep(text, pattern);

    if (steps.length === 0) {
      this._showError('Nenhum passo gerado (verifique texto e padrão).');
      return;
    }

    // Armazena o texto no elemento para o LogPanel usar
    this.textDisplay.dataset.text = text;

    this._showStep();
    this._renderAlgoDescription(key);
    this.logPanel.load(steps, pattern);
    this._renderPositions([]);
    this.chartSection.hidden = true;
    this.resultsTable.hidden = true;
  }

  _toggleAuto() {
    if (this.logPanel.isRunning()) {
      this.logPanel.stopAuto();
      this.btnAuto.textContent = '⏵ Auto';
    } else {
      this.logPanel.startAuto(500);
      this.btnAuto.textContent = '⏹ Parar';
    }
  }

  _showTextDisplay(text, positions, patternLen) {
    // Highlight das ocorrências no texto estático
    this.textDisplay.dataset.text = text;
    let html = '';
    const foundSet = new Set(positions);

    for (let i = 0; i < text.length; i++) {
      const char = text[i] === ' ' ? '&nbsp;' : text[i];
      if (foundSet.has(i)) {
        html += `<span class="char-found-mark">`;
        for (let k = 0; k < patternLen; k++) {
          const c = text[i + k] === ' ' ? '&nbsp;' : text[i + k];
          html += c;
        }
        html += `</span>`;
        i += patternLen - 1;
      } else {
        html += `<span>${char}</span>`;
      }
    }

    this.textDisplay.innerHTML = html;
  }

  _renderResultsTable(records) {
    this.resultsBody.innerHTML = '';
    records.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.name}</td>
        <td>${r.comparisons}</td>
        <td>${MetricsCollector.formatTime(r.timeMs)}</td>
        <td>${r.positions.length}</td>
      `;
      this.resultsBody.appendChild(tr);
    });
    this.resultsTable.hidden = false;
  }

  _renderPositions(positions) {
    this.positionsList.innerHTML = '';
    if (positions.length === 0) {
      this.positionsList.textContent = 'Nenhuma ocorrência encontrada.';
      return;
    }
    positions.forEach(pos => {
      const chip = document.createElement('span');
      chip.className = 'position-chip';
      chip.textContent = pos;
      this.positionsList.appendChild(chip);
    });
  }

  _onFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    this.fileLabel.textContent = files.map(f => f.name).join(', ');

    const readers = files.map(
      f =>
        new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = ev => res(ev.target.result);
          reader.onerror = rej;
          reader.readAsText(f);
        })
    );

    Promise.all(readers).then(contents => {
      this.textArea.value = contents.join('\n\n--- arquivo separador ---\n\n');
    });
  }

  _renderAlgoDescription(key) {
    const info = this.ALGO_INFO[key];
    if (!info || !this.algoDescription) return;
    this.algoDescription.innerHTML = `
      <div class="algo-desc-box">
        <span class="algo-desc-name">${info.nome}</span>
        <span class="algo-desc-complexity">${info.complexidade}</span>
        <p class="algo-desc-how">${info.como}</p>
      </div>
    `;
  }

  _showStep() {
    this.stepSection.hidden = false;
  }

  _hideStep() {
    this.stepSection.hidden = true;
    this.logPanel.stopAuto();
    this.btnAuto.textContent = '⏵ Auto';
  }

  _showError(msg) {
    this.errorMsg.textContent = msg;
    this.errorMsg.hidden = false;
  }

  _clearError() {
    this.errorMsg.textContent = '';
    this.errorMsg.hidden = true;
  }
}
