interface FoodAttribute {
  _id: string;
  tag: string;
  locales: { [key: string]: string };
  imageURL: string;
}

export default FoodAttribute;
