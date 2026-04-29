# Avaliacao UX Nielsen - Importacao e Inclusao de Clientes

Data: 2026-04-28

Escopo: Portal PRONUS em Empresas > Clientes e Portal RH Cliente em Clientes.

## Heuristicas Aplicadas

- Visibilidade do status do sistema: o fluxo de importacao agora mostra etapas claras de modelo, simulacao e importacao, alem de metricas de linhas validas, criadas e pendentes de ajuste.
- Correspondencia com o mundo real: setor, cargo e CBO aparecem com os termos usados na rotina de RH/SST e no preparo futuro para eSocial.
- Controle e liberdade do usuario: o operador pode baixar o modelo, colar conteudo, carregar CSV, simular antes de importar e limpar o risco de erro antes do envio real.
- Consistencia e padroes: o Portal RH Cliente recebeu o mesmo modelo visual e operacional da importacao do Portal PRONUS, preservando diferencas de permissao pela empresa travada.
- Prevencao de erros: a inclusao manual prioriza setor e cargo cadastrados, mantendo alternativa manual controlada quando o catalogo ainda nao esta completo.
- Reconhecimento em vez de memorizacao: listas de setor/cargo reduzem digitacao livre e exibem CBO no contexto do cargo.
- Flexibilidade e eficiencia: operadores experientes ainda podem colar CSV diretamente, enquanto novos operadores podem iniciar pelo modelo baixavel.
- Estetica e design minimalista: a importacao foi organizada em blocos menores, sem ocupar a tela com lista carregada por padrao e sem competir com a consulta de clientes.
- Ajuda no reconhecimento de erros: o retorno da simulacao separa erros/pulados e mostra as primeiras linhas que precisam de ajuste.

## Observacoes

- O backend ja armazena CBO em clientes e movimentacoes, mas a validacao profunda de catalogo na importacao em massa ainda deve evoluir quando houver persistencia real.
- O fluxo respeita a regra de tela limpa: listas de clientes continuam aparecendo apenas apos busca.
