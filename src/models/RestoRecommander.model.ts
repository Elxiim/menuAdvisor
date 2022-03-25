import Restaurant from "./Restaurant.model";

interface RestoRecommander {
  _id: string;
  priority: number;
  tag: string;
  restaurant?: Restaurant;
}

export default RestoRecommander;
