interface Category {
  _id: string;
  priority: number;
  name: { [key: string]: string };
  imageURL: string;
}

export default Category;
