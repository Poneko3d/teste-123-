# Poneko Studio 0.26

Aplicativo web para separar um modelo em vários objetos imprimíveis, por cortes sucessivos, com encaixes opcionais. Processamento no navegador; implementação independente do CatPin.

## Novidades da v0.26

Conectividade compacta da malha, acesso direto a faces vizinhas e cache de normais para gerar grupos. Os triângulos e os resultados de agrupamento são preservados. Lista de objetos com nomes e ações em linhas separadas. Medições e análise de melhorias: PERFORMANCE-v026.md.

## Novidades da v0.25

Indicador animado de processamento e cancelamento real dos cálculos em segundo plano. Leitura 3MF/STL fora da interface, sem redução automática. Thick Patch com cache de prévia, menu contextual e ajuste à peça; cavidades internas não são confundidas com fragmentos. Paredes finas continuam protegidas contra encaixes que atravessam material.

Validação: suíte com 32 arquivos de teste; Aparecidinha com 5 peças e 2.036.144 triângulos. Consulte TESTS-v025.md para resultados e limites. Sincronização autorizada em 12/10/2026; main aciona a publicação automática.

## Abrir no Windows

Dê dois cliques em **Abrir Poneko Studio.cmd** e mantenha a janela aberta. O iniciador abre http://127.0.0.1:5182/. Requer Node.js instalado ou o runtime local do Codex. Compile com `pnpm install` e `pnpm build` para gerar a pasta `dist`.

## Objetos e cortes sucessivos

1. Importe OBJ, STL, 3MF ou FBX. A importação repara defeitos comuns e separa componentes em objetos. Cavidades internas ficam vinculadas à peça que as contém.
2. Escolha um objeto no painel **Objetos**. Ele fica destacado no conjunto para desenhar o próximo corte.
3. Marque pontos, desenhe livremente, arraste um círculo ou selecione faces. Pontos existentes podem ser arrastados. Um clique no primeiro ponto fecha a linha; arrastá-lo move esse ponto.
4. Feche o contorno, ajuste o pino pelos sliders e clique em **Gerar as duas partes**. Somente o objeto selecionado é substituído pelas duas novas peças.
5. Selecione qualquer uma das peças e continue cortando. As outras permanecem no projeto.

**Desfazer último corte** restaura o objeto anterior. **Desfazer** dentro do traçado desfaz pontos ou movimentos. Os traçados em andamento são guardados por objeto durante a sessão. Importar outro modelo inicia um novo projeto. Salve o projeto .poneko para preservar os objetos e o histórico de cortes antes de recarregar ou fechar a página. Traçados e seleções em edição também são salvos na v0.24. O histórico de desfazer da sessão não é persistido.

## Vista montada / explodida

**Montada** usa as coordenadas originais. **Explodida** afasta visualmente os objetos, incluindo descendentes de cortes anteriores. Essas transformações não afetam STL ou ZIP. Selecione o objeto na lista para voltar à edição com o conjunto visível. Cada objeto tem exportação individual, e **Baixar todos** exporta o conjunto em ZIP.

## Seleção de faces

Ative **Faces**, escolha Bordas marcadas / vincos ou Orientação da superfície, gere os grupos, ajuste o limite e confirme. Um clique substitui a seleção; dois cliques adicionam um grupo. **Usar borda como corte** transforma a borda da seleção em contorno magnético editável.

A seleção precisa formar uma única região contínua, sem buracos. Um único triângulo plano ou uma região que não delimita volume não cria duas peças. Regiões que dobram sobre si mesmas também podem precisar de seleções menores.

## Formatos e unidades

- OBJ: leitura incremental, índices positivos/negativos e triangulação de polígonos. Os registros `g` não são tratados automaticamente como sólidos independentes. OBJ e STL sem unidades são interpretados em milímetros.
- STL: texto ou binário.
- 3MF: malhas e transformações de montagem; unidades do modelo convertidas para milímetros. Modelos com unidades diferentes dentro do mesmo pacote são recusados com explicação.
- FBX: malhas estáticas e transformações; escala de unidade convertida quando informada. Materiais, texturas, rigging e animações não fazem parte do fluxo de impressão.

Não há suporte universal a outras extensões. Arquivos limitados a 800 MB. A redução de polígonos vem desativada. Ative “Reduzir polígonos ao importar” antes de escolher um arquivo se desejar uma malha de trabalho mais leve (alvo de 180 mil faces por componente). A tolerância é informada quando aplicada. O reparo ainda pode remover faces inválidas ou fechar buracos. Modelos densos exigem mais memória e tempo.

## Reparo

Corrige orientação, faces repetidas/degeneradas, pequenas frestas no reparo padrão e buracos com bordas simples. O reparo denso usa estruturas compactas para grandes arquivos indexados. Não garante reconstrução de qualquer auto-interseção ou borda ambígua. Furos preenchidos são aproximações da superfície ausente.

## Validação

Execute `node test.mjs`, `node surface.test.mjs`, `node continuous.test.mjs`, `node repair.test.mjs`, `node project.test.mjs`, `node controller.test.mjs` e `node formats.test.mjs`.

Os testes cobrem geometria fechada, volume, folga, exportação STL, contornos livres, reparo, cortes recursivos, preservação de peças irmãs, desfazer, conversão de seleção de faces e posições de montagem/explosão. O teste do controlador usa DOM mínimo e o motor real, sem validar aparência ou renderização no navegador.

O arquivo de teste fornecido `kitten v2.obj` (328 MB, 3.463.965 triângulos) foi importado, reparado e separado em 23 objetos. Foram corrigidas 576 faces e fechados 3 buracos. A versão de trabalho contém 1.292.658 triângulos, com tolerância acumulada máxima de 0,103473 unidade. Dois cortes sucessivos em um objeto passaram no teste de integração. Esse resultado corresponde ao teste histórico com redução ativada na versão 0.5; desde a versão 0.6, a redução é opcional e vem desativada. As interações atuais foram verificadas no navegador com o modelo de exemplo.

## Desenvolvimento

`pnpm install`, `pnpm dev`, `pnpm build`. Dependências: Three.js, Manifold, cdt2d e fflate.

## Edição e painéis
O pino aparece após fechar o contorno, numa posição interior com margem para o encaixe. Use Mover, Girar ou Tamanho para manipular o gizmo, sincronizado com os sliders. O gizmo limita o movimento à área disponível. A verificação usa uma margem conservadora para toda a largura, espessura e folga; regiões estreitas podem exigir medidas menores. O corte final também valida a profundidade e as paredes do modelo. Afinamento e folga são ajustados pelos sliders. Clique nos títulos para recolher as seções; os botões Objetos e Ferramentas no topo ocultam as laterais.

## Grupos automáticos de faces
Em Faces, clique em Gerar grupos no modelo. A divisão colorida cobre todos os triângulos do objeto em edição sem alterar a geometria. Ajuste o limite de ângulo no slider e confirme os grupos. Um clique substitui a seleção; dois cliques em outro grupo adicionam esse grupo. Use a borda da seleção como contorno. O método Bordas usa o ângulo entre triângulos vizinhos; Orientação compara cada região com sua face inicial; um limite menor preserva mais divisões. A seleção para corte ainda precisa formar uma região contínua sem buracos.

## Suavização da borda
Após fechar o contorno, abra Suavizar borda do corte. Intensidade controla oito passagens de suavização projetadas sobre a superfície; Desvio máximo limita o deslocamento dos pontos amostrados. A prévia laranja usa 32 a 128 pontos. Aplicar confirma; Descartar mantém a borda original. A prévia bloqueia o corte até a decisão. Esta ferramenta ajusta a linha de corte, não cria um chanfro ou arredondamento físico na peça. O modelo original não é suavizado nem reduzido.

## Interação e desempenho
Esquerdo usa a ferramenta ativa; direito gira a câmera; botão do meio desloca a vista; scroll aproxima. Girar ativa navegação com o esquerdo. Mover/Girar/Tamanho do pino ativam exclusivamente o gizmo. Editar pontos devolve o esquerdo ao traçado. Gestos não são compartilhados entre as ferramentas. A câmera não conserva inércia depois de soltar.
A busca por triângulos usa uma árvore espacial construída no worker, sem alterar a geometria ou os índices das faces. A cena só é redesenhada quando há mudanças. As cores dos grupos e a geometria do pino são reutilizadas. No teste de picking com 36.480 triângulos, a média foi 44 testes de triângulo por raio, com os mesmos pontos de interseção da busca completa. Isso não é uma medição global de FPS nem do tempo de operações booleanas em modelos grandes.

## Área com espessura e encaixe no formato da face
Escolha esse tipo de separação antes de usar a borda de uma seleção em Faces. A região é projetada na direção média das faces selecionadas e extrudada para dentro do sólido. Espessura da peça controla a profundidade da região extraída; Área do encaixe controla o perfil interno (porcentagem nominal, limitada pela margem disponível); Comprimento controla a extensão do macho; Folga expande a cavidade. A prévia laranja mostra a peça extraída com seu encaixe. Funciona também em regiões planas, que não delimitariam volume no corte normal. O encaixe utiliza o contorno projetado, incluindo concavidades, e é validado contra a parede externa do modelo. Se atravessar a parede, reduza a profundidade. Regiões selecionadas precisam ter uma única borda e direção definida. Sem Criar encaixe e cavidade, gera somente a região com espessura.


### Atualização 0.12
- Pequenas lacunas internas na seleção por Faces são preenchidas ao preparar o contorno, sem simplificar a malha.
- Olhinho por objeto; a visibilidade persiste entre vista montada e explodida.
- Controles contextuais por ferramenta e etapa, com botões para escolher o tipo de corte.
- Volume contínuo afunilado; checkbox de prolongamento independente da espessura, mantendo o afunilamento quando desligado.

- Montagem/explosão por objeto com animação reversível; controles gerais no topo direito.
- Seletor PT-BR / EN com preferência persistida no navegador.

## Novidades da v0.13

- Prévia automática ao selecionar faces, concluir um desenho ou ajustar medidas. Abrir a suavização ou mudar seus sliders atualiza a linha laranja; Aplicar confirma o contorno.
- Suavizar borda da seleção prepara a região diretamente no modo Faces. Pequenas lacunas internas são incorporadas à seleção; regiões desconectadas continuam exigindo ajuste.
- Linha: arraste de fora a fora do modelo para criar um plano de corte conforme a câmera. Livre: comece fora do modelo e desenhe uma área; sua projeção atravessa toda a profundidade do objeto. Esses cortes projetados não incluem pinos nesta versão.
- Pinos retangulares, cilíndricos e hexagonais, com gizmo simultâneo de posição, rotação e escala. A seta ao lado inverte a peça que recebe o pino. O movimento fica no corte e a rotação ocorre em torno da normal.
- A direção da explosão considera o centro de volume de cada resultado, independente da ordem retornada pelo corte.

## Celulares e desempenho

Em telas estreitas, o modelo ocupa a parte superior e os painéis ficam abaixo, com rolagem independente e controles maiores. Ative Girar: um dedo orbita; dois dedos movem e aproximam. Volte a Editar pontos para desenhar. Adicionar à seleção permite acumular grupos sem depender de duplo toque.

O processamento de geometria e preparação visual roda em worker. A topologia magnética é preparada apenas quando necessária, prévias de sliders são agrupadas, a seleção compartilha buffers visuais e cortes preservam a geometria das peças não alteradas. Não há redução automática de polígonos. O máximo suportado depende da memória e GPU do dispositivo; tela móvel foi verificada no navegador, sem certificação de desempenho em hardware móvel real.

## Correções da v0.14

Peças com volume selecionadas por Faces usam o contorno normalizado diretamente para construir o volume. Não exigem o fechamento interno do modo de corte completo, que rejeitava pequenas dobras na projeção. A suavização procura primeiro um corredor local da malha e, se a interseção por plano falhar, percorre faces adjacentes, mantendo todos os trechos na superfície.

Regressão verificada no Spiderman, limite de 16°: olho com 8.844 triângulos e 554 pontos de borda, e olho oposto com 7.780 triângulos. Ambos passaram por prévia, suavização de 44% / limite de 0,5 mm e corte com espessura de 2 mm, área de 70%, extensão de 8 mm e folga de 0,2 mm.

## v0.15

Menu de ícones acima da seleção: corte pelo contorno, peça com volume, suavização e limpar seleção. Acompanha a câmera e se oculta sem seleção ou durante outra operação. Suavização começa em 0%, preservando o caminho original. Sem prolongamento, a peça é recortada apenas no material existente.

Amostragem ampliada: oito regiões do Spiderman passaram sem suavização; uma de seis seleções do maior componente do Kitten original passou. Cinco foram bloqueadas pela limitação de contorno único/sem buracos. Esses casos permanecem limitações conhecidas; não há garantia para todo tipo de região.

## v0.16.1

Renomeie cada objeto pelo lápis na lista de objetos; o nome também é usado na exportação. O comprimento inicial do encaixe passou de 8 para 4 mm.

Quando o contorno de Faces percorre as arestas originais, o volume conserva os triângulos externos selecionados e liga a borda real ao perfil interno afunilado. A folga aumenta da abertura até a ponta, evitando capturar fragmentos da borda vizinha. Contornos manuais ou suavizados que passam pelo interior dos triângulos ainda usam a construção por projeção. Resultados com novos fragmentos desconectados são rejeitados.

O fechamento remove pares de triângulos opostos exatamente coincidentes e corrige arestas degeneradas na precisão numérica, sem reduzir a resolução do modelo. Teste sequencial no Spiderman fornecido: dois olhos, grupos de 15°, extensão de 4 mm, espessura de 2 mm, área de 70% e folga de 0,2 mm. Ambos resultaram em uma peça, sem bordas abertas ou arestas não manifold. O corpo ficou sem bordas abertas, mas conserva seis contatos degenerados presentes no arquivo original. Não houve validação em fatiador ou impressão física.

## v0.17 — escala e projeto editável

Abra **Escala e projeto** na área de objetos. A porcentagem é relativa ao tamanho atual e atua uniformemente sobre todos os objetos em suas posições de montagem, inclusive os ocultos. A prévia mostra as dimensões antes/depois. A reescala não reduz polígonos.

**Manter folgas em mm**, ligado por padrão, reconstrói os cortes concluídos a partir das raízes e das operações salvas. **Reescalar os conectores** controla largura, espessura e comprimento dos pinos; desligado, mantém essas medidas. Para encaixes por face, mantém a área absoluta da ponta e o prolongamento; a espessura da peça acompanha a escala geral. A redução é rejeitada se a ponta deixar de caber na face. Sem preservação e com conectores proporcionais, aplica apenas a transformação geométrica e as folgas também mudam.

Salvar/abrir **.poneko** conserva malhas, nomes, visibilidade, posições, escala e cortes concluídos. Traçados e seleções em edição também são salvos na v0.24. O histórico de desfazer da sessão não é persistido. Conclua ou limpe o traçado antes de reescalar. A operação é atômica e pode ser desfeita: um encaixe inválido cancela toda a reescala. Cortes por contorno que dependam de superfícies alteradas por encaixes anteriores podem ser recusados pela validação de cobertura.

Modelos importados já cortados e cortes das versões anteriores não possuem histórico paramétrico recuperável. Suas folgas existentes não são identificadas nem corrigidas automaticamente. A preservação vale para cortes registrados nesta versão; o painel explicita a ausência de histórico.

Validação: folga geométrica de 0,2 mm medida antes/depois de escala de 200%; pinos fixos; cortes recursivos; rejeição sem alteração; desfazer; salvar/reabrir sem perda de coordenadas. No Spiderman original fornecido, os dois olhos foram separados a 15°, o projeto foi salvo/reaberto, e reescalado para 120% e depois 80% do tamanho original: cada olho e o corpo permaneceram com um componente e status NoError. A configuração de folga permaneceu em 0,2 mm. Isso não equivale a validação em fatiador ou impressão física.

O fluxo de sincronização solicitado está em `DEPLOYMENT.md`: publicar via GitHub somente ao comando do usuário, com deploy automático após configurar a integração.

## v0.18 — conta Google para baixar

Importação, edição e cortes continuam disponíveis sem conta. Os botões de baixar STL, ZIP, modelo reparado e projeto `.poneko` exigem uma sessão Google do Firebase do site Poneko. O login abre em uma janela separada para manter o modelo em memória; cancelar mantém a edição. As malhas não são enviadas ao Firebase. O SDK de autenticação é carregado do CDN oficial do Firebase, versão fixada em 13.0.0.

O domínio publicado precisa estar autorizado no Firebase Authentication. Este é um controle do fluxo de exportação no cliente, não um DRM ou uma autorização de arquivos armazenados no servidor: os dados e o processamento já estão no navegador do visitante.


### v0.19 — publicada no commit 8ca487c

- Exportar conjunto montado em um único 3MF, OBJ ou STL. 3MF usa um objeto de montagem com componentes; OBJ mantém objetos nomeados; STL mantém volumes sem nomes. Exportação usa coordenadas originais, independentemente da vista explodida ou visibilidade. ZIP continua opcional.
- Grupos de faces têm limite de tamanho em porcentagem da área do objeto, além do ângulo. Ambos aceitam valores digitados e sliders. Regiões pequenas se unem pela maior borda compartilhada; superfícies desconectadas permanecem separadas. A malha não é simplificada.
- Grupos são guardados por objeto e no projeto; superfícies herdadas mantêm seus grupos após cortes. Novas superfícies de corte recebem novos grupos.
- Dois cliques selecionam/desmarcam objetos, pontos e grupos. Seleções de grupos são cumulativas. Dois cliques na linha inserem um ponto; botão direito remove; arraste de ponta a ponta fecha o contorno. Desmarcar um objeto conserva seu rascunho.
- Regressões: exportação montada validada nas três peças do Miranha (coordenadas e contagem de triângulos); geração a 15 graus no original de 1.857.134 triângulos: 47.778 grupos com tamanho 0, 293 com 0,01%, 142 com 0,05%. Hash da malha preservado. Selecionar/desmarcar objeto, olho e ponto conferidos no navegador local.

Testes adicionais: `node editing.test.mjs`, `node export-assembly.test.mjs`, `node face-size.test.mjs`. Testes locais com os arquivos fornecidos: `node export-assembly.test.mjs --real` e `node .real-face-size-test.mjs`.

- Menu contextual com ícones para pontos e trechos, além de faces. Dois cliques em um ponto mostram ações; clique em um trecho mostra inserção e seleção das pontas. Ações incompatíveis com o estado do contorno ficam ocultas.
- Ajuste automático também nos cortes planos, considerando contornos vazados. Conector após corte: sliders, inversão real de pino/cavidade, verificação da parede inteira, aplicação atômica, desfazer/refazer testados.
- `node .real-groups-test.mjs`: corte do olho original do Miranha preserva grupos nas duas peças e no projeto salvo/reaberto.


### v0.20 — reparo por peça e furos (local, ainda não publicada)

Selecione um objeto e use **Reparar peça** ou **Fazer furo** em Objetos. O reparo preserva todas as coordenadas existentes: remove duplicatas, orienta faces e triangula pequenas bordas abertas. O limite em mm usa a diagonal da caixa da abertura. Bordas ambíguas, não manifold ou acima do limite interrompem a operação sem substituir o original. Não reconstrói detalhes perdidos nem corrige toda auto-interseção. Cavidades fechadas e furos passantes válidos permanecem intactos. A prévia é automática e exige Aplicar.

Furos: círculo, quadrado, retângulo e hexágono; clique para posicionar ou arraste do centro na superfície. Medidas e rotação aceitam números e sliders. A profundidade é medida para dentro a partir do ponto clicado, na direção perpendicular à superfície; Atravessar estende o cortador através da peça inteira. A prévia mostra a subtração real, sem alterar outras peças. Aplicar, desfazer/refazer, salvar/reabrir e reescalar mantêm o histórico da operação.

Validação: testes de volume para furos cegos/passantes; limites e rejeição atômica; reparo de par pino/cavidade sem mover vértices; cavidades válidas preservadas; projeto salvo/reaberto e reescala. No olho já separado do Spiderman fornecido, reparo de triângulo removido e furos cegos/passantes passaram com malhas NoError. Não houve teste em fatiador ou impressão física.

## v0.21 — validação local

Cortes por linha criam um pino ajustado para cada região atravessada. Os pontos têm prioridade sobre o gizmo. A importação pergunta se deseja preservar a malha (padrão) ou reduzir uma porcentagem aproximada dos triângulos.

A seleção de faces oferece pincel, diagnóstico de bordas em vermelho e proposta de preenchimento em laranja. Confira e aplique a proposta. Autoajuste do contorno respeita o desvio máximo configurado. Reparos ambíguos ainda podem exigir ajuste manual; não há garantia para toda malha produzida por IA. A limpeza de grupos pequenos preserva vincos fortes.

Testes: suíte completa; corte nas duas pernas do Spiderman original com dois pinos, repetição após escala, limites do encaixe, pincel, diagnóstico e redução opcional.

Correção adicional: o segmento da linha seleciona apenas os componentes atravessados, com teste em uma perna do Miranha e nas duas direções do traço. Thick Patch recupera os triângulos da superfície sem exigir a tampa plana do corte global. Ambos os olhos de teste a 15 graus geraram sólidos válidos.

## v0.22 — organização da interface

Ferramentas no topo; informações, escala e exportação em Modelo e arquivo, abaixo. Importar fica no cabeçalho com Novo, Abrir e Salvar. PT-BR/EN têm bandeiras vetoriais. Objetos é uma janela independente: arraste pelo título, solte nas bordas para anexar ou use os botões de encaixe. As setas do teclado movem a janela flutuante; a posição e a visibilidade são lembradas. Em telas pequenas o painel abre sobre a área de trabalho e pode ser ocultado no cabeçalho.

Conferido no navegador: encaixe esquerdo/direito, arraste livre, anexação por arraste, teclado, persistência, ocultar/reabrir, troca de idioma e largura de 390 px sem transbordamento horizontal. Testes de controlador e idiomas passaram. Sincronização autorizada em 11 de outubro de 2026.
