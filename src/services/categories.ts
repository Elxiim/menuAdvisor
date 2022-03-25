import Api from '../Api';
import { CategoryFormType } from '../components/Forms/CategoryForm';
import Category from '../models/Category.model';

export const getCategories: () => Promise<Category[]> = () =>
  Api.get<Category[]>('/foodCategories').then(({ status, data }) =>
    status === 200 ? data : Promise.reject(data),
  );

const getFormData: (data: Partial<CategoryFormType>) => FormData = (data) => {
  const formData = new FormData();
  data.name && formData.append('name', JSON.stringify({ fr: data.name }));
  if (data.image) formData.append('image', data.image);

  return formData;
};

export const addCategory: (data: CategoryFormType) => Promise<void> = async (
  data,
) => {
  const formData = getFormData(data);

  await Api.post('/foodCategories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateCategory: (
  id: string,
  data: Partial<CategoryFormType>,
) => Promise<void> = async (id, data) => {
  const formData = getFormData(data);

  await Api.put(`/foodCategories/${id}`, formData);
};

export const deleteCategory: (id: string) => Promise<void> = (id) =>
  Api.delete(`/foodCategories/${id}`);
