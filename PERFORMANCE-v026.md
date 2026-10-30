# Revisão do Poneko Studio — 12/10/2026

## Corrigido nesta versão

A topologia guardava milhões de chaves de texto e arrays em um Map, além de vizinhos de vértices calculados mesmo para operações que não precisavam deles. Foi substituída por conectividade compacta em buffers de inteiros. Triângulos, posições e ordem de faces não foram alterados. O acesso a vizinhos na geração de grupos agora é direto; as normais são reutilizadas enquanto a topologia não muda. Nomes de objetos não disputam espaço horizontal com quatro botões.

## Medições locais

Node.js, mesmo computador, processos separados com coleta de lixo explícita. Memória é o incremento retido por topologia (heap + ArrayBuffers), não o consumo total do navegador. Tempo de grupos exclui preparação inicial de topologia. Leituras únicas comparáveis; não são benchmark de celular nem garantia de tempo.

| Etapa | Aparecidinha antes → depois | Miranha antes → depois |
|---|---|---|
| Triângulos da peça | 1.476.488 → iguais | 1.857.134 → iguais |
| Preparar topologia | 3,15 s → 1,09 s | 3,87 s → 1,38 s |
| Memória retida da topologia | 865,6 MiB → 195,0 MiB | 1.094,1 MiB → 274,0 MiB |
| Grupos por bordas, 15°, tamanho 0 | 2,13 s → 0,22 s | 2,47 s → 0,27 s |
| Grupos por bordas, tamanho 0,01% | 2,19 s → 0,37 s | 2,56 s → 0,49 s |
| Grupos por orientação, normais já preparadas | 1,89 s → 0,14 s | 2,43 s → 0,18 s |

Os hashes de TODOS os labels foram iguais nos seis cenários comparados. Não houve simplificação ou redução de resolução. Isto não implica que booleanas completas ficaram 9 vezes mais rápidas.

## Próximas melhorias, em ordem de prioridade

1. **Memória em cortes sucessivos (alta):** o histórico principal limita a 40 estados, mas ObjectProject também mantém undoStack sem limite. Medir retenção de malhas e consolidar os históricos com orçamento em bytes. Preservar as operações necessárias para reescala.
2. **Prévia e trabalho repetido (alta):** há cache e debounce, mas a fila global é FIFO. Introduzir prioridade/interrupção de prévias obsoletas e manter operações finais atômicas; medir principalmente séries de sliders.
3. **Interface livre durante toda importação (alta):** FBX ainda é lido na interface. Mover a leitura de geometria para worker sem depender de DOM/texturas. 3MF/STL/OBJ já usam segundo plano.
4. **Proteção do trabalho (alta):** existe salvar/abrir projeto, mas não recuperação automática local. Acrescentar rascunho em IndexedDB, aviso de alterações não salvas e recuperação após queda de aba. Definir limites e opção para limpar dados.
5. **Diagnóstico visual (alta):** marcar no modelo o local de parede insuficiente, interseção ou contorno inválido, com prévia da correção. Evitar tentativas genéricas que não explicam o que mudou.
6. **Fluxo de ferramentas (média):** unificar seleção → ajuste → prévia → aplicar/cancelar. Alguns estados ainda distribuem ações pela lateral e menus flutuantes. Contextos incompatíveis devem sumir.
7. **Celular (alta para esse público):** painéis em gavetas, foco em uma tarefa e comandos de toque explícitos. Testar em aparelhos reais com memória limitada; a tentativa de sobrescrever viewport nesta sessão não mudou a largura efetiva, portanto não é validação móvel.
8. **Carregamento inicial (média):** separar importadores e ferramentas sob demanda. Build atual concentra cerca de 870 kB de JS principal antes de gzip. Medir rede fria antes de escolher divisão de pacotes.
9. **GPU (investigação):** hoje renderização WebGL; booleanas e topologia na CPU/WASM. Avaliar GPU para seleção e análises adequadas apenas após perfil; não prometer migração automática do motor geométrico.
10. **Observabilidade (alta):** painel local opcional com duração por etapa, memória estimada, triângulos e motivo de cancelamento/erro. Montar regressões de fluidez com modelos densos, finos e defeituosos.

## Limites da revisão

Análise do código, regressões geométricas e inspeção visual desktop. Sem validação em telefone físico, sem promessa de eliminar o custo das booleanas ou consertar toda malha defeituosa. Melhorias acima que não estão em 'Corrigido nesta versão' permanecem propostas.
