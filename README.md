# String Search Lab

> Aplicação educacional para comparação e visualização de algoritmos de busca em strings — com análise de desempenho, modo passo a passo e gráficos comparativos.

## Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Algoritmos Implementados](#-algoritmos-implementados)
- [Funcionalidades](#-funcionalidades)
- [Como Usar](#-como-usar)
- [Tecnologias](#-tecnologias)

---

## Sobre o Projeto

O **String Search Lab** é uma ferramenta educacional e de análise de desempenho que permite executar, visualizar e comparar os principais algoritmos de busca em strings side-by-side.

Ideal para estudantes de Estruturas de Dados, Algoritmos e Teoria da Computação que querem entender **como** e **por que** cada algoritmo funciona de forma diferente — com logs detalhados, estruturas auxiliares e métricas reais de execução.

---

## Algoritmos Implementados

| Algoritmo | Abordagem | Pior Caso | Caso Médio | Melhor Caso |
|---|---|---|---|---|
| **Naive** | Força bruta | O(n · m) | O(n · m) | O(n) |
| **Rabin-Karp** | Rolling hash | O(n · m) | O(n + m) | O(n + m) |
| **KMP** | Tabela LPS | O(n + m) | O(n + m) | O(n) |
| **Boyer-Moore** | Bad character | O(n · m) | O(n / m) | O(n / m) |

---

## Funcionalidades

-  **Upload de arquivos `.txt`** com drag-and-drop (múltiplos arquivos)
-  **Entrada manual de texto** via textarea
-  **Campo de padrão** (pattern) para busca
-  **Seleção de algoritmo** com dropdown — incluindo modo **Comparar TODOS**
-  **Modo Executar** — resultado completo com métricas
-  **Modo Passo a Passo** — navegação manual com ◀ ▶ e auto-play ⏵
-  **Highlight visual** das ocorrências no texto
-  **Gráfico comparativo** (barras + linha, duplo eixo)
-  **Métricas detalhadas** — comparações, tempo (ms/µs), tamanhos
-  **Estruturas auxiliares** — tabela LPS (KMP) e Bad Character (Boyer-Moore)
-  **Lista de posições** encontradas com chips visuais

---

## Como Usar

### Executar uma busca

1. **Insira o texto** — faça upload de um `.txt` ou cole no textarea
2. **Digite o padrão** — a string que deseja encontrar
3. **Selecione o algoritmo** no dropdown
4. Clique em **▶ Executar**

### Usar o modo passo a passo

1. Preencha texto e padrão
2. Clique em **◈ Passo a Passo**
3. Navegue com os botões **◀ ▶** ou use o **⏵ auto-play**
4. Observe a tabela LPS (KMP) ou Bad Character (Boyer-Moore) na área de estruturas auxiliares

### Comparar todos os algoritmos

1. Selecione **▶ Comparar TODOS** no dropdown
2. Clique em **▶ Executar**
3. Visualize a tabela comparativa e o **gráfico de barras** com duplo eixo (comparações + tempo)

---

## 🛠️ Tecnologias

| Tecnologia |
|---|
| HTML5 |
| CSS3 |
| JavaScript (ES6+) |

---
