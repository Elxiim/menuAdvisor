import Restaurant from "./Restaurant.model";

export default interface Accompaniment {
  _id: string;
  name: string;
  price?: {
    amount: number;
    currency: 'eur' | 'usd';
  };
  imageURL: string;
  restaurant?: Restaurant;
  isObligatory?: boolean;
  priority: number;
}
