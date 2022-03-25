import Accompaniment from './Accompaniment.model';
import FoodAttribute from './FoodAttribute.model';
import FoodType from './FoodType.model';
import Restaurant from './Restaurant.model';

interface Food {
  _id: string;
  name: string;
  description?: string;
  type: FoodType;
  attributes: Array<FoodAttribute>;
  restaurant?: Restaurant;
  note: number;
  imageURL: string;
  priority: number;
  price: {
    amount: number;
    currency: 'eur' | 'usd';
  };
  statut: boolean;
  options: {
    title: string;
    maxOptions: number;
    items: Accompaniment[];
  }[];
  imageNotContractual: boolean;
  allergene: boolean;
  isAvailable?: boolean;
}

export default Food;
