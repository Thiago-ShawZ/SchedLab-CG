export type Category =
  | 'Shampoo'
  | 'Condicionador'
  | 'Máscara'
  | 'Leave-in'
  | 'Óleo'
  | 'Creme para pentear';

export interface Source {
  title: string;
  url: string;
}

export interface IngredientInfo {
  name: string;
  note: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  description: string;
  indication: string;
  usage: string;
  benefits: string[];
  ingredients: IngredientInfo[];
  labelInstructions: string;
  sources: Source[];
  modelPath: string;
}
