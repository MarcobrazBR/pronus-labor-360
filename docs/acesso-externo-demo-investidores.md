# Acesso Externo Para Demo Com Investidores

Data: 2026-04-29

## Objetivo

Permitir demonstracoes do PRONUS LABOR 360 fora da rede local sem transformar o ambiente de desenvolvimento em producao.

## Estado Do MVP

Portas locais usadas hoje:

- Portal PRONUS: `http://localhost:3000`
- Portal RH Cliente: `http://localhost:3001`
- Portal Colaborador: `http://localhost:3002`
- API: `http://localhost:3333`

A API agora aceita origens externas por variavel de ambiente:

```env
ALLOWED_ORIGINS=https://portal-pronus-demo.example.com,https://portal-rh-demo.example.com,https://portal-colaborador-demo.example.com
NEXT_PUBLIC_API_URL=https://api-pronus-demo.example.com
```

## Caminho Recomendado Para Reuniao

Para apresentacao com investidores, a melhor experiencia e publicar uma demo temporaria em nuvem:

- frontends em Vercel ou servico equivalente;
- API em Railway, Render, Fly.io ou servico equivalente;
- banco em Supabase;
- dados demonstrativos, sem CPF real, dados medicos, dados financeiros ou documentos reais.

Esse caminho reduz risco de queda da maquina local, evita dependencia da rede da reuniao e cria URLs estaveis.

## Alternativas De Túnel Temporario

### Cloudflare Quick Tunnel

Uso indicado: demonstracao rapida com URL publica temporaria.

Referencia oficial: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/

Comando base:

```bash
cloudflared tunnel --url http://localhost:3000
```

Observacoes:

- gera um subdominio aleatorio `trycloudflare.com`;
- e publico enquanto o processo estiver rodando;
- a propria documentacao da Cloudflare posiciona Quick Tunnel para testes e desenvolvimento, nao producao;
- para os tres portais e a API, o ideal e usar hostnames/tuneis separados ou um tunel configurado com ingress.

### ngrok

Uso indicado: demonstracao rapida com URL publica e configuracoes simples.

Referencias oficiais:

- https://ngrok.com/docs/guides/share-localhost/tunnels
- https://ngrok.com/docs/http/

Comando base:

```bash
ngrok http 3000
```

Observacoes:

- o agente cria uma conexao TLS de saida e entrega uma URL publica;
- para experiencia mais estavel, usar dominios reservados e autenticacao do ngrok;
- se a API tambem estiver em tunnel, atualizar `NEXT_PUBLIC_API_URL` dos portais e `ALLOWED_ORIGINS` da API.

### Tailscale Serve/Funnel

Uso indicado: teste com pessoas autorizadas em uma rede privada, ou exposicao publica controlada quando necessario.

Referencias oficiais:

- https://tailscale.com/docs/features/tailscale-serve
- https://tailscale.com/kb/1223/funnel

Comando base privado:

```bash
tailscale serve 3000
```

Observacoes:

- Serve compartilha com dispositivos da mesma tailnet;
- Funnel publica na internet e deve ser usado com mais cautela;
- e uma boa opcao para teste com terceiros conhecidos, principalmente quando todos podem entrar na tailnet.

## Regra De Seguranca

Antes de abrir qualquer tunnel publico:

- confirmar quais portais serao expostos;
- usar somente dados demonstrativos;
- conferir `ALLOWED_ORIGINS`;
- manter o tunnel aberto apenas durante a apresentacao;
- encerrar o processo ao final;
- nao expor banco, Prisma Studio, logs internos ou ferramentas administrativas de desenvolvimento.

## Proximo Passo Tecnico

Para uma demo externa robusta, o proximo ciclo deve criar um perfil `demo` com:

- seeds demonstrativas controladas;
- URLs configuraveis por ambiente;
- banco Supabase separado de desenvolvimento;
- usuario/senha de demo documentados;
- pipeline simples para atualizar os tres portais e a API antes das reunioes.
