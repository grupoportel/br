// Keep the static HTML and the desktop React tree identical. No private playbooks.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const node = (tag, props, ...children) => ({tag, props, children:children.flat()});
const p = text => node('p', {}, text);
const h = text => node('h3', {}, text);
const card = (title, text) => node('article', {className:'public-card'}, h(title), p(text));
const heading = (label, title, text) => node('div', {className:'public-heading'}, node('p', {className:'section-kicker'}, label), node('h2', {}, title), p(text));
const section = (id, ...children) => node('section', {id, className:'public-section'}, ...children);
const intro = section('sobre', node('p', {className:'section-kicker'}, 'ESTRUTURAÇÃO E IMPLEMENTAÇÃO COMERCIAL'), node('h2', {}, 'Grupo Portel: do primeiro contato à próxima compra.'), p('Estruturamos o caminho entre atendimento, vendas e continuidade. Entendemos como as oportunidades avançam na sua empresa, identificamos o que precisa de atenção e implementamos a melhoria adequada ao seu momento.'), p('Para donos e gestores de empresas que já têm uma oferta e clientes, mas precisam organizar melhor a operação comercial.'), node('a', {className:'public-link', href:'#entregas'}, 'Conheça as formas de começar →'));
const additions = [
section('situacoes', heading('RECONHECE ALGUMA DESSAS CENAS?', 'O problema pode estar no que acontece depois do contato.', 'Nem toda dificuldade comercial pede mais anúncios ou uma ferramenta nova. Algumas aparecem nas passagens da própria operação.'), node('div', {className:'public-grid'}, card('Proposta sem próximo passo', 'A proposta foi enviada, mas ninguém sabe quem retoma a conversa, quando ou com qual contexto.'), card('Tudo depende do dono', 'Existem ferramentas, mas o acompanhamento ainda depende da memória de uma pessoa.'), card('Contato que se perde', 'O atendimento recebe a oportunidade, mas a passagem para vendas fica indefinida.'), card('Uma compra, nenhuma continuidade', 'O cliente compra uma vez e a empresa não tem um processo para manter a relação.'))),
section('entregas', heading('O QUE VOCÊ PODE CONTRATAR', 'Clareza sobre a prioridade. Execução com escopo definido.', 'Cada etapa tem uma finalidade. A conversa inicial ajuda a avaliar o próximo passo; diagnóstico, plano e implementação dependem da contratação adequada.'), node('div', {className:'public-grid'}, card('01 · Conversa inicial', 'Uma conversa gratuita de cerca de 30 minutos para entender o contexto e avaliar se faz sentido avançar. Não inclui o diagnóstico aprofundado nem um plano completo.'), card('02 · Diagnóstico e plano de ação', 'Leitura da jornada comercial, identificação da prioridade e um plano de ação com recomendações. Profundidade, prazos e entregas são definidos na contratação.'), card('03 · Implementação', 'Organização dos processos e das ferramentas necessários à prioridade acordada. Responsabilidades, participação da equipe e escopo ficam claros na proposta.'), card('04 · Acompanhamento do projeto', 'Visibilidade dos avanços, dependências e próximos marcos, com a frequência e os canais combinados para o projeto.')), node('a', {className:'public-link', href:'#contato'}, 'Quero entender o próximo passo para minha empresa →')),
section('exemplo', heading('UM EXEMPLO SIMPLES', 'Uma oportunidade precisa de contexto e próxima ação.', 'Demonstração fictícia: não representa um cliente ou resultado obtido.'), node('div', {className:'public-example'}, node('div', {}, h('Quando fica dispersa'), p('“A proposta está em alguma conversa. Acho que alguém vai retornar.”')), node('div', {}, h('Quando existe acompanhamento'), node('dl', {}, node('dt', {}, 'Situação'), node('dd', {}, 'Proposta enviada · aguardando retorno'), node('dt', {}, 'Responsável'), node('dd', {}, 'Pessoa definida na equipe'), node('dt', {}, 'Próxima ação'), node('dd', {}, 'Retomar a conversa na data combinada')))), p('O objetivo é dar clareza à equipe, conectar as etapas e apoiar decisões com informações úteis. A solução depende da realidade de cada empresa.')),
section('perguntas', heading('ANTES DE COMEÇAR', 'Perguntas que ajudam a decidir.', 'Uma conversa útil começa com expectativas claras.'), ...[
['Preciso trocar as ferramentas que já uso?', 'Primeiro avaliamos o que existe e onde a operação precisa de atenção. Uma troca só faz sentido quando contribui para a prioridade definida; não é uma condição para conversar.'],
['Vocês também executam o que recomendam?', 'Sim. A implementação pode ser contratada com escopo, responsabilidades e entregas definidos. Contratar um diagnóstico não inclui automaticamente toda a execução.'],
['A conversa inicial já inclui o diagnóstico completo?', 'Não. Ela serve para entender o contexto e avaliar o próximo passo. O diagnóstico aprofundado e o Plano de Ação Estratégico são entregas contratadas separadamente.'],
['Minha equipe precisa participar?', 'Conforme o projeto, precisamos de informações, aprovações e da participação de quem atua nas etapas envolvidas. Essa colaboração é combinada antes da execução.'],
['Como o projeto é acompanhado?', 'Os avanços, as dependências e os próximos marcos são comunicados pelos canais e na frequência acordados para o escopo contratado.'],
['Já tenho agência ou equipe comercial. Faz sentido conversar?', 'Pode fazer. Avaliamos como o trabalho atual se conecta ao atendimento, às vendas e à continuidade. A necessidade de intervenção depende do contexto, sem presumir que o trabalho existente deva ser substituído.']
].map(([question, answer]) => node('details', {className:'public-faq'}, node('summary', {}, question), p(answer))))
];
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function html(n){if(typeof n==='string')return esc(n);return `<${n.tag}${Object.entries(n.props).map(([k,v])=>` ${k==='className'?'class':k}="${esc(v)}"`).join('')}>${n.children.map(html).join('')}</${n.tag}>`;}
function jsx(n){if(typeof n==='string')return JSON.stringify(n);const children=n.children.map(jsx);return `(0,o.${children.length>1?'jsxs':'jsx'})(${JSON.stringify(n.tag)},{${Object.entries(n.props).map(([k,v])=>`${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',')}${Object.keys(n.props).length?',':''}children:${children.length===1?children[0]:`[${children.join(',')}]`}})`;}
let page = fs.readFileSync(path.join(root,'_next/static/chunks/page-4065b496.js'),'utf8');
let document = fs.readFileSync(path.join(root,'index.html'),'utf8');
if(document.includes('id="sobre"'))throw Error('Already enriched. Restore the original export before regenerating this patch.');
const insert = (source, marker, content) => {if(!source.includes(marker))throw Error(`Missing marker: ${marker}`);return source.replace(marker,content+marker);};
document=insert(document,'<section class="method-section" id="metodo">',html(intro));
page=insert(page,'(0,o.jsxs)("section",{className:"method-section",id:"metodo"',jsx(intro)+',');
document=insert(document,'<section class="contact-section" id="contato">',additions.map(html).join(''));
page=insert(page,'(0,o.jsxs)("section",{className:"contact-section",id:"contato"',additions.map(jsx).join(',')+',');
const oldCopy='Na avaliação inicial, entendemos o momento da empresa e indicamos o caminho mais coerente. Em até 10 horas úteis, você recebe uma direção clara para avançar.';
const newCopy='Solicite uma conversa inicial para entendermos o contexto e avaliarmos o próximo passo. O diagnóstico aprofundado e o plano de ação são contratados separadamente.';
page=page.replace(oldCopy,newCopy);document=document.replace(oldCopy,newCopy);
page=page.replace('href:"#atuacao",children:"O que estruturamos"','href:"#entregas",children:"O que estruturamos"');
document=document.replace('href="#atuacao">O que estruturamos','href="#entregas">O que estruturamos');
const title='Grupo Portel | Estruturação e Implementação Comercial';
const description='O Grupo Portel conecta atendimento, vendas e continuidade. Conheça nosso diagnóstico, plano de ação e implementação comercial para organizar as oportunidades da sua empresa.';
document=document.replaceAll('Grupo Portel | Engenharia de Vendas',title).replaceAll('Encontramos onde a sua receita escapa e conectamos marca, marketing e vendas para transformar atenção em decisão, venda e recorrência.',description);
const schema={'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':'https://grupoportel.com/#organizacao',name:'Grupo Portel',url:'https://grupoportel.com/',logo:'https://grupoportel.com/assets/logo-grupo-portel.png',description},{'@type':'WebSite','@id':'https://grupoportel.com/#website',url:'https://grupoportel.com/',name:'Grupo Portel',publisher:{'@id':'https://grupoportel.com/#organizacao'},inLanguage:'pt-BR'}]};
document=document.replace('</head>',`<link rel="canonical" href="https://grupoportel.com/"/><meta property="og:url" content="https://grupoportel.com/"/><meta property="og:site_name" content="Grupo Portel"/><meta name="referrer" content="strict-origin-when-cross-origin"/><link rel="stylesheet" href="/assets/public-content-v3.css"/><link rel="stylesheet" href="/assets/header-brand-v1.css"/><link rel="stylesheet" href="/assets/chapter-surfaces-v2.css"/><script defer src="/assets/header-theme-v4.js"></script><script defer src="/assets/content-motion-v1.js"></script><script type="application/ld+json">${JSON.stringify(schema)}</script></head>`);
fs.writeFileSync(path.join(root,'index.html'),document);
const filename='page-public-content-v1.js';
fs.writeFileSync(path.join(root,'_next/static/chunks',filename),page);
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','tools'].includes(entry.name))continue;const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(js|json|rsc|html)$/.test(entry.name)&&entry.name!=='page-4065b496.js'){const data=fs.readFileSync(file,'utf8');if(data.includes('page-4065b496.js'))fs.writeFileSync(file,data.replaceAll('page-4065b496.js',filename));}}}
walk(root);
// Hash existing inline code rather than granting arbitrary inline script execution.
for(const relative of ['index.html','privacidade.html','privacidade/index.html','termos.html','termos/index.html','404.html']){
 const file=path.join(root,relative);let data=fs.readFileSync(file,'utf8');
 const hashes=[...data.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(([,attributes])=>!attributes.includes('src=')&&!attributes.includes('application/ld+json')).map(([, ,code])=>`'sha256-${crypto.createHash('sha256').update(code).digest('base64')}'`);
 const policy=`default-src 'self'; script-src 'self' ${[...new Set(hashes)].join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formspree.io https://crm---grupo-portel-default-rtdb.firebaseio.com https://api.emailjs.com; form-action https://formspree.io; object-src 'none'; base-uri 'none'; frame-src 'none'`;
 data=data.replace('<head>',`<head><meta http-equiv="Content-Security-Policy" content="${policy}"/>`);
 if(relative.startsWith('privacidade')||relative.startsWith('termos')){const slug=relative.startsWith('privacidade')?'privacidade':'termos';if(!data.includes('rel="canonical"'))data=data.replace('</head>',`<link rel="canonical" href="https://grupoportel.com/${slug}/"/></head>`);}
 fs.writeFileSync(file,data);
}
