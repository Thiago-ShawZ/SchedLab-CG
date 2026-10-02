import type { Category } from '@/types/product';
import type { Source } from '@/types/product';

export interface HairTypeInfo {
  id: string;
  name: string;
  icon: 'waves' | 'wind' | 'sparkles' | 'droplet' | 'sun' | 'flame';
  characteristics: string[];
  care: string[];
  relatedCategories: Category[];
  tips: string[];
  sources: Source[];
}

export const HAIR_TYPES: HairTypeInfo[] = [
  {
    id: 'liso',
    name: 'Liso',
    icon: 'wind',
    characteristics: [
      'Fios alinhados e com menor curvatura',
      'A oleosidade natural pode escorrer da raiz às pontas com facilidade',
      'Em geral, aparenta mais volume na raiz e menos nas pontas',
    ],
    care: [
      'A lavagem pode ser feita com frequência moderada, dependendo das características do couro cabeludo',
      'O condicionador pode ser aplicado do comprimento às pontas, evitando a raiz',
      'O uso de leave-in pode auxiliar no modelado, dependendo do tipo de fio',
    ],
    relatedCategories: ['Shampoo', 'Condicionador', 'Leave-in'],
    tips: [
      'A frequência de lavagem depende das características do couro cabeludo',
      'Em geral, fios lisos podem parecer oleosos mais rapidamente, dependendo das condições',
    ],
    sources: [
      {
        title: 'American Academy of Dermatology — Hair care',
        url: 'https://www.aad.org/public/everyday-care/hair-scalp-care/hair-care',
      },
      {
        title: 'ANVISA — Cosméticos',
        url: 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cosmeticos',
      },
    ],
  },
  {
    id: 'ondulado',
    name: 'Ondulado',
    icon: 'waves',
    characteristics: [
      'Fios com curvatura suave, em formato de onda',
      'Podem apresentar variação entre fios mais lisos e mais ondulados',
      'Em geral, combinam características de fios lisos e cacheados',
    ],
    care: [
      'A lavagem pode ser feita conforme a necessidade e as características do couro cabeludo',
      'O condicionador pode auxiliar no desembaraço, aplicado do comprimento às pontas',
      'O leave-in pode auxiliar na definição das ondas, dependendo do tipo de fio',
    ],
    relatedCategories: ['Shampoo', 'Condicionador', 'Leave-in', 'Creme para pentear'],
    tips: [
      'A definição das ondas pode variar dependendo da umidade e do tipo de fio',
      'O uso de creme para pentear pode auxiliar no manuseio, conforme as instruções do rótulo',
    ],
    sources: [
      {
        title: 'American Academy of Dermatology — Hair care',
        url: 'https://www.aad.org/public/everyday-care/hair-scalp-care/hair-care',
      },
    ],
  },
  {
    id: 'cacheado',
    name: 'Cacheado',
    icon: 'sparkles',
    characteristics: [
      'Fios com curvatura mais acentuada, em formato de espiral',
      'Em geral, a oleosidade natural tem mais dificuldade de escorrer da raiz às pontas',
      'Podem apresentar maior volume e menor aparência de brilho',
    ],
    care: [
      'A lavagem pode ser feita com frequência moderada, dependendo das características do couro cabeludo',
      'O condicionador auxilia no desembaraço, aplicado do comprimento às pontas',
      'A máscara de tratamento pode ser usada periodicamente, conforme as instruções do rótulo',
      'O leave-in ou creme para pentear pode auxiliar na definição dos cachos',
    ],
    relatedCategories: ['Shampoo', 'Condicionador', 'Máscara', 'Leave-in', 'Creme para pentear'],
    tips: [
      'A hidratação periódica pode auxiliar no manuseio dos fios, dependendo das características',
      'O uso de produtos sem enxágue pode auxiliar na definição dos cachos',
    ],
    sources: [
      {
        title: 'American Academy of Dermatology — Hair care',
        url: 'https://www.aad.org/public/everyday-care/hair-scalp-care/hair-care',
      },
      {
        title: 'ANVISA — Cosméticos',
        url: 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cosmeticos',
      },
    ],
  },
  {
    id: 'crespo',
    name: 'Crespo',
    icon: 'sparkles',
    characteristics: [
      'Fios com curvatura muito acentuada e formato de espiral fechado',
      'Em geral, a oleosidade natural tem mais dificuldade de escorrer da raiz às pontas',
      'Podem apresentar maior volume e menor aparência de brilho',
    ],
    care: [
      'A lavagem pode ser feita conforme a necessidade, dependendo das características do couro cabeludo',
      'O condicionador auxilia no desembaraço, aplicado do comprimento às pontas',
      'A máscara de tratamento pode ser usada periodicamente, conforme as instruções do rótulo',
      'O leave-in ou creme para pentear pode auxiliar no manuseio e na finalização',
      'O óleo capilar pode ser usado em pequena quantidade na finalização',
    ],
    relatedCategories: ['Shampoo', 'Condicionador', 'Máscara', 'Leave-in', 'Creme para pentear', 'Óleo'],
    tips: [
      'A hidratação periódica pode auxiliar no manuseio dos fios, dependendo das características',
      'O uso de produtos sem enxágue pode auxiliar na finalização',
    ],
    sources: [
      {
        title: 'American Academy of Dermatology — Hair care',
        url: 'https://www.aad.org/public/everyday-care/hair-scalp-care/hair-care',
      },
      {
        title: 'ANVISA — Cosméticos',
        url: 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cosmeticos',
      },
    ],
  },
  {
    id: 'seco',
    name: 'Seco',
    icon: 'sun',
    characteristics: [
      'Fios com aparência ressecada e menor suavidade ao toque',
      'Em geral, a oleosidade natural tem mais dificuldade de escorrer da raiz às pontas',
      'Podem apresentar maior fragilidade e propensão ao frizz, dependendo das características',
    ],
    care: [
      'A lavagem pode ser feita com frequência moderada, evitando o excesso de produtos de limpeza',
      'O condicionador auxilia no desembaraço e na suavidade, aplicado do comprimento às pontas',
      'A máscara de tratamento pode ser usada periodicamente, conforme as instruções do rótulo',
      'O leave-in ou óleo capilar pode auxiliar na finalização e no aspecto dos fios',
    ],
    relatedCategories: ['Condicionador', 'Máscara', 'Leave-in', 'Óleo'],
    tips: [
      'A hidratação periódica pode auxiliar no manuseio dos fios, dependendo das características',
      'O uso de óleo em pequena quantidade pode auxiliar no aspecto, conforme as instruções do rótulo',
    ],
    sources: [
      {
        title: 'American Academy of Dermatology — Hair care: How to treat and prevent damage',
        url: 'https://www.aad.org/public/everyday-care/hair-scalp-care/hair-care/treat-prevent-damage',
      },
      {
        title: 'ANVISA — Cosméticos',
        url: 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cosmeticos',
      },
    ],
  },
  {
    id: 'oleoso',
    name: 'Oleoso',
    icon: 'droplet',
    characteristics: [
      'Couro cabeludo com maior produção de oleosidade natural',
      'Em geral, os fios podem parecer oleosos mais rapidamente após a lavagem',
      'A oleosidade pode escorrer da raiz às pontas com facilidade, dependendo do tipo de fio',
    ],
    care: [
      'A lavagem pode ser feita com frequência moderada, dependendo das características do couro cabeludo',
      'O condicionador deve ser aplicado do comprimento às pontas, evitando a raiz',
      'O uso de produtos na raiz pode ser evitado, dependendo das instruções do rótulo',
    ],
    relatedCategories: ['Shampoo', 'Condicionador'],
    tips: [
      'A frequência de lavagem depende das características do couro cabeludo',
      'Em geral, fios oleosos podem parecer mais sujos rapidamente, dependendo das condições',
    ],
    sources: [
      {
        title: 'American Academy of Dermatology — Hair and scalp care',
        url: 'https://www.aad.org/public/everyday-care/hair-scalp-care',
      },
      {
        title: 'ANVISA — Cosméticos',
        url: 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cosmeticos',
      },
    ],
  },
];
