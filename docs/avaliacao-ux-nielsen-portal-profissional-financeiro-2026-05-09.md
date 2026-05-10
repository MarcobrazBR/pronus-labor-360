# Avaliacao UX Nielsen - Portal Profissional e Financeiro

Data: 2026-05-09

## Escopo revisado

- Portal Profissional de Saude: resumo de prontuario, estados da consulta, controles de video, transcricao e finalizacao.
- Portal PRONUS Operacoes: novo modulo Financeiro com pagamento dos profissionais.

## Heuristicas aplicadas

### 1. Visibilidade do status do sistema

- A agenda do profissional diferencia atendimento ativo, chamada encerrada e consulta finalizada por cor e texto.
- A area de video mostra se a gravacao esta ativa ou se o audio ja foi processado.
- O Financeiro mostra consultas finalizadas, pendentes e valor a pagar na mesma linha do profissional.

### 2. Correspondencia com o mundo real

- A consulta so entra em pagamento quando o profissional finaliza a anamnese, refletindo o fechamento clinico do atendimento.
- A anamnese recebe a transcricao apos o encerramento da chamada, como aconteceria em um fluxo assistido por IA.
- O resumo do prontuario fica ao lado da consulta em andamento, onde o profissional naturalmente busca contexto.

### 3. Controle e liberdade do usuario

- O profissional pode voltar a consultas com chamada encerrada para complementar a anamnese antes de finalizar.
- O botao Finalizar consulta permanece separado do encerramento da chamada para evitar fechamento clinico acidental.
- A leitura em audio do resumo permite preparacao rapida antes ou durante a troca de agenda.

### 4. Consistencia e padroes

- O portal mantem logo, paleta, espacamento, cards de 8px e botoes do mesmo sistema visual dos demais portais.
- O novo Financeiro usa a mesma lateral, cabecalho, tabela e hierarquia visual do Portal PRONUS.
- Os controles de video foram convertidos para icones com tooltip, mantendo comportamento previsivel.

### 5. Prevencao de erros

- Atendimentos futuros ficam bloqueados enquanto o atendimento anterior nao foi encerrado.
- A consulta so pode ser finalizada apos a chamada ser encerrada e a anamnese revisada.
- Consultas finalizadas bloqueiam edicao, reduzindo risco de alteracao posterior sem governanca.

### 6. Reconhecimento em vez de memorizacao

- Status de agenda usa rotulos diretos: Em atendimento, Chamada encerrada, Consulta finalizada e Aguardando.
- O painel direito chama explicitamente "Resumo do prontuario" e informa que e um resumo GPT demonstrativo gerado 5 horas antes.
- O modulo Financeiro se chama pelo termo esperado pelo operador administrativo.

### 7. Flexibilidade e eficiencia

- O resumo pode ser lido ou ouvido, atendendo profissionais que preferem leitura rapida ou audio.
- A transcricao automatica reduz retrabalho de digitacao e acelera a finalizacao.
- A lista financeira concentra quantidade, pendencia e valor, evitando navegacao por varios paineis.

### 8. Estetica e design minimalista

- A lateral direita deixou de duplicar agenda e passou a entregar contexto clinico do paciente atual.
- Os botoes de video sairam da imagem da chamada, reduzindo interferencia visual na consulta.
- O Financeiro evita dashboard numerico e usa uma lista operacional objetiva.

### 9. Ajuda para reconhecer e recuperar falhas

- Tooltips explicam quando um atendimento esta bloqueado ou quando a finalizacao ainda nao esta liberada.
- Mensagens na anamnese orientam a encerrar a chamada antes de finalizar.
- Estados vermelho e azul sinalizam claramente o que ainda exige acao clinica e o que esta concluido.

### 10. Ajuda e documentacao

- O status de desenvolvimento foi atualizado com as regras de transcricao, resumo, finalizacao e pagamento.
- As capturas devem ser atualizadas apos mudancas visuais relevantes, seguindo a regra ja documentada.

## Resultado

A rodada aproxima o portal profissional do fluxo real de teleatendimento: o profissional se prepara com um resumo do prontuario, atende com controles limpos, encerra a chamada, revisa a anamnese transcrita e finaliza a consulta. O Portal PRONUS passa a refletir esse fechamento clinico no financeiro, dando base para pagamento mensal dos profissionais.
