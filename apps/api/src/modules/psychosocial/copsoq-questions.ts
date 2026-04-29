import type { PsychosocialQuestion } from "./psychosocial.types";

export const copsoqQuestions: PsychosocialQuestion[] = [
  {
    id: "copsoq-01-voc-concorda-em-participar-deste-questionrio",
    order: 1,
    factor: "Identificacao",
    prompt: "Você concorda em participar deste questionário?",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Sim, concordo",
      },
      {
        value: 2,
        label: "Não concordo",
      },
    ],
  },
  {
    id: "copsoq-02-modelo-de-trabalho",
    order: 2,
    factor: "Identificacao",
    prompt: "Modelo de trabalho?",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Presencial",
      },
      {
        value: 2,
        label: "Híbrido",
      },
      {
        value: 3,
        label: "Remoto",
      },
    ],
  },
  {
    id: "copsoq-03-tenho-volume-de-trabalho-acima-do-que-consigo-real",
    order: 3,
    factor: "A1. Demandas psicossociais / Carga de trabalho",
    prompt: "Tenho volume de trabalho acima do que consigo realizar no tempo disponível.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-04-preciso-trabalhar-em-ritmo-acelerado-para-dar-cont",
    order: 4,
    factor: "A1. Demandas psicossociais / Carga de trabalho",
    prompt: "Preciso trabalhar em ritmo acelerado para dar conta das demandas.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-05-tenho-prazos-curtos-ou-irreais-para-cumprir-minhas",
    order: 5,
    factor: "A1. Demandas psicossociais / Carga de trabalho",
    prompt: "Tenho prazos curtos ou irreais para cumprir minhas tarefas.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-06-sou-frequentemente-interrompido-a-enquanto-estou-t",
    order: 6,
    factor: "A1. Demandas psicossociais / Carga de trabalho",
    prompt: "Sou frequentemente interrompido(a) enquanto estou trabalhando.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-07-trabalho-sob-presso-constante-por-resultados-entre",
    order: 7,
    factor: "A1. Demandas psicossociais / Carga de trabalho",
    prompt: "Trabalho sob pressão constante por resultados / entregas.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-08-meu-trabalho-exige-lidar-com-situaes-emocionalment",
    order: 8,
    factor: "A2. Demandas emocionais",
    prompt: "Meu trabalho exige lidar com situações emocionalmente difíceis.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-09-preciso-esconder-sentimentos-emisses-para-manter-p",
    order: 9,
    factor: "A2. Demandas emocionais",
    prompt: "Preciso esconder sentimentos/emissões para manter postura profissional.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-10-lido-com-conflitos-reclamaes-ou-pessoas-difceis-co",
    order: 10,
    factor: "A2. Demandas emocionais",
    prompt: "Lido com conflitos, reclamações ou pessoas difíceis com frequência.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-11-me-sinto-emocionalmente-esgotado-a-aps-o-trabalho",
    order: 11,
    factor: "A2. Demandas emocionais",
    prompt: "Me sinto emocionalmente esgotado(a) após o trabalho.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-12-sinto-que-meu-trabalho-drena-minha-energia-emocion",
    order: 12,
    factor: "A2. Demandas emocionais",
    prompt: "Sinto que meu trabalho drena minha energia emocional.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-13-tenho-autonomia-para-decidir-como-realizar-meu-tra",
    order: 13,
    factor: "A3. Controle e autonomia",
    prompt: "Tenho autonomia para decidir como realizar meu trabalho.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-14-posso-organizar-meu-tempo-e-prioridades-com-liberd",
    order: 14,
    factor: "A3. Controle e autonomia",
    prompt: "Posso organizar meu tempo e prioridades com liberdade suficiente.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-15-tenho-influncia-sobre-decises-que-afetam-meu-traba",
    order: 15,
    factor: "A3. Controle e autonomia",
    prompt: "Tenho influência sobre decisões que afetam meu trabalho.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-16-consigo-ajustar-meu-ritmo-quando-necessrio",
    order: 16,
    factor: "A3. Controle e autonomia",
    prompt: "Consigo ajustar meu ritmo quando necessário.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-17-tenho-espao-para-sugerir-melhorias-e-participar-de",
    order: 17,
    factor: "A3. Controle e autonomia",
    prompt: "Tenho espaço para sugerir melhorias e participar de mudanças.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-18-sei-exatamente-o-que-esperam-de-mim-no-trabalho",
    order: 18,
    factor: "A4. Clareza de papéis e responsabilidades",
    prompt: "Sei exatamente o que esperam de mim no trabalho.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-19-recebo-orientaes-claras-sobre-minhas-responsabilid",
    order: 19,
    factor: "A4. Clareza de papéis e responsabilidades",
    prompt: "Recebo orientações claras sobre minhas responsabilidades.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-20-recebo-demandas-conflitantes-de-diferentes-pessoas",
    order: 20,
    factor: "A4. Clareza de papéis e responsabilidades",
    prompt: "Recebo demandas conflitantes de diferentes pessoas/áreas.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-21-sinto-que-existe-confuso-sobre-prioridades",
    order: 21,
    factor: "A4. Clareza de papéis e responsabilidades",
    prompt: "Sinto que existe confusão sobre prioridades.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-22-j-me-cobraram-por-algo-que-no-estava-claramente-de",
    order: 22,
    factor: "A4. Clareza de papéis e responsabilidades",
    prompt: "Já me cobraram por algo que não estava claramente definido.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-23-minha-liderana-oferece-suporte-quando-preciso",
    order: 23,
    factor: "A5. Suporte social e liderança",
    prompt: "Minha liderança oferece suporte quando preciso.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-24-recebo-feedbacks-claros-e-teis-sobre-meu-desempenh",
    order: 24,
    factor: "A5. Suporte social e liderança",
    prompt: "Recebo feedbacks claros e úteis sobre meu desempenho.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-25-existe-respeito-e-colaborao-entre-colegas",
    order: 25,
    factor: "A5. Suporte social e liderança",
    prompt: "Existe respeito e colaboração entre colegas.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-26-sinto-que-posso-pedir-ajuda-sem-receio-de-julgamen",
    order: 26,
    factor: "A5. Suporte social e liderança",
    prompt: "Sinto que posso pedir ajuda sem receio de julgamento.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-27-minha-liderana-reconhece-meu-esforo-e-contribuio",
    order: 27,
    factor: "A5. Suporte social e liderança",
    prompt: "Minha liderança reconhece meu esforço e contribuição.",
    reverseScored: true,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-28-as-regras-e-decises-so-aplicadas-de-forma-justa",
    order: 28,
    factor: "A6. Justiça e transparência organizacional",
    prompt: "As regras e decisões são aplicadas de forma justa.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-29-critrios-de-promoo-reconhecimento-so-claros",
    order: 29,
    factor: "A6. Justiça e transparência organizacional",
    prompt: "Critérios de promoção/reconhecimento são claros.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-30-sinto-que-h-favoritismo-ou-tratamento-desigual",
    order: 30,
    factor: "A6. Justiça e transparência organizacional",
    prompt: "Sinto que há favoritismo ou tratamento desigual.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-31-a-comunicao-da-empresa-transparente",
    order: 31,
    factor: "A6. Justiça e transparência organizacional",
    prompt: "A comunicação da empresa é transparente.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-32-me-sinto-valorizado-a-pela-organizao",
    order: 32,
    factor: "A6. Justiça e transparência organizacional",
    prompt: "Me sinto valorizado(a) pela organização.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-33-me-preocupo-em-perder-meu-trabalho",
    order: 33,
    factor: "B1. Segurança / estabilidade no trabalho",
    prompt: "Me preocupo em perder meu trabalho.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-34-me-sinto-inseguro-a-sobre-meu-futuro-profissional-",
    order: 34,
    factor: "B1. Segurança / estabilidade no trabalho",
    prompt: "Me sinto inseguro(a) sobre meu futuro profissional aqui.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-35-mudanas-na-empresa-afetam-minha-estabilidade",
    order: 35,
    factor: "B1. Segurança / estabilidade no trabalho",
    prompt: "Mudanças na empresa afetam minha estabilidade.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-36-tenho-clareza-sobre-expectativas-e-continuidade-do",
    order: 36,
    factor: "B1. Segurança / estabilidade no trabalho",
    prompt: "Tenho clareza sobre expectativas e continuidade do meu papel.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Discordo totalmente",
      },
      {
        value: 2,
        label: "Discordo",
      },
      {
        value: 3,
        label: "Neutro",
      },
      {
        value: 4,
        label: "Concordo",
      },
      {
        value: 5,
        label: "Concordo totalmente",
      },
    ],
  },
  {
    id: "copsoq-37-trabalho-fora-do-horrio-com-frequncia",
    order: 37,
    factor: "B2. Conflito trabalho x vida pessoal",
    prompt: "Trabalho fora do horário com frequência.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-38-me-sinto-pressionado-a-a-estar-disponvel-mesmo-for",
    order: 38,
    factor: "B2. Conflito trabalho x vida pessoal",
    prompt: "Me sinto pressionado(a) a estar disponível mesmo fora do expediente.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-39-meu-trabalho-afeta-negativamente-minha-vida-pessoa",
    order: 39,
    factor: "B2. Conflito trabalho x vida pessoal",
    prompt: "Meu trabalho afeta negativamente minha vida pessoal/familiar.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-40-tenho-dificuldade-para-descansar-desconectar-do-tr",
    order: 40,
    factor: "B2. Conflito trabalho x vida pessoal",
    prompt: "Tenho dificuldade para descansar/desconectar do trabalho.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-41-me-sinto-culpado-a-quando-no-estou-trabalhando",
    order: 41,
    factor: "B2. Conflito trabalho x vida pessoal",
    prompt: "Me sinto culpado(a) quando não estou trabalhando.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-42-me-sinto-estressado-a-devido-ao-trabalho",
    order: 42,
    factor: "C1. Saúde mental e bem-estar (sinais)",
    prompt: "Me sinto estressado(a) devido ao trabalho.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-43-tenho-dificuldades-de-concentrao-por-conta-do-trab",
    order: 43,
    factor: "C1. Saúde mental e bem-estar (sinais)",
    prompt: "Tenho dificuldades de concentração por conta do trabalho.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-44-tenho-problemas-de-sono-ligados-ao-trabalho",
    order: 44,
    factor: "C1. Saúde mental e bem-estar (sinais)",
    prompt: "Tenho problemas de sono ligados ao trabalho.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-45-me-sinto-desmotivado-a-com-o-trabalho",
    order: 45,
    factor: "C1. Saúde mental e bem-estar (sinais)",
    prompt: "Me sinto desmotivado(a) com o trabalho.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
  {
    id: "copsoq-46-j-pensei-em-pedir-demisso-por-exausto-mental-emoci",
    order: 46,
    factor: "C1. Saúde mental e bem-estar (sinais)",
    prompt: "Já pensei em pedir demissão por exaustão mental/emocional.",
    reverseScored: false,
    options: [
      {
        value: 1,
        label: "Nunca",
      },
      {
        value: 2,
        label: "Raramente",
      },
      {
        value: 3,
        label: "Às vezes",
      },
      {
        value: 4,
        label: "Frequentemente",
      },
      {
        value: 5,
        label: "Sempre",
      },
    ],
  },
];
