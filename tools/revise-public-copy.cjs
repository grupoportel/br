// Selected public copy only. Private source material stays outside this repository.
// Version both ends of the entry/layout cycle to preserve immutable browser caches.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const chunks = path.join(root, '_next/static/chunks');
const replacements = [
['Grupo Portel: do primeiro contato à próxima compra.', 'Mais clareza para vender. Menos oportunidades esquecidas.'],
['Estruturamos o caminho entre atendimento, vendas e continuidade. Entendemos como as oportunidades avançam na sua empresa, identificamos o que precisa de atenção e implementamos a melhoria adequada ao seu momento.', 'O Grupo Portel conecta posicionamento, atendimento, vendas e continuidade. Investigamos onde a jornada perde força e implementamos processos e ferramentas para a equipe saber como conduzir cada oportunidade.'],
['Para donos e gestores de empresas que já têm uma oferta e clientes, mas precisam organizar melhor a operação comercial.', 'Para donos e gestores de empresas que já vendem, mas precisam organizar os contatos, acompanhar as propostas e dar continuidade à relação com seus clientes.'],
['Conheça as formas de começar →', 'Quero conversar sobre minha operação →'],
['Unimos psicologia de decisão, posicionamento de marca, marketing e estrutura comercial para encontrar onde a receita escapa e transformar esse ponto na próxima prioridade do negócio.', 'Conectamos oferta, atendimento, vendas e pós-venda para investigar os pontos de atrito e definir o que vale melhorar primeiro.'],
['NÃO VENDEMOS TAREFAS. CORRIGIMOS RUPTURAS.', 'DO PROBLEMA AO PRÓXIMO PASSO'],
['O problema pode estar no que acontece depois do contato.', 'Se a oportunidade chega, o que impede a próxima venda?'],
['Nem toda dificuldade comercial pede mais anúncios ou uma ferramenta nova. Algumas aparecem nas passagens da própria operação.', 'Propostas sem retorno, contatos sem responsável e clientes que somem depois da compra podem ser sinais de um processo que precisa de atenção.'],
['O QUE VOCÊ PODE CONTRATAR', 'COMO PODEMOS AJUDAR'],
['Clareza sobre a prioridade. Execução com escopo definido.', 'Entenda a prioridade. Coloque a melhoria em prática.'],
['Cada etapa tem uma finalidade. A conversa inicial ajuda a avaliar o próximo passo; diagnóstico, plano e implementação dependem da contratação adequada.', 'Começamos pela sua situação. Se houver espaço para avançar, definimos a prioridade, o escopo e a forma de colocar a melhoria em operação.'],
['Uma conversa gratuita de cerca de 30 minutos para entender o contexto e avaliar se faz sentido avançar. Não inclui o diagnóstico aprofundado nem um plano completo.', 'Em uma reunião gratuita de 30 minutos, conversamos sobre um problema real da sua operação e avaliamos o que merece ser investigado. Ao final, combinamos o próximo passo, se fizer sentido para sua empresa.'],
['Leitura da jornada comercial, identificação da prioridade e um plano de ação com recomendações. Profundidade, prazos e entregas são definidos na contratação.', 'Você recebe uma leitura da jornada comercial, uma prioridade fundamentada e um plano de ação para orientar a decisão. É uma etapa contratada separadamente da conversa inicial.'],
['Organização dos processos e das ferramentas necessários à prioridade acordada. Responsabilidades, participação da equipe e escopo ficam claros na proposta.', 'Transformamos a prioridade acordada em processos e ferramentas que a equipe possa usar na operação. Entregas, responsabilidades e participação do seu time ficam definidas na proposta.'],
['Visibilidade dos avanços, dependências e próximos marcos, com a frequência e os canais combinados para o projeto.', 'Você acompanha o que foi feito, o que depende da sua equipe e qual é a próxima etapa. Os canais e a frequência de acompanhamento são combinados para o projeto.'],
['Quero entender o próximo passo para minha empresa →', 'Solicitar minha conversa inicial →'],
['O objetivo é dar clareza à equipe, conectar as etapas e apoiar decisões com informações úteis. A solução depende da realidade de cada empresa.', 'Com contexto, responsável e próxima ação definidos, a equipe sabe o que acompanhar. O formato dessa organização depende da realidade de cada empresa.'],
['Sim. A implementação pode ser contratada com escopo, responsabilidades e entregas definidos. Contratar um diagnóstico não inclui automaticamente toda a execução.', 'Sim. Podemos colocar a melhoria em operação com processos, ferramentas e participação do seu time. A implementação tem proposta e escopo próprios.'],
['Não. Ela serve para entender o contexto e avaliar o próximo passo. O diagnóstico aprofundado e o Plano de Ação Estratégico são entregas contratadas separadamente.', 'A conversa inicial é uma primeira leitura do seu contexto e do que merece atenção. O diagnóstico aprofundado e o Plano de Ação Estratégico são entregas contratadas separadamente.'],
['Descubra onde a sua venda está travando.', 'Qual é o próximo passo para vender melhor?'],
['Solicite uma conversa inicial para entendermos o contexto e avaliarmos o próximo passo. O diagnóstico aprofundado e o plano de ação são contratados separadamente.', 'Conte-nos o que acontece hoje. Entraremos em contato para combinar uma conversa inicial gratuita de 30 minutos e avaliar o próximo passo com você.'],
['Você já possui uma oferta e clientes.', 'Sua empresa já vende e tem clientes.'],
['Existe um problema comercial relevante.', 'Você quer entender ou melhorar uma etapa comercial.'],
['O decisor pode participar da mudança.', 'Você pode envolver quem decide e quem conhece a operação.'],
['Solicitar avaliação', 'Solicitar conversa'],
['Solicitação de avaliação comercial inicial', 'Solicitação de conversa comercial inicial'],
['Conte-nos sobre a sua operação', 'Vamos começar pelo seu contexto'],
['Quero meu diagnóstico inicial', 'Solicitar conversa inicial'],
['Prefere conversar? Chame pelo WhatsApp.', 'Prefere explicar pelo WhatsApp? Fale com a equipe.']
];
const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let html = fs.readFileSync(path.join(root,'index.html'),'utf8');
let page = fs.readFileSync(path.join(chunks,'page-public-content-v1.js'),'utf8');
let source = fs.readFileSync(path.join(root,'tools/enrich-home.cjs'),'utf8');
for (const [before,after] of replacements) {
  if (!html.includes(escape(before)) || !page.includes(JSON.stringify(before))) throw Error(`Missing public text: ${before}`);
  html = html.replaceAll(escape(before),escape(after));
  page = page.replaceAll(JSON.stringify(before),JSON.stringify(after));
  source = source.replaceAll(before,after);
}
html = html.replace('href="#entregas">Quero conversar sobre minha operação', 'href="#contato">Quero conversar sobre minha operação');
page = page.replace('href":"#entregas",children:"Quero conversar sobre minha operação', 'href":"#contato",children:"Quero conversar sobre minha operação');
source = source.replace("href:'#entregas'}, 'Quero conversar sobre minha operação", "href:'#contato'}, 'Quero conversar sobre minha operação");
fs.writeFileSync(path.join(chunks,'page-public-content-v2.js'),page);
let entry = fs.readFileSync(path.join(chunks,'index-public-content-v2.js'),'utf8');
entry = entry.replaceAll('page-public-content-v1.js','page-public-content-v2.js').replaceAll('layout-segment-context-public-v2.js','layout-segment-context-public-v3.js');
fs.writeFileSync(path.join(chunks,'index-public-content-v3.js'),entry);
const context = fs.readFileSync(path.join(chunks,'layout-segment-context-public-v2.js'),'utf8').replaceAll('index-public-content-v2.js','index-public-content-v3.js');
fs.writeFileSync(path.join(chunks,'layout-segment-context-public-v3.js'),context);
const mobile = fs.readFileSync(path.join(root,'assets/mobile-lite-v14.js'),'utf8').replaceAll('Quero meu diagnóstico inicial','Solicitar conversa inicial');
fs.writeFileSync(path.join(root,'assets/mobile-lite-v15.js'),mobile);
html = html.replaceAll('mobile-lite-v14.js','mobile-lite-v15.js');
fs.writeFileSync(path.join(root,'index.html'),html);
source = source.replaceAll('page-public-content-v1.js','page-public-content-v2.js');
fs.writeFileSync(path.join(root,'tools/enrich-home.cjs'),source);
// Only routing documents are mutable. Never rewrite legacy cached JS modules.
function walk(dir) {
  for(const item of fs.readdirSync(dir,{withFileTypes:true})) {
    if(['.git','tools'].includes(item.name)) continue;
    const file = path.join(dir,item.name);
    if(item.isDirectory()) walk(file);
    else if(/\.(html|rsc|json)$/.test(item.name)) {
      const before = fs.readFileSync(file,'utf8');
      const after = before.replaceAll('index-public-content-v2.js','index-public-content-v3.js').replaceAll('page-public-content-v1.js','page-public-content-v2.js').replaceAll('layout-segment-context-public-v2.js','layout-segment-context-public-v3.js');
      if(before !== after) fs.writeFileSync(file,after);
    }
  }
}
walk(root);
// Refresh the existing per-page CSP hash list without broadening permissions.
for(const relative of ['index.html','privacidade.html','privacidade/index.html','termos.html','termos/index.html','404.html']) {
  const file = path.join(root,relative);
  let document = fs.readFileSync(file,'utf8').replaceAll('\r\n','\n');
  const hashes = [...document.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(([,a])=>!a.includes('src=')&&!a.includes('application/ld+json')).map(([, ,code])=>`'sha256-${crypto.createHash('sha256').update(code).digest('base64')}'`);
  document = document.replace(/script-src 'self'(?: 'sha256-[^']+')+/,`script-src 'self' ${[...new Set(hashes)].join(' ')}`);
  fs.writeFileSync(file,document);
}
console.log(`Updated ${replacements.length} public messages; desktop/mobile CTAs aligned.`);
