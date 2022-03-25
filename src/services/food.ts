import Axios from 'axios';
import Food from '../models/Food.model';
import querystring from 'querystring';
import Restaurant from '../models/Restaurant.model';
import { Lang } from '../types/Lang';
import Api from '../Api';
import { FoodFormType } from '../components/Forms/FoodForm';

type Result = Food & {
  restaurant_object?: Restaurant;
};

export const getFoods: (params?: {
  restaurant?: string | null;
  limit?: number;
  offset?: number;
  lang?: Lang;
  searchCategory?: 'popular' | 'with_price' | 'onsite' | 'without_price';
}) => Promise<Food[]> = async (params = { lang: 'fr' }) => {
  try {
    let query = '';
    if (Object.keys(params).length) query = `?${querystring.stringify(params)}`;

    const res = await Api.get<Result[]>(`/foods${query}`);
    if (res.status === 200) {
      return (res.data as Result[]).map((food) => ({
        ...food,
        restaurant: food.restaurant_object || food.restaurant,
      }));
    } else {
      const error = {
        status: res.status,
        message: 'Error',
      };
      return Promise.reject(error);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

export const searchFoods: (params: {
  lang?: string;
  query: string;
  restaurant?: string;
  filter?: { [key: string]: any };
}) => Promise<{ type: 'food'; content: Food }[]> = async ({
  lang = 'fr',
  query,
  restaurant,
  filter = {},
}) => {
    try {
      if (restaurant) filter.restaurant = restaurant;

      const res = await Axios(
        `${process.env.REACT_APP_API_URL
        }/search?lang=${lang}&type=food&q=${query}&filter=${JSON.stringify(
          filter,
        )}`,
        {
          method: 'GET',
        },
      );
      if (res.status === 200) {
        return (res.data as { type: 'food'; content: Food }[]).filter(
          ({ content: { restaurant } }) =>
            restaurant && restaurant.status && restaurant.referencement,
        );
      } else {
        const error = {
          status: res.status,
          message: 'Error',
        };
        return Promise.reject(error);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const getFoodWithId: (id: string, lang: Lang) => Promise<Food> = async (
  id,
  lang,
) => {
  try {
    const res = await Api.get<Food>(`/foods/${id}?lang=fr`);
    if (res.status === 200) {
      return res.data;
    } else {
      const error = {
        status: res.status,
        message: 'Error',
      };
      return Promise.reject(error);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

const getFormData: (data: Partial<FoodFormType>) => FormData = (data) => {
  const formData = new FormData();

  formData.append('isAvailable', JSON.stringify(data.isAvailable));
  data.priority && formData.append('priority', JSON.stringify(data.priority));
  data.description && formData.append('description', data.description);
  data.name && formData.append('name', JSON.stringify({ fr: data.name }));
  data.type && formData.append('type', data.type);
  data.price &&
    formData.append(
      'price',
      JSON.stringify({
        amount: Number(data.price.replace(',', '.')) * 100,
        currency: 'eur',
      }),
    );
  data.attributes &&
    formData.append('attributes', JSON.stringify(data.attributes));
  data.restaurant && formData.append('restaurant', data.restaurant);
  data.options &&
    formData.append(
      'options',
      JSON.stringify(
        data.options.map(({ maxOptions, ...data }) => ({
          ...data,
          maxOptions: Number(maxOptions),
        })),
      ),
    );
  data.image && formData.append('image', data.image);
  typeof data.statut !== 'undefined' &&
    formData.append('statut', JSON.stringify(data.statut));
  typeof data.imageNotContractual !== 'undefined' &&
    formData.append('imageNotContractual', JSON.stringify(data.imageNotContractual));
  typeof data.allergene !== 'undefined' &&
    formData.append('allergene', JSON.stringify(data.allergene));

  return formData;
};

export const addFood: (data: FoodFormType) => Promise<void> = async (data) => {
  const formData = getFormData(data);

  await Api.post('/foods', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateFood: (
  id: string,
  data: Partial<FoodFormType>,
) => Promise<void> = async (id, data) => {
  const formData = getFormData(data);

  Api.put(`/foods/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteFood: (id: string) => Promise<void> = (id) =>
  Api.delete(`/foods/${id}`);
