import Price from '../types/Price';
import Category from './Category.model';
import FoodType from './FoodType.model';
import User from './User.model';

interface OpeningTime {
  begin: {
    hour: number;
    minute: number;
  };
  end: {
    hour: number;
    minute: number;
  };
}

interface Restaurant {
  _id: string;
  priority: number;
  category: Category[];
  name: string;
  description: string;
  foodTypes: FoodType[];
  imageURL: string;
  type: string;
  address: string;
  city: string;
  postalCode: string;
  foods: string[];
  menus: string[];
  admin: User;
  qrcodeLink: string;
  qrcodePricelessLink: string;
  delivery: boolean;
  surPlace: boolean;
  aEmporter: boolean;
  phoneNumber: string;
  fixedLinePhoneNumber: string;
  deliveryPrice: Price;
  openingTimes: {
    day: string;
    openings: OpeningTime[];
  }[];
  location: {
    type: 'Point';
    coordinates: number[];
  };
  status: boolean;
  referencement: boolean;
  paiementLivraison: boolean;
  paiementCB: boolean;
  customerStripeKey: string;
  customerSectretStripeKey: string;
  cbDirectToAdvisor: boolean;
  isMenuActive: boolean;
  isBoissonActive: boolean;
  discount: string;
}

export default Restaurant;
