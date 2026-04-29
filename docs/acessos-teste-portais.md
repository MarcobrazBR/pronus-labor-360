# Acessos de Teste dos Portais

Data de atualizacao: 2026-04-29

Este documento concentra os acessos demonstrativos usados no ambiente local de desenvolvimento. Eles existem apenas para testes do produto e apresentacoes controladas. Nao devem ser usados como credenciais reais em producao.

## URLs locais

| Portal                  | URL                           |
| ----------------------- | ----------------------------- |
| Portal PRONUS Operacoes | `http://localhost:3000/login` |
| Portal RH Cliente       | `http://localhost:3001/login` |
| Portal Colaborador      | `http://localhost:3002/login` |
| API local               | `http://localhost:3333`       |

## Credenciais demonstrativas

| Portal                  | Perfil                     | Documento            | Senha padrao |
| ----------------------- | -------------------------- | -------------------- | ------------ |
| Portal PRONUS Operacoes | Administrador Geral PRONUS | `111.222.333-00`     | `111222`     |
| Portal PRONUS Operacoes | Administrativo PRONUS      | `456.789.123-88`     | `456789`     |
| Portal PRONUS Operacoes | Corpo Clinico PRONUS       | `654.987.321-11`     | `654987`     |
| Portal PRONUS Operacoes | Corpo Clinico PRONUS       | `789.123.456-22`     | `789123`     |
| Portal RH Cliente       | Industria Horizonte        | `12.345.678/0001-90` | `123456`     |
| Portal Colaborador      | Rafael Moreira Lima        | `987.654.321-00`     | `987654`     |

## Regra de primeiro acesso

- Ao entrar com a senha padrao, o portal deve abrir um modal obrigatório para troca de senha.
- A nova senha deve ter exatamente 6 caracteres, contendo pelo menos uma letra, um numero e um caractere especial.
- Exemplo de senha valida para teste: `Aa1@bc`.
- Apos a troca, a senha padrao deixa de funcionar ate que um reset seja liberado pelo fluxo responsavel.

## Reset de senha

| Usuario afetado                                | Quem libera o reset        | Onde aparece                                         |
| ---------------------------------------------- | -------------------------- | ---------------------------------------------------- |
| Colaborador da empresa cliente                 | RH Cliente                 | Card de reset no Painel do Portal RH                 |
| Empresa/RH Cliente                             | Operacao PRONUS            | Card de reset no Painel PRONUS e cadastro da empresa |
| Usuario administrativo ou corpo clinico PRONUS | Administrador Geral PRONUS | Modulo Colaboradores > Usuarios                      |

## Observacoes para demonstracao

- As telas de login nao devem exibir CPF, CNPJ ou senha de teste.
- Sempre usar este documento para consultar credenciais demonstrativas.
- Se um acesso nao aceitar a senha padrao, execute o reset pelo fluxo correspondente ou use a senha trocada no teste anterior.
