# Cadastro automático de solicitações do site

Fluxo: formulário → Pages Function `/api/avaliacao` → Formspree (registro e e-mail)
→ webhook autenticado do Make → POST `https://clientesads.vercel.app/api/lead-in`.

O módulo HTTP do Make usa uma credencial privada no cabeçalho `x-webhook-secret`,
igual ao `LEAD_IN_SECRET` do projeto clientesads na Vercel. Não incluir a chave em
URL, corpo de requisição, repositório, HTML ou JavaScript entregue ao navegador.

Variáveis de **Production** do projeto Cloudflare Pages grupoportel:

- `MAKE_SITE_WEBHOOK_URL`: endereço HTTPS do webhook em hook.us2.make.com.
- `MAKE_SITE_API_KEY`: segredo enviado em `x-make-apikey`; configurar como Secret.

As variáveis entram em vigor no próximo deployment. Sem as duas variáveis, o envio
ao Make não está habilitado. Uma configuração incompleta produz erro genérico no
log do servidor, sem registrar contatos, chaves ou endereço do webhook.

Campos enviados ao CRM:

| Campo | Conteúdo |
| --- | --- |
| nome | Empresa |
| decisor | Nome do contato |
| email | E-mail |
| whatsapp | Telefone |
| nicho | Setor |
| mensagem | Faturamento e gargalo informados |
| origem | site |

Usar JSON estruturado no Make, com escape automático dos valores. Manter a
autenticação por chave e interromper a execução quando o CRM retornar erro HTTP.
O CRM compara telefone e e-mail antes de cadastrar. Ativar processamento sequencial
no cenário para evitar duas criações simultâneas do mesmo contato.

A confirmação no site significa que o Formspree aceitou a solicitação. O envio ao
Make roda em segundo plano por `waitUntil`, com limite de cinco segundos. Falhas da
automação não descartam o registro no Formspree nem impedem o e-mail. Este fluxo não
possui fila própria ou retentativa automática no site: acompanhar falhas no Make e
conferir a Inbox do Formspree se a automação estiver indisponível.

Antes de concluir: testar um formulário real identificado como teste, confirmar o
registro no CRM e repetir o mesmo contato para verificar que não cria outro lead.
Testes locais: `tools/verify-intake.cjs` e `tools/verify-site-lead.cjs`.
