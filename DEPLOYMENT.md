# Publicação do Poneko Studio

Destino: https://studio.poneko3d.com.br, separado do site principal.
Repositório privado: https://github.com/Poneko3d/poneko-studio
Branch: main.

## Fluxo combinado

- Desenvolver e validar localmente.
- Sincronizar com o GitHub somente quando o usuário pedir **syncar**.
- A integração da Hostinger deve publicar cada alteração em main.
- Confirmar o deploy e a versão no endereço público antes de informar conclusão.
- Nunca enviar modelos de teste, credenciais, node_modules ou arquivos locais temporários ao repositório.

## Estado em 9 de outubro de 2026

Fontes, testes e recursos da versão 0.18 enviados ao repositório privado. Build e testes de autenticação, controlador e idioma passaram localmente.

O vínculo antigo de studio.poneko3d.com.br com public_html/studio foi removido com autorização explícita do usuário para criar um web app independente. A pasta antiga continha somente a página padrão default.php. O novo aplicativo está publicado em https://studio.poneko3d.com.br. A Hostinger confirmou implantação concluída, SSL ativo e implantação automática ativada. A branch main do repositório poneko-studio aciona a publicação. A primeira implantação usou d259c954 e levou 13 segundos. O plano usa 2 de 5 aplicações web.

Firebase existente: gen-lang-client-0794690760. O domínio studio.poneko3d.com.br foi adicionado com autorização do usuário e aparece na lista de domínios autorizados. O usuário concluiu o login Google em produção; a interface mostrou a sessão ativa e o download do ZIP do exemplo foi concluído. Sem conta, o download abriu o pedido de login e não iniciou exportação. O app usa auth.poneko3d.com.br em produção, conforme a configuração do site principal.

## Configuração de build

Framework Vite; Node 22.12+ ou 24; pnpm install --frozen-lockfile; pnpm build; saída dist. A distribuição contém JavaScript, worker e WebAssembly. O processamento de geometria acontece no navegador, sem servidor de modelos. Servir .wasm como application/wasm e habilitar HTTPS.

O controle de download Google é implementado no cliente. Importar, editar e cortar não exige conta. STL, ZIP e projeto .poneko passam pelo mesmo controle. Não é proteção DRM de dados que já estão no navegador.

## Ajuda contextual (sincronização autorizada)

Ajuda curta por painel e ferramenta, em português e inglês, com botões de interrogação e janela acessível em telas pequenas. Build, testes de idioma e controlador passaram; abertura, tradução, fechamento por Esc e layout móvel conferidos no navegador. Esta atualização não inclui os novos ajustes de pontos ou conectores, que permanecem pendentes.


## Sincronização v0.19

Commit 8ca487ca43729d673168f35827f40c1da70a5d26 enviado a main via integração GitHub. Site confirmado servindo index-BC36p7mh.js. A v0.20 foi publicada posteriormente, conforme registro abaixo.

## Sincronização v0.20 — 10 de outubro de 2026

Commit 7e978c4925ef9a73c8e2d6c21fe338c393208a1f enviado a main com autorização explícita. Publicação confirmada servindo index-BQ5b6-uP.js. Inclui reparo individual e furos cegos/passantes.

A sincronização da v0.21 foi autorizada em seguida, após as correções de linha finita e Thick Patch. Testes de regressão passaram, incluindo uma perna e os dois olhos do Miranha.

## Sincronização v0.22 — 11 de outubro de 2026

Publicação autorizada da reorganização da interface: ferramentas no topo, modelo e arquivo abaixo, importação no cabeçalho, bandeiras de idioma e janela de objetos destacável com encaixe nas laterais. Build e testes de controlador/idioma passaram; interface conferida no navegador em desktop e 390 px.

## Sincronização v0.23 — 11 de outubro de 2026

Commit a6bfdec3cbf6a9827f41d9fcfac4480553c68c43 enviado a main. Site conferido servindo index-BRh_h2qN.js. 

## Sincronização v0.24 — 11 de outubro de 2026

Autorizada pelo usuário após os testes. Inclui pincel progressivo e complementar às faces, menu contextual e gizmo exclusivo do pino, histórico seletivo com proteção de dependências, progresso de edição salvo e páginas institucionais PT-BR/EN com SEO técnico. Suite de regressão passou; pincel verificado no Miranha denso, sem redução de polígonos.
