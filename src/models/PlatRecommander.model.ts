import Food from './Food.model';
import Restaurant from "./Restaurant.model";
interface PlatRecommander {
    _id: string;
    priority: number;
    food: Food;
    restaurant?: Restaurant
}

export default PlatRecommander;
