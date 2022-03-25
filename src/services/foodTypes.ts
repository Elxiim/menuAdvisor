import Api from '../Api';
import { FoodTypeFormType } from '../components/Forms/FoodTypeForm';
import FoodType from '../models/FoodType.model';

export const getFoodTypes: (filter?: {restaurant: string}) => Promise<FoodType[]> = (filter) =>
  Api.get<FoodType[]>(`/foodTypes?${filter ? `filter=${JSON.stringify(filter)}` : ''}`).then(({ status, data }) =>
    status === 200 ? data : Promise.reject(data),
  );

export const addFoodType: (data: FoodTypeFormType) => Promise<any> = (data) =>
  Api.post('/foodTypes', {
    name: { fr: data.name },
    restaurant: data.restaurant,
  });

export const updateFoodType: (
  id: string,
  data: Partial<FoodTypeFormType>,
) => Promise<void> = (id, data) =>
  Api.put(`/foodTypes/${id}`, {
    name: data.name && { fr: data.name },
    priority: data.priority,
  });

export const deleteFoodType: (id: string) => Promise<void> = (id) =>
  Api.delete(`/foodTypes/${id}`);
