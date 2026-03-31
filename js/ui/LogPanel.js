/**
 * Gerencia a visualização do passo a passo.
 */
export class LogPanel {
  constructor(textDisplay, logOutput, stepCounter, auxPanel) {
    this.textDisplay = textDisplay;
    this.logOutput   = logOutput;
    this.stepCounter = stepCounter;
    this.auxPanel    = auxPanel;

    this._steps     = [];
    this._current   = 0;
    this._pattern   = '';
    this._autoTimer = null;
  }

  load(steps, pattern) {
    this._steps   = steps;
    this._current = 0;
    this._pattern = pattern;
    this._stopAuto();
    this.render();
  }

  render() {
    if (this._steps.length === 0) {
      this.logOutput.textContent = 'Nenhum passo para exibir.';
      return;
    }

    const step = this._steps[this._current];
    this.stepCounter.textContent = `Passo ${this._current + 1} / ${this._steps.length}  |  Comparações: ${step.comparisons}`;

    // Cor do log baseada na ação
    this.logOutput.className = 'log-' + step.action;
    this.logOutput.textContent = step.log;

    this._renderText(step);
    this._renderAux(step);
  }

  _renderText(step) {
    const text = this.textDisplay.dataset.text || '';
    const m    = this._pattern.length;
    let html   = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i] === ' ' ? '&nbsp;' : text[i] === '\n' ? '↵' : text[i];

      if (i === step.textIndex && step.action !== 'janela' && step.action !== 'salto') {
        // Caractere sendo comparado agora
        const cls = step.action === 'match'      ? 'char-match'
                  : step.action === 'mismatch'   ? 'char-mismatch'
                  : step.action === 'encontrado' ? 'char-found'
                  : 'char-current';
        html += `<span class="${cls}">${char}</span>`;

      } else if (i >= step.windowStart && i < step.windowStart + m) {
        // Dentro da janela atual
        const cls = step.action === 'salto'      ? 'char-skip'
                  : step.action === 'encontrado' ? 'char-found'
                  : 'char-window';
        html += `<span class="${cls}">${char}</span>`;

      } else if (step.found.some(pos => i >= pos && i < pos + m)) {
        // Ocorrência já encontrada anteriormente
        html += `<span class="char-found-mark">${char}</span>`;

      } else {
        html += `<span>${char}</span>`;
      }
    }

    this.textDisplay.innerHTML = html;
  }

  _renderAux(step) {
    if (!step.extra) { this.auxPanel.innerHTML = ''; return; }

    // Tabela LPS (KMP)
    if (step.extra.lps) {
      const lps = step.extra.lps;
      let html = '<strong>Tabela LPS</strong> <small style="color:#888">(quanto recuar o padrão em caso de mismatch)</small>';
      html += '<table class="aux-table"><tr>';
      for (let i = 0; i < this._pattern.length; i++) html += `<th>${this._pattern[i]}</th>`;
      html += '</tr><tr>';
      for (let i = 0; i < lps.length; i++) {
        const active = i === step.patternIndex ? 'class="aux-active"' : '';
        html += `<td ${active}>${lps[i]}</td>`;
      }
      html += '</tr></table>';
      this.auxPanel.innerHTML = html;
    }

    // Tabela Bad Character (Boyer-Moore)
    else if (step.extra.badChar) {
      const bc = step.extra.badChar;
      const entries = Object.entries(bc);
      let html = '<strong>Tabela Bad Character</strong> <small style="color:#888">(última posição de cada char no padrão)</small>';
      html += '<table class="aux-table"><tr><th>char</th>';
      entries.forEach(([ch]) => html += `<th>'${ch}'</th>`);
      html += '</tr><tr><td style="color:#888">pos</td>';
      const currentChar = (this.textDisplay.dataset.text || '')[step.textIndex];
      entries.forEach(([ch, pos]) => {
        const active = ch === currentChar ? 'class="aux-active"' : '';
        html += `<td ${active}>${pos}</td>`;
      });
      html += '</tr></table>';
      this.auxPanel.innerHTML = html;
    }

    // Hash (Rabin-Karp)
    else if (step.extra.hashT !== undefined) {
      const match = step.extra.hashT === step.extra.hashP;
      this.auxPanel.innerHTML =
        `<strong>Hash janela:</strong> <span style="color:${match?'#7ddf7d':'#df7d7d'}">${step.extra.hashT}</span>` +
        `&nbsp;&nbsp;|&nbsp;&nbsp;<strong>Hash padrão:</strong> <span style="color:#7ddf7d">${step.extra.hashP}</span>` +
        `&nbsp;&nbsp;→ <strong>${match ? '✓ iguais (verifica chars)' : '✗ diferentes (pula janela)'}</strong>`;
    }

    else { this.auxPanel.innerHTML = ''; }
  }

  next() {
    if (this._current < this._steps.length - 1) { this._current++; this.render(); }
  }

  prev() {
    if (this._current > 0) { this._current--; this.render(); }
  }

  startAuto(intervalMs = 500) {
    this._stopAuto();
    this._autoTimer = setInterval(() => {
      if (this._current >= this._steps.length - 1) { this._stopAuto(); return; }
      this.next();
    }, intervalMs);
  }

  _stopAuto() {
    if (this._autoTimer !== null) { clearInterval(this._autoTimer); this._autoTimer = null; }
  }

  stopAuto()  { this._stopAuto(); }
  isRunning() { return this._autoTimer !== null; }

  reset() {
    this._steps = []; this._current = 0; this._pattern = '';
    this._stopAuto();
    this.textDisplay.innerHTML   = '';
    this.logOutput.textContent   = '';
    this.logOutput.className     = '';
    this.stepCounter.textContent = '';
    this.auxPanel.innerHTML      = '';
  }
}
