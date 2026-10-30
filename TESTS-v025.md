# v0.25 — validação local, 12/10/2026

- Suíte automática completa: passou (32 arquivos de teste).
- Aparecidinha: importação sem redução, 5 peças, 2.036.144 triângulos; transforms/unidades do pacote preservados. Arquivo de teste privado não incluído no código.
- Matriz sobre as 5 peças: 5 cortes planos com pino, 10 Thick Patches sem extensão e 8 Thick Patches com extensão aprovados. Dois encaixes estendidos em faces de paredes finas foram bloqueados por atravessarem material, mesmo reduzindo as medidas. Os cortes sem extensão passam nesses locais.
- Saídas da matriz verificadas como sólidos fechados com volume positivo. Cortes sem extensão verificam conservação do volume.
- Navegador: importação 3MF cancelada, objeto anterior preservado; nova importação concluída sem recarregar. Indicador animado visível e botão Cancelar responsivo.
- Navegador: pintura de 1.395 triângulos na Aparecidinha, prévia de Thick Patch sem extensão, menu flutuante e aplicação. Resultado: 6 objetos, mantendo as quatro peças não editadas.
- Correções: cavidades internas eram contadas como fragmentos; remoção de resíduos numéricos limitada por precisão e volume, sem simplificar vértices restantes; prévia reutilizada na aplicação.
- Limites: não é garantia para toda seleção possível. Extensões sem espaço continuam bloqueadas. Leitura inicial FBX ainda na interface. Sem benchmark em hardware móvel físico.
- Publicação: sincronização autorizada em 12/10/2026; confirmação do deploy registrada separadamente.
