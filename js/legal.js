// Textos de apoio, termos e privacidade. Escritos a partir do que o app realmente faz:
// ao mudar o comportamento (login, analytics, novos serviços), revise estes textos e a data.
const SITE = {
  name: "Nihongo Clue Pocket",
  author: "Richard Esley Silva Oliveira",
  contactEmail: "richardesleyso@gmail.com",
  repositoryUrl: "https://github.com/RDEsley/NihongoCluePocket",
  legalUpdated: "10 de outubro de 2026",
};

const mail = `<a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a>`;

const LEGAL = {
  termos: {
    title: "Termos de uso",
    html: `
      <p>Ao usar o ${SITE.name} (o “app”), no site ou instalado no aparelho, você concorda com estes termos. Se não concordar, basta não usar.</p>

      <h2>1. O que é o app</h2>
      <p>É uma cola de bolso gratuita de japonês para viagem, em português: frases por situação, busca, placas, um leitor de preços e cartões para treinar. Foi criado e é mantido por ${SITE.author}, pessoa física, sem fins lucrativos.</p>

      <h2>2. Uso</h2>
      <p>O uso é gratuito e não exige cadastro. Você se compromete a usar o app de boa-fé, para fins lícitos, e a não tentar prejudicar o seu funcionamento.</p>

      <h2>3. Limites do conteúdo</h2>
      <ul>
        <li>O app é um material de estudo e consulta. <b>Não é um tradutor</b> e não substitui um intérprete, um curso de idioma nem orientação profissional.</li>
        <li>As frases, as leituras em rōmaji e as traduções foram revisadas com cuidado, mas podem conter erros ou soar diferentes do que se usa em cada região ou situação.</li>
        <li>O áudio é produzido pela voz sintética do seu aparelho. A pronúncia e a qualidade dependem dela e podem não ser naturais.</li>
        <li>Informações práticas (telefones de emergência, regras de tax-free, costumes, taxas) refletem o que valia quando o conteúdo foi escrito e <b>podem mudar</b>. Confirme em fontes oficiais antes de depender delas.</li>
      </ul>
      <p><b>Em uma emergência de verdade, ligue para os serviços locais</b> (110 para polícia, 119 para ambulância e bombeiros no Japão) e não dependa apenas do app.</p>

      <h2>4. Doações</h2>
      <p>O app oferece, de forma opcional, a possibilidade de doar qualquer valor por Pix ao desenvolvedor. Sobre essas doações:</p>
      <ul>
        <li>vão <b>diretamente para ${SITE.author}</b>, pessoa física, para ajudar a cobrir custos e tempo de manutenção;</li>
        <li>são voluntárias, não dão direito a nenhuma contrapartida e não liberam funções: o app é o mesmo para quem doa e para quem não doa.</li>
      </ul>
      <p>Se você doou por engano, escreva para ${mail} que o valor é devolvido.</p>

      <h2>5. Responsabilidade</h2>
      <p>O app é oferecido “como está”, sem garantia de disponibilidade nem de que o conteúdo esteja sempre correto ou atualizado. Na medida permitida pela lei, o desenvolvedor não responde por prejuízos decorrentes do uso do app, como mal-entendidos, compras, deslocamentos ou decisões tomadas com base no conteúdo, ou indisponibilidade do serviço.</p>

      <h2>6. Privacidade</h2>
      <p>O tratamento de dados está descrito na <a href="#/privacidade">Política de privacidade</a>.</p>

      <h2>7. Código aberto</h2>
      <p>O código-fonte é público, sob licença MIT, em <a href="${SITE.repositoryUrl}" target="_blank" rel="noreferrer">${SITE.repositoryUrl.replace("https://", "")}</a>. O QR Code do Pix é gerado com a biblioteca qrcode-generator, de Kazuhiko Arase (licença MIT).</p>

      <h2>8. Mudanças e contato</h2>
      <p>Estes termos podem ser atualizados; a data no topo indica a versão em vigor. Aplica-se a legislação brasileira. Dúvidas, correções ou pedidos: ${mail}.</p>`,
  },
  privacidade: {
    title: "Política de privacidade",
    html: `
      <p>O ${SITE.name} não tem cadastro, não tem anúncios e não usa cookies de rastreamento nem ferramentas de análise de audiência. Esta política explica o pouco que é tratado e vale para o site e para o app instalado.</p>

      <h2>1. Quem é o responsável</h2>
      <p>${SITE.author}, pessoa física, criador e mantenedor do app. Contato: ${mail}.</p>

      <h2>2. O que é tratado</h2>
      <h3>Frases salvas e progresso do treino</h3>
      <p>As frases que você marca com a estrela e os cartões que você marca como sabidos ficam guardados <b>somente no seu aparelho</b> (armazenamento local do navegador). Eles não são enviados a nenhum servidor e não passam de um aparelho para outro.</p>
      <h3>Cópia para uso sem internet</h3>
      <p>Na primeira visita, o navegador guarda no aparelho uma cópia das páginas do app para que ele abra sem conexão.</p>
      <h3>Buscas e valores digitados</h3>
      <p>O que você digita na busca, no leitor de preços e no valor da doação é processado no próprio aparelho e não é enviado nem armazenado.</p>
      <h3>Áudio</h3>
      <p>O botão “Ouvir” usa a voz sintética do seu navegador ou aparelho. Dependendo da voz instalada, o texto da frase (nunca dados seus) pode ser processado pelo fornecedor dessa voz, como o Google ou a Apple, conforme as políticas deles.</p>
      <h3>Registros técnicos</h3>
      <p>A hospedagem (Vercel) registra dados técnicos de acesso, como endereço IP, data, hora e navegador, para manter o serviço funcionando e seguro. Esses registros não são usados para identificar você.</p>

      <h2>3. Doações</h2>
      <p>A doação é feita no app do seu banco, por Pix. O código e o QR Code são montados no seu aparelho. O ${SITE.name} <b>não coleta dados de pagamento</b> e não fica sabendo quem doou, nem se alguém doou. Como em qualquer Pix, o recebedor vê no próprio extrato o nome de quem pagou e as informações que o banco fornece. Veja os <a href="#/termos">Termos de uso</a>.</p>

      <h2>4. Com quem os dados são compartilhados</h2>
      <ul>
        <li><b>Vercel</b>: hospedagem do site (registros técnicos de acesso).</li>
        <li><b>Fornecedor da voz do seu aparelho</b>: só quando você toca em “Ouvir”, e apenas o texto da frase.</li>
      </ul>
      <p>Esses serviços podem processar dados fora do Brasil. Nenhum dado é vendido nem usado para publicidade.</p>

      <h2>5. Crianças e adolescentes</h2>
      <p>O app não é direcionado a crianças e não coleta dados pessoais de ninguém, de qualquer idade.</p>

      <h2>6. Seus direitos</h2>
      <p>A Lei Geral de Proteção de Dados (Lei 13.709/2018) garante, entre outros, o direito de confirmar o tratamento, acessar, corrigir e pedir a eliminação de dados. Como tudo o que é seu fica no seu aparelho, você mesmo apaga ao limpar os dados do site no navegador ou ao desinstalar o app. Para qualquer outro pedido, use o e-mail acima.</p>

      <h2>7. Mudanças</h2>
      <p>Esta política pode ser atualizada; a data no topo indica a versão em vigor.</p>`,
  },
};
