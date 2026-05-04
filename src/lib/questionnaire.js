export const likertScale = [
  { value: 1, label: 'Pas du tout d accord' },
  { value: 2, label: 'Pas d accord' },
  { value: 3, label: 'Neutre' },
  { value: 4, label: 'D accord' },
  { value: 5, label: 'Tout a fait d accord' },
]

export const seniorityOptions = [
  { value: '1-5', label: 'De 1 an a 5 ans' },
  { value: '5-10', label: 'De 5 a 10 ans' },
  { value: '10+', label: 'Plus de 10 ans' },
]

export const staticQuestionnaire = {
  code: 'climat-social-2026',
  title: 'Questionnaire de Diagnostic du Climat Social',
  intro:
    "Evaluation anonyme et confidentielle des relations de travail, du leadership, de la communication, des conditions de travail, de la culture HSE, de la motivation et de l equite interne.",
  axes: [
    {
      id: 'axe-relations',
      title: 'Axe 1 : Relations de travail',
      questions: [
        {
          id: 'q1',
          text: 'Les relations entre les travailleurs du chantier sont fondees sur le respect mutuel.',
        },
        {
          id: 'q2',
          text: 'La cooperation entre les differentes equipes de travail est efficace.',
        },
        {
          id: 'q3',
          text: 'Les conflits professionnels entre les travailleurs et la hierarchie sont traites de maniere objective et equitable.',
        },
        {
          id: 'q4',
          text: "Je ressens un esprit d equipe et un sentiment d appartenance a l Entreprise.",
        },
        {
          id: 'q5',
          text: 'Le travail individuel est controle par les collegues et la hierarchie.',
        },
      ],
    },
    {
      id: 'axe-leadership',
      title: 'Axe 2 : Leadership et supervision',
      questions: [
        {
          id: 'q6',
          text: 'Le Responsable du chantier explique clairement les instructions et les taches reparties.',
        },
        {
          id: 'q7',
          text: 'Le style de gestion du chantier aide a renforcer la discipline et la securite.',
        },
        {
          id: 'q8',
          text: 'Les opinions et suggestions du personnel du chantier sont prises en consideration par la hierarchie.',
        },
        {
          id: 'q9',
          text: "Le systeme d evaluation du personnel est clair et transparent.",
        },
        {
          id: 'q10',
          text: 'La repartition des charges et des responsabilites entre les travailleurs du chantier est equitable.',
        },
      ],
    },
    {
      id: 'axe-communication',
      title: 'Axe 3 : Communication interne',
      questions: [
        {
          id: 'q11',
          text: 'Les informations professionnelles sont transmises en temps opportun.',
        },
        {
          id: 'q12',
          text: 'Les moyens de communication internes utilises sont efficaces.',
        },
        {
          id: 'q13',
          text: 'Les reunions techniques et de coordination sont organisees regulierement.',
        },
        {
          id: 'q14',
          text: 'Les procedures, instructions et standards lies aux activites du chantier sont claires et comprehensibles.',
        },
        {
          id: 'q15',
          text: 'La communication entre les equipes lors de la releve est efficace et satisfaisante.',
        },
      ],
    },
    {
      id: 'axe-conditions',
      title: 'Axe 4 : Conditions et environnement de travail',
      questions: [
        {
          id: 'q16',
          text: "Les conditions de travail sont adaptees a l activite de forage petrolier.",
        },
        {
          id: 'q17',
          text: 'Les moyens materiels necessaires au travail sont disponibles.',
        },
        {
          id: 'q18',
          text: 'Le camp de forage repond aux normes de proprete et de confort.',
        },
        {
          id: 'q19',
          text: 'Les equipements de protection individuelle sont disponibles et adaptes.',
        },
        {
          id: 'q20',
          text: 'L environnement de travail favorise la securite et la concentration.',
        },
      ],
    },
    {
      id: 'axe-hse',
      title: 'Axe 5 : Sante, Securite et Environnement (HSE)',
      questions: [
        {
          id: 'q21',
          text: "La culture HSE est bien ancree au sein de l Entreprise.",
        },
        {
          id: 'q22',
          text: 'Les procedures de travail et de securite sont connues par les travailleurs.',
        },
        {
          id: 'q23',
          text: 'Les risques et incidents sont signales sans crainte.',
        },
        {
          id: 'q24',
          text: 'Les formations HSE sont suffisantes et adaptees.',
        },
        {
          id: 'q25',
          text: 'Les responsables veillent strictement au respect des regles HSE.',
        },
      ],
    },
    {
      id: 'axe-motivation',
      title: 'Axe 6 : Motivation et satisfaction professionnelle',
      questions: [
        {
          id: 'q26',
          text: 'Les efforts fournis sont reconnus par la hierarchie.',
        },
        {
          id: 'q27',
          text: 'Le systeme de primes et de recompenses est equitable.',
        },
        {
          id: 'q28',
          text: 'Je suis globalement satisfait(e) de mon travail.',
        },
        {
          id: 'q29',
          text: 'Les opportunites d evolution professionnelle sont reelles.',
        },
        {
          id: 'q30',
          text: 'Les formations proposees sont adaptees aux activites de forage petrolier.',
        },
      ],
    },
    {
      id: 'axe-equite',
      title: 'Axe 7 : Equite interne',
      questions: [
        {
          id: 'q31',
          text: 'Les decisions administratives sont prises conformement a la reglementation en vigueur.',
        },
        {
          id: 'q32',
          text: 'Les regles et procedures de gestion RH sont appliquees equitablement a tous.',
        },
        {
          id: 'q33',
          text: 'Les reclamations et doleances des travailleurs sont traitees avec consideration.',
        },
        {
          id: 'q34',
          text: 'Le benefice des avantages sociaux est realise de maniere equitable.',
        },
        {
          id: 'q35',
          text: 'L evolution de carriere dans le metier de forage est claire et connue.',
        },
      ],
    },
  ],
}

export const openQuestions = [
  {
    id: 'strengths',
    label: '1. Selon vous, quels sont les principaux points forts du bien etre au sein de l Entreprise ?',
  },
  {
    id: 'priorities',
    label: "2. Quels aspects de l environnement de travail devraient etre ameliores en priorite ?",
  },
  {
    id: 'suggestions',
    label: '3. Quelles sont vos suggestions pour ameliorer les conditions de travail ?',
  },
]

export function getAllLikertQuestions() {
  return staticQuestionnaire.axes.flatMap((axe) => axe.questions)
}
