export interface Question {
  id: string;
  text: string;
  type: 'objective' | 'subjective';
  options?: string[];
  correctAnswer?: string; // For objective
}

export interface ModuleData {
  id: string;
  title: string;
  icon: string;
  content: string;
  quiz: Question[];
}

export const MODULES: ModuleData[] = [
  {
    id: 'm1',
    title: 'Informática Básica',
    icon: 'Monitor',
    content: `
      Neste módulo, conheceremos o coração do seu computador.
      - **Sistema Operacional:** O software principal (Windows, Linux, MacOS).
      - **Atalhos Essenciais:** Ctrl+C (copiar), Ctrl+V (colar), Alt+Tab (trocar janelas).
      - **Extensões de Arquivos:** .txt (texto), .jpg (imagem), .pdf (documento), .exe (programa).
      - **Instalação e Desinstalação:** Como adicionar e remover programas com segurança.
      - **Organização:** Criação de pastas e subpastas para não perder nada.
      - **Barra de Tarefas:** Como fixar programas e personalizar sua área de trabalho.
    `,
    quiz: [
      { id: 'q1_1', text: 'Qual atalho é usado para colar um arquivo?', type: 'objective', options: ['Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Ctrl+Z'], correctAnswer: 'Ctrl+V' },
      { id: 'q1_2', text: 'O que é uma extensão de arquivo e por que é importante?', type: 'subjective' },
      { id: 'q1_3', text: 'Explique o processo de criar uma subpasta.', type: 'subjective' }
    ]
  },
  {
    id: 'm2',
    title: 'Digitação',
    icon: 'Keyboard',
    content: `
      Dominar o teclado é essencial para produtividade.
      - **Posicionamento:** Dedos indicadores nas teclas F e J.
      - **Teclas Especiais:** Shift, Caps Lock, Tab, Backspace vs Delete.
      - **Postura:** Costas eretas e punhos relaxados.
      - **Velocidade vs Precisão:** O segredo é primeiro acertar a tecla, depois acelerar.
    `,
    quiz: [
      { id: 'q2_1', text: 'Em quais teclas os dedos indicadores devem descansar?', type: 'objective', options: ['A e S', 'F e J', 'D e K', 'G e H'], correctAnswer: 'F e J' },
      { id: 'q2_2', text: 'Qual a diferença entre a tecla Backspace e a tecla Delete?', type: 'subjective' }
    ]
  },
  {
    id: 'm3',
    title: 'Pacote Office',
    icon: 'FileText',
    content: `
      As ferramentas clássicas de escritório:
      - **Word:** Edição de textos profissionais.
      - **Excel:** Planilhas e cálculos (o terror e a glória das empresas).
      - **PowerPoint:** Apresentações que encantam.
    `,
    quiz: [
      { id: 'q3_1', text: 'Qual programa é usado para criar planilhas?', type: 'objective', options: ['Word', 'Excel', 'PowerPoint', 'Outlook'], correctAnswer: 'Excel' },
      { id: 'q3_2', text: 'Para que servem as transições no PowerPoint?', type: 'subjective' }
    ]
  },
  {
    id: 'm4',
    title: 'Google Workspace',
    icon: 'Cloud',
    content: `
      O trabalho nas nuvens:
      - **Google Docs, Sheets e Slides:** Colaboração em tempo real.
      - **Google Drive:** Armazenamento seguro de arquivos.
      - **Compartilhamento:** Leitores, Comentaristas e Editores.
    `,
    quiz: [
      { id: 'q4_1', text: 'No Google Docs, como você permite que alguém apenas veja o arquivo sem editar?', type: 'objective', options: ['Permissão de Editor', 'Permissão de Leitor', 'Permissão de Administrador', 'Transferir Propriedade'], correctAnswer: 'Permissão de Leitor' },
      { id: 'q4_2', text: 'Qual a principal vantagem de usar o Google Drive em relação a salvar arquivos apenas no computador?', type: 'subjective' }
    ]
  },
  {
    id: 'm5',
    title: 'E-mail Profissional',
    icon: 'Mail',
    content: `
      Sua carta digital para o mundo:
      - **Estrutura:** Destinatário (Para), Assunto (Curto e direto), Corpo do E-mail.
      - **Ferramentas:** CC (Cópia), CCO (Cópia Oculta).
      - **Organização:** Pastas, etiquetas e assinaturas automáticas.
      - **Etiqueta Digital:** Evite CAIXA ALTA e use saudações formais.
    `,
    quiz: [
      { id: 'q5_1', text: 'O que significa a sigla CCO?', type: 'objective', options: ['Com Cópia Original', 'Cópia Comum Oculta', 'Cópia de Conteúdo Original', 'Com Cópia Online'], correctAnswer: 'Cópia Comum Oculta' },
      { id: 'q5_2', text: 'Escreva um exemplo de assunto de e-mail para enviar um currículo para uma vaga de Jovem Aprendiz.', type: 'subjective' }
    ]
  },
  {
    id: 'm6',
    title: 'IA no Trabalho',
    icon: 'Sparkles',
    content: `
      A inteligência artificial como sua assistente:
      - **IA Generativa:** Textos, imagens e códigos.
      - **Prompting:** Como pedir da forma certa para ter o melhor resultado.
      - **Ética:** Verificação de fatos (IA também erra!).
      - **Exemplos:** ChatGPT para resumos, Gemini para análise de dados, Midjourney para artes.
    `,
    quiz: [
      { id: 'q6_1', text: 'O que é um "Prompt" no contexto de IA?', type: 'objective', options: ['Um erro do sistema', 'O comando ou instrução dada à IA', 'O nome de um modelo de IA', 'Um tipo de vírus'], correctAnswer: 'O comando ou instrução dada à IA' },
      { id: 'q6_2', text: 'Por que devemos sempre revisar o que a IA produz antes de usar em um trabalho profissional?', type: 'subjective' }
    ]
  },
  {
    id: 'm7',
    title: 'Mundo do Trabalho',
    icon: 'Briefcase',
    content: `
      Se preparando para a vida profissional:
      - **Currículo:** Simples, direto e verdadeiro.
      - **Jovem Aprendiz:** Suas primeiras oportunidades e direitos.
      - **Leis Trabalhistas:** Entenda o básico (FGTS, férias, jornada).
      - **Postura Profissional:** 
        - Linguagem corporal (olho no olho, aperto de mão firme).
        - Linguagem verbal (evite gírias, seja claro).
      - **Entrevista:** Chegue 10 minutos antes. Pesquise sobre a empresa. Seja honesto.
      - **Dicas de Ouro:** Seja pontual, demonstre vontade de aprender e tenha sempre uma postura proativa.
    `,
    quiz: [
      { id: 'q7_1', text: 'Quanto tempo antes você deve chegar para uma entrevista de emprego?', type: 'objective', options: ['Exatamente no horário', '10 a 15 minutos antes', '1 hora antes', 'O horário não importa'], correctAnswer: '10 a 15 minutos antes' },
      { id: 'q7_2', text: 'Cite dois direitos fundamentais de um Jovem Aprendiz.', type: 'subjective' },
      { id: 'q7_3', text: 'Como a linguagem corporal pode influenciar a percepção do recrutador sobre você?', type: 'subjective' }
    ]
  }
];
