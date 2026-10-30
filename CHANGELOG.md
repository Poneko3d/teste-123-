## v0.31 — 23/10/2026 — local

- Peça com volume: contornos fechados que não dividem a topologia podem gerar uma região por projeção, sem usar a malha inteira como face.
- Pequenas ilhas do recorte sem prolongamento são redistribuídas entre as peças, com limites de volume e validação; regiões grandes continuam rejeitadas. Cavidades internas são preservadas.
- A projeção pode ajustar detalhes mínimos da borda. A superfície importada não passa por redução de polígonos.
- Teste do contorno salvo da fantasy statue: 1.916.134 triângulos após reparo de importação, altura de 130 mm e espessura de 2 mm, sem prolongamento. Duas peças fechadas, sem componentes positivos extras. União, volume ausente, volume externo e sobreposição verificados com tolerância relativa de 1e-7. Validação completa: aproximadamente 91 s neste computador.
- Limite: este teste não valida o prolongamento do conector nem todos os contornos possíveis. Corte + pino mantém sua exigência de separação da superfície.

## v0.30 — 23/10/2026 — local

- Marcadores de pontos com raio de 4 px (5 selecionado, 6 sob cursor), independente do zoom. Área de clique preservada.
- Thick Patch recupera a região pelos índices exatos do contorno, evitando ambiguidades de vértices muito próximos e acesso a região nula.
- Laços fechados que não desconectam a superfície são identificados antes de construir uma peça inválida com a malha inteira. Mensagem esclarece a ligação adicional; não oferece repetir o mesmo autoajuste.
- Regressão com laço em toro e projeto real da estátua com 16 pontos. O caso real continua exigindo um corte adicional ou alteração da região: não foi forçada uma separação com fragmentos.

## v0.29 — 22/10/2026 — local

- Importação STL densa: união apenas de coordenadas idênticas antes do reparo, sem simplificação automática.
- Reparo limitado de regiões não manifold: tentativas restritas a 0,01% da área e até 2.000 triângulos. A malha resultante passa pela validação do motor geométrico.
- Fechamento de pequenas aberturas não planas tenta diferentes projeções e confere orientação das bordas.
- Componentes 3MF são preparados separadamente, preservando posições e evitando unir peças que apenas se encostam.
- Slider de raio do pincel sincronizado com o valor digitado e marcador.
- Testes reais: fantasy statue (1.916.195 triângulos) importado com 7 aberturas reparadas; região reconstruída de 0,003794% da área. Spiderman de Terno importado; Aparecidinha importada com 5 objetos e 2.036.144 triângulos, sem redução. Estes testes validam importação; não garantem todos os cortes possíveis.


## v0.28 — 22/10/2026 — local

- Caminhos ponderados pela distância sobre triângulos adjacentes, com refinamento nas arestas. Interseções planas só são mantidas quando têm comprimento equivalente (até 1%).
- Busca limitada, sem fallback de varredura completa da malha por segmento. Não promete geodésica global exata.
- Marcador de raio do pincel em tempo real: disco tangente ou três círculos para volume esférico.
- Pincel plano seleciona disco raso (profundidade de 15% do raio); esférico inclui dobras conectadas dentro do raio. Nenhum altera a malha.
- 34 regressões existentes passaram; regressão adicional de pincel e 6 caminhos no Miranha. Desvio reproduzível: 7,114 mm para 5,007 mm. Corte real preserva volume e fecha ambas as peças.

## v0.27 — 22/10/2026 — local

- Raio X automático ao ajustar pinos, incluindo Plano e conectores entre duas peças; restaura opacidade ao sair.
- Prévia imediata com retorno ao ponto inicial, sem cálculos de caminhos no movimento do cursor.
- Pontos continuam a partir do último ponto, mantendo o início fixo. Clique no início fecha o contorno.
- Segmentos confirmados usam a topologia em cache; os anteriores são preservados.
- Testes de interação e regressão, incluindo caminho no Miranha com 1.857.134 triângulos.

# Poneko Studio — histórico até a v0.24

Consolidado em 11/10/2026 a partir do README, DEPLOYMENT, histórico GitHub e conversa de desenvolvimento. Antes da v0.18 não há commits por versão no repositório atual. As primeiras etapas estão agrupadas quando a numeração exata não pode ser comprovada. Este log registra mudanças implementadas, não uma garantia de correção universal.

| Versão / etapa | Mudanças registradas |
|---|---|
| Início, até v0.2 | Aplicação web independente inspirada no CatPin; visualização de malhas, cortes planos e conectores retangulares afunilados. Sem registro confiável para separar as entregas de v0.1 e v0.2. |
| v0.3 | Evolução para contornos sobre a superfície, buscando acompanhar o desenho em vez de depender somente de planos. Há captura local identificada como v03. |
| v0.4 | Reparo de importação e evolução da edição de pontos e controles de pino. Há captura local de reparo identificada como v04; a distribuição exata das melhorias de interação entre as primeiras versões não está preservada. |
| v0.5 | Objetos independentes, cortes sucessivos, montagem/explosão e importação de OBJ/STL/3MF/FBX. Teste histórico do Kitten com redução ativada: 23 objetos. |
| v0.6 | Redução de polígonos opcional e desligada por padrão; painéis recolhíveis; ajustes de pino por sliders/gizmo. |
| v0.7–v0.10 | Posicionamento e limites de pinos; geração de grupos em todo o modelo; limiar de ângulo; separação de gestos de câmera/edição; picking acelerado; suavização do contorno e grupos por vincos ou orientação. Não há notas independentes suficientes para atribuir cada mudança às v0.8 e v0.9. |
| v0.11 | Peça com volume (Thick Patch), espessura e encaixe derivado do formato da face. |
| Entre v0.11 e v0.12 | Nome Poneko Studio, identidade visual, cores e logo Poneko; revisão da interface. |
| v0.12 | Preenchimento de pequenas lacunas na seleção; ocultar/exibir objetos; controles contextuais; volume afunilado contínuo e extensão opcional; montagem/explosão individual animada; controles globais no topo; PT-BR/EN. |
| v0.13 | Prévias automáticas; suavização da seleção de faces; linha e desenho livre projetados pela câmera; pinos retangulares, cilíndricos e hexagonais; gizmo combinado e inversão de lado; direção de explosão revisada; adaptações para telas móveis e otimizações. Cortes projetados ainda não tinham pinos nessa versão. |
| v0.14 | Tratamento do Thick Patch por faces separado do fechamento do corte completo; melhorias no caminho de suavização sobre a superfície. Testes nos dois olhos do Miranha a 16 graus. |
| v0.15 | Menu flutuante de ícones sobre faces; suavização inicial em zero; peça sem extensão limitada ao material existente; testes ampliados em regiões do Miranha e Kitten, com limitações de seleção registradas. |
| v0.16 / v0.16.1 | Revisão do fechamento dos olhos e fragmentos de borda; preservação dos triângulos externos selecionados; folga progressiva para dentro; tratamento de triângulos coincidentes; renomear objetos; comprimento inicial do encaixe de 8 para 4 mm. |
| v0.17 | Escala global; opção de preservar folgas em mm reconstruindo operações salvas; conectores proporcionais ou de medidas fixas; salvar/abrir projeto .poneko; reescala atômica e desfazível. |
| v0.18 | Login Google para baixar/salvar, com edição livre; primeira publicação em studio.poneko3d.com.br; GitHub integrado à Hostinger. Atualizações sem nova numeração acrescentaram ajuda contextual PT-BR/EN. |
| v0.19 | Exportação montada em arquivo único 3MF/OBJ/STL; grupos persistentes após cortes e no projeto; limite de tamanho dos grupos; valores digitáveis; duplo clique para selecionar/desmarcar; edição de pontos e linhas; menus contextuais; histórico global; conectores pós-corte e ajuste à região. |
| v0.20 | Reparo individual após cortes; furos circulares, quadrados, retangulares e hexagonais, cegos ou passantes; prévia e aplicação; operações preservadas no histórico e na reescala. |
| v0.21 | Pinos por região em cortes por linha; prioridade dos pontos sobre gizmos; modal de importação com redução percentual opcional; pincel de seleção; diagnóstico/preenchimento de lacunas e autoajuste; preservação de vincos no agrupamento; seleção no conjunto; linha limitada às partes atingidas; recuperação de superfície no Thick Patch. |
| v0.22 | Ferramentas no topo; modelo, dimensões, escala e exportação abaixo; importação no cabeçalho; bandeiras de idioma; janela de objetos arrastável, redimensionável, encaixável à esquerda/direita e com posição/visibilidade persistidas; layout móvel revisado. |

## Publicações confirmadas

Datas locais de São Paulo, com base nos commits (não horários exatos de término do deploy):

| Versão | Data | Commit |
|---|---|---|
| v0.18, primeira publicação | 09/10/2026 | d259c954 |
| Ajuda contextual | 09/10/2026 | 58285b1e, d043b6b6 |
| v0.19 | 10/10/2026 | 8ca487ca |
| v0.20 | 10/10/2026 | 7e978c49 |
| v0.21 | 10/10/2026 | 0155132c |
| v0.22 | 11/10/2026 | bc36180b |

## Limitações ainda relevantes

- Auto-resolve não reconstrói qualquer malha ambígua, com auto-interseções ou regiões complexas.
- Testes em olhos/pernas do Miranha não comprovam funcionamento em todos os modelos.
- Desempenho em aparelhos móveis reais ainda não está amplamente validado.
- Ajuste automático de folga na reescala depende do histórico de operações; não identifica encaixes arbitrários em arquivos importados já cortados.
- Projetos .poneko preservam operações concluídas; traçados em edição não são salvos.
- Não houve validação física de impressão ou certificação universal em fatiadores.

Fontes: README.md, DEPLOYMENT.md e https://github.com/Poneko3d/poneko-studio/commits/main/ . Alguns parágrafos antigos do README ainda dizem que v0.20/v0.21 são locais; o histórico GitHub e as verificações de publicação posteriores corrigem esse status.

## v0.23 — publicada em 11/10/2026

- Ferramentas em janela arrastável, redimensionável e anexável aos lados, com ícones por ferramenta.
- União numérica do contorno corrigida para triângulos pequenos, sem reduzir o modelo.
- Descarte de triângulos degenerados na subdivisão das bordas.
- Fechamento interno ajustado quando a superfície selecionada é rebaixada e o fechamento inicial produziria volume negativo; contorno original preservado.
- Linhas continuam sendo aplicadas individualmente.

Validação: suíte completa; 20 contornos no Miranha; regressão de separação no Miranha com cerca de 1,85 milhão de triângulos, conservação de volume e borda; corte por linha localizado e os dois olhos.

## v0.24 — sincronização autorizada em 11/10/2026

- Pincel direto, sem geração prévia de grupos; adição/remoção de triângulos e conversão da borda em corte.
- Menu contextual do pino com mover, girar, escala e inversão de lado.
- Painéis anexados sem altura/largura residuais do redimensionamento flutuante.
- Caminhos com busca local e cache limitado por modelo; corte projetado reutiliza a separação entre prévias e aplicação.
- Menu Sobre; páginas públicas de apresentação, termos, privacidade e versões; canonical, Open Graph, dados estruturados, robots e sitemap.
- Dados públicos de atendimento reutilizados de poneko3d.com.br. Sem redução de polígonos nas otimizações.

### Complementos da v0.24
- Páginas Sobre, Termos, Privacidade e Atualizações em PT-BR e inglês, com URLs próprias e alternância de idioma.
- Pincel complementa a seleção de grupos; retorno visual durante o gesto e resultados progressivos.
- Somente o gizmo escolhido fica visível. Menu afastado do pino com confirmar/aplicar e remover/cancelar.
- Salvar projeto no cabeçalho, incluindo contornos e seleção em edição.
- Histórico da sessão com reversão isolada de ações independentes; dependências posteriores são protegidas.


## v0.25 — sincronização autorizada em 12/10/2026

- Indicador animado de processamento e cancelamento real do worker, descartando resultados atrasados e permitindo continuar com a peça anterior.
- Importação 3MF e STL em segundo plano; sem redução automática. 3MF preserva transformações e unidades de montagem.
- Thick Patch: cache da prévia, menu contextual, ajuste de profundidade e espessura, recorte sem extensão limitado ao material; cavidades internas não são consideradas peças soltas.
- Limpeza limitada a resíduos numéricos subprecisão, com aviso na prévia e preservação da geometria restante.
- Teste Aparecidinha: 5 peças, 2.036.144 triângulos. Paredes que não acomodam o encaixe são bloqueadas, sem descartar detalhes para forçar o corte.
- Limitação: a leitura inicial de FBX ainda ocorre na interface; os cálculos geométricos seguintes são canceláveis em segundo plano.


## v0.26 — otimização, sincronização autorizada em 12/10/2026

- Conectividade compacta por buffers; vizinhos de vértices preparados somente quando necessários.
- Geração de faces por vizinhos diretos, com cache de normais por geometria imutável. Resultados idênticos aos anteriores em comparações de todos os labels.
- Lista de objetos com nomes legíveis e ações separadas, incluindo alvos maiores em telas de toque.
- Medições por etapa e oportunidades restantes documentadas em PERFORMANCE-v026.md.
