# Regra de Atualizacao de Screenshots

Data de criacao: 2026-04-29

## Objetivo

Manter o GitHub do Pronus Labor 360 visualmente preparado para apresentacoes, captacao de investimento, revisoes comerciais e alinhamento de produto.

## Regra

Sempre que houver mudanca visual relevante no sistema, as imagens do README devem ser atualizadas no mesmo ciclo de desenvolvimento.

Essa regra se aplica a:

- telas de login;
- navegacao lateral ou superior;
- dashboards dos portais;
- identidade visual, logo, paleta, tipografia ou espacamento;
- fluxos que serao apresentados a clientes, investidores ou parceiros;
- telas que tenham mudanca significativa de UX.

## Arquivos Mantidos

As imagens oficiais do README ficam em:

```text
docs/assets/screenshots/
```

Capturas atuais:

- `portal-pronus.png`
- `portal-rh-cliente.png`
- `portal-colaborador.png`
- `login-pronus.png`
- `login-rh-cliente.png`
- `login-colaborador.png`

## Cuidados Obrigatorios

- Usar somente dados demonstrativos.
- Nao publicar CPF real, dados medicos, dados financeiros, documentos reais ou dados sensiveis.
- Conferir se as imagens estao legiveis no GitHub antes do commit.
- Atualizar o README junto com os arquivos de imagem quando nomes ou caminhos mudarem.

## Definition of Done Visual

Uma mudanca visual so deve ser considerada pronta quando:

- o layout foi validado pelo navegador;
- as Heuristicas de Usabilidade de Jakob Nielsen foram revisadas;
- os screenshots do README foram atualizados, quando aplicavel;
- `docs/status-desenvolvimento-atual.md` registrou a alteracao visual relevante.
