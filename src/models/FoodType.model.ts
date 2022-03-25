import Restaurant from "./Restaurant.model";

interface FoodType {
  _id: string;
  priority: number;
  tag: string;
  name: { [key: string]: string };
  restaurant?: Restaurant;
}

export default FoodType;
