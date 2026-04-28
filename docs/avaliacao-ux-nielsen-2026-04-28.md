# Avaliação UX Nielsen - 2026-04-28

Escopo avaliado: Portal PRONUS, novo módulo Configurações, simulador de checklist técnico e vínculo de CNAE no cadastro de empresas.

## Resultado

1. **Visibilidade do status do sistema**
   - Atendido com cartões de resumo, mensagens de validação e score de risco após análise.

2. **Correspondência com o mundo real**
   - Atendido ao usar linguagem de SST: CNAE, Grau de Risco, PGR, PCMSO, LTCAT, CIPA, SESMT, AET, eSocial SST e checklist de campo.

3. **Controle e liberdade do usuário**
   - Atendido com abas claras, botão Fechar/Cancelar nos modais e análise sob demanda sem gravar dados automaticamente.

4. **Consistência e padrões**
   - Atendido ao manter shell, cartões, botões, abas, modal e hierarquia visual já adotados no Portal PRONUS.

5. **Prevenção de erros**
   - Atendido parcialmente com validação de CNAE de 7 dígitos, quantidade de colaboradores e aviso quando CNAE não está parametrizado.

6. **Reconhecimento em vez de memorização**
   - Atendido com etiquetas de obrigações, grau de risco, referências normativas e evidências esperadas por item do checklist.

7. **Flexibilidade e eficiência de uso**
   - Atendido com busca por CNAE, ação rápida de análise e reaproveitamento do CNAE no cadastro de empresas.

8. **Design estético e minimalista**
   - Atendido com listas em cartões compactos, sem dashboard pesado no módulo Empresa e sem botões decorativos sem função.

9. **Ajuda para reconhecer e corrigir erros**
   - Atendido parcialmente com mensagens de validação em destaque; pendente evoluir para mensagens por campo.

10. **Ajuda e documentação**
    - Atendido parcialmente dentro do checklist, com pistas de evidência técnica; pendente manual operacional do técnico.

## Ajustes feitos durante a avaliação

- Removidos botões operacionais sem ação real no módulo Configurações.
- Traduzidos status da linha do tempo para português.
- Reforçada a leitura visual de CNAE no cadastro de empresa com grau de risco e obrigações vinculadas.
- Confirmado em navegador que o menu lateral exibe Configurações e que o checklist técnico é gerado após análise.

## Riscos de UX pendentes

- Importar e versionar tabelas oficiais completas para reduzir ambiguidade regulatória.
- Persistir configurações em banco real com auditoria.
- Evoluir mensagens de erro para aparecerem junto ao campo inválido.
- Validar responsividade em viewport desktop amplo e mobile real após a próxima rodada de layout.
