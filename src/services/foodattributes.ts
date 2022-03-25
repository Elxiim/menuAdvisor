import Api from '../Api';
import { AttributeFormType } from '../components/Forms/AttributeForm';
import FoodAttribute from '../models/FoodAttribute.model';

export const getFoodAttributes: (filter?: {
  [key: string]: string;
}) => Promise<FoodAttribute[]> = async (filter = {}) => {
  try {
    const res = await Api.get<FoodAttribute[]>(
      `/foodAttributes?filter=${JSON.stringify(filter)}`,
      {
        method: 'GET',
      },
    );
    if (res.status === 200) {
      return res.data;
    } else {
      const error = {
        status: res.status,
        message: 'Erreur',
      };
      return Promise.reject(error);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

const getFormData: (data: Partial<AttributeFormType>) => FormData = (data) => {
  const formData: FormData = new FormData();
  data.name && formData.append('locales', JSON.stringify({ fr: data.name }));
  data.isAllergen && formData.append('isAllergen', String(data.isAllergen));
  data.image && formData.append('image', data.image);

  return formData;
};

export const addFoodAttribute: (
  data: AttributeFormType,
) => Promise<void> = async (data) => {
  const formData = getFormData(data);

  await Api.post('/foodAttributes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateFoodAttribute: (
  id: string,
  data: Partial<AttributeFormType>,
) => Promise<void> = async (id, data) => {
  const formData = getFormData(data);

  await Api.put(`/foodAttributes/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteFoodAttribute: (id: string) => Promise<void> = (id) =>
  Api.delete(`/foodAttributes/${id}`);
