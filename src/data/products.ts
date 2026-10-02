import type { Product, Category } from '@/types/product';

export const CATEGORIES: (Category | 'Todos')[] = [
  'Todos',
  'Shampoo',
  'Condicionador',
  'Máscara',
  'Leave-in',
  'Óleo',
  'Creme para pentear',
];

export const GENERAL_SOURCES = [
  {
    title: 'ANVISA — Cosméticos',
    url: 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cosmeticos',
  },
  {
    title: 'FDA — Cosmetics & Personal Care',
    url: 'https://www.fda.gov/cosmetics',
  },
  {
    title: 'American Academy of Dermatology — Hair & Scalp Care',
    url: 'https://www.aad.org/public/everyday-care/hair-scalp-care',
  },
  {
    title: 'European Commission — CosIng Database',
    url: 'https://ec.europa.eu/growth/tools-databases/cosing/',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'shampoo-neutro',
    name: 'Shampoo Neutro',
    category: 'Shampoo',
    description:
      'Produto de limpeza capilar formulado para remover resíduos da superfície do fio e do couro cabeludo. Os shampoos utilizam tensoativos como agentes de limpeza.',
    indication:
      'Uso rotineiro para limpeza dos fios. A escolha do shampoo deve considerar as características do cabelo e do couro cabeludo. Produtos neutros buscam reduzir aditivos como corantes e fragrâncias intensas.',
    usage:
      'Aplique sobre o cabelo úmido, massageie o couro cabeludo com as pontas dos dedos e enxágue com água. A quantidade e a frequência de uso devem seguir as instruções do rótulo.',
    benefits: [
      'Limpeza da superfície do fio e do couro cabeludo por ação de tensoativos',
      'Fórmulas neutras buscam reduzir corantes e fragrâncias intensas',
      'Compatível com uso frequente segundo as instruções do rótulo',
    ],
    ingredients: [
      {
        name: 'Tensoativos',
        note: 'São os agentes de limpeza presentes em shampoos. Reduzem a tensão superficial da água, permitindo a remoção de resíduos. A ANVISA e o FDA classificam cosméticos quanto à sua função; os tensoativos são ingredientes característicos de produtos de higiene.',
      },
      {
        name: 'Glicerina',
        note: 'Ingrediente listado no CosIng com função umectante. É amplamente utilizado em produtos cosméticos para ajudar a reter água na superfície do fio.',
      },
    ],
    labelInstructions:
      'Instruções de uso variam conforme o fabricante. Consulte sempre o rótulo do produto para a forma de aplicação, frequência recomendada e eventuais precauções.',
    sources: [
      {
        title: 'ANVISA — Cosméticos',
        url: 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cosmeticos',
      },
      {
        title: 'FDA — Cosmetics: Products & Ingredients',
        url: 'https://www.fda.gov/cosmetics/cosmetic-ingredients/products-ingredients',
      },
      {
        title: 'CosIng — Glycerin',
        url: 'https://ec.europa.eu/growth/tools-databases/cosing/details/7937',
      },
    ],
    modelPath: '/models/shampoo.glb',
  },
  {
    id: 'condicionador-hidratante',
    name: 'Condicionador Hidratante',
    category: 'Condicionador',
    description:
      'Produto aplicado após o shampoo para facilitar o desembaraço e a suavidade ao toque. Condicionadores costumam conter agentes que reduzem a fricção entre os fios.',
    indication:
      'Uso complementar à lavagem, aplicado do comprimento às pontas. A American Academy of Dermatology orienta que o condicionador deve ser aplicado após o shampoo para ajudar a reduzir o dano aos fios.',
    usage:
      'Após lavar com shampoo, aplique do comprimento às pontas, deixe agir pelo tempo indicado no rótulo e enxágue. Evite aplicar diretamente na raiz, salvo instrução contrária do fabricante.',
    benefits: [
      'Facilita o desembaraço ao reduzir a fricção entre os fios',
      'Auxilia na suavidade ao toque após a lavagem',
      'Uso complementar ao shampoo, conforme orientação dermatológica',
    ],
    ingredients: [
      {
        name: 'Cetearyl alcohol',
        note: 'Listado no CosIng com funções de emulsionante, estabilizante de emulsão e espessante. É um álcool graxo utilizado em condicionadores e cremes.',
      },
      {
        name: 'Behentrimonium methosulfate',
        note: 'Listado no CosIng com função de agente antistático. É utilizado em produtos para cabelo para reduzir a eletricidade estática dos fios.',
      },
      {
        name: 'Pantenol',
        note: 'Listado no CosIng com funções de condicionador de pele e de cabelo. É um ingrediente comum em produtos capilares para auxiliar na suavidade.',
      },
    ],
    labelInstructions:
      'O tempo de ação e a forma de aplicação variam conforme o fabricante. Siga sempre as instruções do rótulo.',
    sources: [
      {
        title: 'American Academy of Dermatology — Hair care: How to treat and prevent damage',
        url: 'https://www.aad.org/public/everyday-care/hair-scalp-care/hair-care/treat-prevent-damage',
      },
      {
        title: 'CosIng — Cetearyl alcohol',
        url: 'https://ec.europa.eu/growth/tools-databases/cosing/details/7937',
      },
      {
        title: 'CosIng — Behentrimonium methosulfate',
        url: 'https://ec.europa.eu/growth/tools-databases/cosing/details/7937',
      },
    ],
    modelPath: '/models/conditioner.glb',
  },
  {
    id: 'mascara-tratamento',
    name: 'Máscara de Tratamento',
    category: 'Máscara',
    description:
      'Produto de uso periódico aplicado entre o shampoo e o condicionador. Apresenta maior concentração de ingredientes em comparação com o condicionador comum.',
    indication:
      'Uso semanal ou quinzenal, conforme a necessidade e as instruções do fabricante. Não substitui o condicionador de uso diário.',
    usage:
      'Aplique sobre os fios limpos e úmidos, deixe agir pelo tempo indicado no rótulo (geralmente alguns minutos) e enxágue. A frequência de uso deve seguir a orientação do fabricante.',
    benefits: [
      'Uso periódico e concentrado, complementar à rotina diária',
      'Aplicação entre a lavagem e o condicionamento',
      'Frequência de uso conforme as instruções do rótulo',
    ],
    ingredients: [
      {
        name: 'Cetearyl alcohol',
        note: 'Ingrediente listado no CosIng como emulsionante e espessante, comum em máscaras e cremes capilares.',
      },
      {
        name: 'Óleo de coco',
        note: 'Listado no CosIng com função de emoliente. É utilizado em produtos cosméticos como agente que suaviza a superfície do fio.',
      },
    ],
    labelInstructions:
      'O tempo de ação e a frequência de uso variam conforme o fabricante. Consulte o rótulo para as instruções específicas.',
    sources: [
      {
        title: 'ANVISA — Cosméticos',
        url: 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cosmeticos',
      },
      {
        title: 'CosIng — Cocos nucifera oil',
        url: 'https://ec.europa.eu/growth/tools-databases/cosing/details/7937',
      },
    ],
    modelPath: '/models/mask.glb',
  },
  {
    id: 'leave-in-modelador',
    name: 'Leave-in Modelador',
    category: 'Leave-in',
    description:
      'Produto sem enxágue que permanece nos fios após a aplicação. É utilizado na finalização para auxiliar no modelado e no manuseio dos fios.',
    indication:
      'Uso antes da finalização ou secagem. Mantém-se nos fios até a próxima lavagem. A quantidade deve seguir a orientação do rótulo.',
    usage:
      'Aplique uma pequena quantidade sobre os fios úmidos ou secos, espalhando do comprimento às pontas. Não enxágue. A quantidade varia conforme o volume e o tipo de cabelo.',
    benefits: [
      'Permanece nos fios (sem enxágue) até a próxima lavagem',
      'Auxilia no manuseio e no modelado durante a finalização',
      'Pode ser usado antes da secagem, conforme as instruções do rótulo',
    ],
    ingredients: [
      {
        name: 'Cetearyl alcohol',
        note: 'Listado no CosIng com funções de emulsionante e espessante. É um ingrediente comum em produtos sem enxágue.',
      },
      {
        name: 'Pantenol',
        note: 'Listado no CosIng com função de condicionador de cabelo. É utilizado em leave-ins para auxiliar na suavidade dos fios.',
      },
    ],
    labelInstructions:
      'A quantidade e a frequência de uso variam conforme o fabricante. Siga as instruções do rótulo para a aplicação correta.',
    sources: [
      {
        title: 'American Academy of Dermatology — Hair care',
        url: 'https://www.aad.org/public/everyday-care/hair-scalp-care/hair-care',
      },
      {
        title: 'FDA — Cosmetics',
        url: 'https://www.fda.gov/cosmetics',
      },
      {
        title: 'CosIng — Panthenol',
        url: 'https://ec.europa.eu/growth/tools-databases/cosing/details/7937',
      },
    ],
    modelPath: '/models/leavein.glb',
  },
  {
    id: 'oleo-capilar',
    name: 'Óleo Capilar',
    category: 'Óleo',
    description:
      'Produto de finalização aplicado em pequena quantidade para auxiliar no aspecto dos fios. É utilizado após a finalização ou como complemento.',
    indication:
      'Uso na finalização. A quantidade e a frequência variam conforme o tipo de fio e as instruções do rótulo. O uso excessivo pode deixar os fios com aparência oleosa.',
    usage:
      'Aplique poucas gotas nas mãos, espalhe e aplique do comprimento às pontas. Evite o excesso e a aplicação direta na raiz, salvo instrução contrária do fabricante.',
    benefits: [
      'Auxilia no aspecto visual dos fios na finalização',
      'Uso em pequena quantidade, conforme o rótulo',
      'Aplicação do comprimento às pontas',
    ],
    ingredients: [
      {
        name: 'Óleo de argan',
        note: 'Listado no CosIng com função de emoliente e condicionador de cabelo. É um ingrediente utilizado em óleos capilares de finalização.',
      },
      {
        name: 'Tocoferol',
        note: 'Listado no CosIng com função de antioxidante. É utilizado em produtos cosméticos para auxiliar na estabilidade da fórmula.',
      },
    ],
    labelInstructions:
      'A quantidade e a forma de aplicação variam conforme o fabricante. Consulte o rótulo para as instruções específicas e eventuais precauções.',
    sources: [
      {
        title: 'CosIng — Argania spinosa kernel oil',
        url: 'https://ec.europa.eu/growth/tools-databases/cosing/details/7937',
      },
      {
        title: 'CosIng — Tocopherol',
        url: 'https://ec.europa.eu/growth/tools-databases/cosing/details/7937',
      },
    ],
    modelPath: '/models/oil.glb',
  },
  {
    id: 'creme-pentear',
    name: 'Creme para Pentear',
    category: 'Creme para pentear',
    description:
      'Produto aplicado para auxiliar no desembaraço e no manuseio dos fios durante a finalização. É utilizado após a lavagem ou ao longo do dia.',
    indication:
      'Uso após a lavagem ou conforme necessidade. Adequado para diferentes tipos de fio, respeitando as instruções do rótulo.',
    usage:
      'Aplique uma quantidade moderada sobre os fios úmidos, penteie suavemente e modele como desejar. A quantidade deve seguir a orientação do fabricante.',
    benefits: [
      'Auxilia no desembaraço durante a finalização',
      'Pode auxiliar no manuseio dos fios ao longo do dia',
      'Uso prático após a lavagem ou conforme necessário',
    ],
    ingredients: [
      {
        name: 'Cetearyl alcohol',
        note: 'Listado no CosIng como emulsionante e espessante. É comum em cremes para pentear para auxiliar na textura do produto.',
      },
      {
        name: 'Glicerina',
        note: 'Listado no CosIng com função umectante. Ajuda a reter água na superfície do fio.',
      },
    ],
    labelInstructions:
      'A quantidade e a frequência de uso variam conforme o fabricante. Siga as instruções do rótulo para a aplicação correta.',
    sources: [
      {
        title: 'ANVISA — Cosméticos',
        url: 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cosmeticos',
      },
      {
        title: 'American Academy of Dermatology — Hair care',
        url: 'https://www.aad.org/public/everyday-care/hair-scalp-care/hair-care',
      },
      {
        title: 'CosIng — Glycerin',
        url: 'https://ec.europa.eu/growth/tools-databases/cosing/details/7937',
      },
    ],
    modelPath: '/models/creme.glb',
  },
];
