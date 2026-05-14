# Avaliacao UX Nielsen - Prioridade 4 Portal RH

Data: 2026-05-13

## Escopo

Revisao do painel inicial do Portal RH Cliente como parte da Prioridade 4 do MVP, com foco em dashboard, documentos, pendencias cadastrais e indicadores basicos.

## Heuristicas Aplicadas

### 1. Visibilidade do status do sistema

- O painel passou a exibir base de clientes, pendencias do RH, adesao psicossocial e score operacional logo no primeiro bloco.
- Prazos, contrato e status da campanha aparecem no contexto da empresa.

### 2. Correspondencia com o mundo real

- A fila "Proximas acoes do RH" usa linguagem operacional: aprovar divergencias, validar cadastros, revisar plano de acao e acompanhar documentos.
- A leitura por setor aproxima a experiencia do RH da rotina real de gestao por area.

### 3. Controle e liberdade do usuario

- Cards e linhas criticas apontam para as rotas corretas: clientes, divergencias, psicossocial, documentos e risco ocupacional.
- O RH consegue sair do indicador direto para a area de acao.

### 4. Consistencia e padroes

- Cores, bordas, raio, tipografia e botoes seguem o padrao visual ja aplicado nos portais.
- Badges de status continuam usando as classes compartilhadas do Portal RH.

### 5. Prevencao de erros

- O painel evita expor dados clinicos individuais.
- Indicadores psicossociais permanecem agregados por setor.
- A lista de acoes prioriza pendencias que podem comprometer conformidade.

### 6. Reconhecimento em vez de memorizacao

- O RH nao precisa lembrar onde tratar cada pendencia: cada item acionavel funciona como atalho.
- Status e percentuais aparecem juntos do contexto.

### 7. Flexibilidade e eficiencia

- A tela usa melhor a largura disponivel em desktop e mantem grade responsiva.
- A composicao reduz rolagem inicial ao concentrar indicadores e fila prioritaria no topo.

### 8. Design estetico e minimalista

- O painel remove excesso narrativo e prioriza numeros, filas e sinais de status.
- O visual evita sobrecarga de cards pequenos e trabalha com secoes operacionais bem delimitadas.

### 9. Recuperacao de erro

- Pendencias vencidas, campanhas vencidas e assinaturas pendentes aparecem com sinalizacao mais forte.
- A interface orienta o proximo passo sem abrir modais desnecessarios.

### 10. Ajuda e documentacao

- A propria tela atua como guia operacional, com proximas acoes e links de resolucao.
- O comportamento esperado permanece documentado no roadmap e no historico do MVP.

## Observacao

A Prioridade 4 foi interpretada conforme a matriz do MVP: fortalecimento do Portal RH/Cliente com dashboard, consulta de documentos, pendencias cadastrais e indicadores basicos. A proxima fatia recomendada e conectar esses indicadores a persistencia real no Supabase assim que a API publica estiver definida.
