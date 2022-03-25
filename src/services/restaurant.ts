import Restaurant from '../models/Restaurant.model';
import { Lang } from '../types/Lang';
import Api from '../Api';
import search from './all';
import { RestaurantFormType } from '../components/Forms/RestaurantForm';

export const getRestaurants: (params?: {
  searchCategory?: 'nearest' | 'new';
  coordinates?: [number, number];
  admin?: string;
}) => Promise<Restaurant[]> = async (params = {}) => {
  try {
    const res = await Api.get(
      `/restaurants?admin=${params.admin || ''}${params.searchCategory
        ? `&searchCategory=${params.searchCategory}${params.searchCategory === 'nearest' && params.coordinates
          ? `&location=${JSON.stringify({
            coordinates: params.coordinates,
          })}`
          : ''
        }`
        : ''
      }`,
      {
        method: 'GET',
      },
    );
    if (res.status === 200) {
      return res.data as Restaurant[];
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

export const getRestaurantWithId: (
  id: string,
  lang: Lang,
) => Promise<Restaurant> = async (id, lang) => {
  try {
    const res = await Api.get(`/restaurants/${id}?lang=${lang}`, {
      method: 'GET',
    });
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

export const getOneRestaurant: (filter?: {
  [key: string]: any;
}) => Promise<Restaurant | null> = async (filter = {}) => {
  const res = await search({
    lang: 'fr',
    query: '',
    filter,
    type: 'restaurant',
  });

  if (res.length && res[0].type === 'restaurant') return res[0].content;

  return null;
};

const getFormData: (data: Partial<RestaurantFormType>) => FormData = (data) => {
  const formData = new FormData();
  data.name && formData.append('name', data.name);
  data.description && formData.append('description', data.description);
  data.city && formData.append('city', data.city);
  data.postalCode && formData.append('postalCode', data.postalCode);
  data.address && formData.append('address', data.address);
  data.categories &&
    formData.append('category', JSON.stringify(data.categories));
  data.foodTypes &&
    formData.append('foodTypes', JSON.stringify(data.foodTypes));

  if (data.openingTimes) {
    const openingTimes: {
      day: string;
      openings: {
        begin: { hour: number; minute: number };
        end: { hour: number; minute: number };
      }[];
    }[] = [];
    data.openingTimes.forEach((value, key) => {
      if (value.activated)
        openingTimes.push({
          day: key,
          openings: value.openings.map(({ begin, end }) => ({
            begin: {
              hour: Number(begin.hour),
              minute: Number(begin.minute),
            },
            end: {
              hour: Number(end.hour),
              minute: Number(end.minute),
            },
          })),
        });
    });
    formData.append('openingTimes', JSON.stringify(openingTimes));
  }

  typeof data.delivery === 'boolean' &&
    formData.append('delivery', JSON.stringify(data.delivery));
  typeof data.surPlace === 'boolean' &&
    formData.append('surPlace', JSON.stringify(data.surPlace));
  typeof data.aEmporter === 'boolean' &&
    formData.append('aEmporter', JSON.stringify(data.aEmporter));
  typeof data.paiementLivraison === 'boolean' &&
    formData.append(
      'paiementLivraison',
      JSON.stringify(data.paiementLivraison),
    );
  typeof data.referencement === 'boolean' &&
    formData.append('referencement', JSON.stringify(data.referencement));
  typeof data.status === 'boolean' &&
    formData.append('status', JSON.stringify(data.status));
  data.deliveryPrice &&
    formData.append(
      'deliveryPrice',
      JSON.stringify({
        amount: Number(data.deliveryPrice.replace(',', '.')) * 100,
        currency: 'eur',
      }),
    );
  data.phoneNumber && formData.append('phoneNumber', data.phoneNumber);
  data.fixedLinePhoneNumber &&
    formData.append('fixedLinePhoneNumber', data.fixedLinePhoneNumber);
  data.admin && formData.append('admin', data.admin);
  data.longitude &&
    data.latitude &&
    formData.append(
      'location',
      JSON.stringify({
        type: 'Point',
        coordinates: [
          Number(data.longitude.replace(',', '.')),
          Number(data.latitude.replace(',', '.')),
        ],
      }),
    );
  data.image && formData.append('image', data.image);
  typeof data.paiementCB === 'boolean' &&
    formData.append(
      'paiementCB',
      JSON.stringify(data.paiementCB),
    );
  typeof data.cbDirectToAdvisor === 'boolean' &&
    formData.append(
      'cbDirectToAdvisor',
      JSON.stringify(data.cbDirectToAdvisor),
    );
  data.customerStripeKey && formData.append('customerStripeKey', data.customerStripeKey);
  data.customerSectretStripeKey && formData.append('customerSectretStripeKey', data.customerSectretStripeKey);
  typeof data.isMenuActive === 'boolean' &&
    formData.append('isMenuActive', JSON.stringify(data.isMenuActive));
  typeof data.isBoissonActive === 'boolean' &&
    formData.append('isBoissonActive', JSON.stringify(data.isBoissonActive));
  data.discount && formData.append('discount', data.discount);

  return formData;
};

export const addRestaurant: (data: RestaurantFormType) => Promise<void> =
  async (data) => {
    const formData = getFormData(data);

    await Api.post('/restaurants', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

export const updateRestaurant: (
  id: string,
  data: Partial<RestaurantFormType>,
) => Promise<void> = async (id, data) => {
  const formData = getFormData(data);

  await Api.put(`/restaurants/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteRestaurant: (id: string) => Promise<void> = (id) =>
  Api.delete(`/restaurants/${id}`);

  export const deleteRestaurantByName: (name: string) => Promise<void> = (name) =>
  Api.delete(`/restaurants/deleteByName/${name}`);
