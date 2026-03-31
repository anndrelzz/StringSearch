/**
 * Renderiza o gráfico comparativo de algoritmos usando Chart.js.
 * Duplo eixo Y: comparações (barras) e tempo (linha).
 */
export class ChartRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this._chart = null;
  }

  /**
   * Renderiza ou atualiza o gráfico com os resultados de todos os algoritmos.
   * @param {{ name: string, comparisons: number, timeMs: number }[]} results
   */
  render(results) {
    this._destroy();

    const labels      = results.map(r => r.name);
    const comparisons = results.map(r => r.comparisons);
    const times       = results.map(r => r.timeMs);

    this._chart = new Chart(this.canvas, {
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Comparações',
            data: comparisons,
            backgroundColor: 'rgba(60, 60, 200, 0.5)',
            borderColor: 'rgba(60, 60, 200, 1)',
            borderWidth: 1,
            yAxisID: 'yComparisons',
          },
          {
            type: 'line',
            label: 'Tempo (ms)',
            data: times,
            borderColor: 'rgba(200, 60, 60, 1)',
            backgroundColor: 'rgba(200, 60, 60, 0.1)',
            borderWidth: 2,
            pointRadius: 4,
            yAxisID: 'yTime',
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { color: '#ccc', font: { family: 'monospace', size: 12 } } },
          title: {
            display: true,
            text: 'Comparação de Algoritmos — Comparações vs Tempo',
          },
        },
        scales: {
          yComparisons: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Comparações' },
            beginAtZero: true,
          },
          yTime: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Tempo (ms)' },
            beginAtZero: true,
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  }

  _destroy() {
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }
  }

  clear() {
    this._destroy();
  }
}

// Plugin para fundo escuro do canvas
Chart.register({
  id: 'darkBackground',
  beforeDraw(chart) {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  },
});
