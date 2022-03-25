import Api from '../Api';
import { AccompanimentFormType } from '../components/Forms/AccompanimentForm';
import Accompaniment from '../models/Accompaniment.model';

export const getAccompaniments: (filter?: { restaurant: string }) => Promise<Accompaniment[]> = (filter) =>
  Api.get<Accompaniment[]>(`/accompaniments?${filter ? `filter=${JSON.stringify(filter)}` : ''}`).then(({ status, data }) =>
    status === 200 ? data : Promise.reject(data),
  );

const getFormData: (data: Partial<AccompanimentFormType>) => FormData = (
  data,
) => {
  const formData = new FormData();

  data.restaurant && formData.append('restaurant', data.restaurant);
  data.isObligatory && formData.append('isObligatory', data.isObligatory.toString())
  data.name && formData.append('name', data.name);
  data.price &&
    formData.append(
      'price',
      JSON.stringify({
        amount: Number(data.price.replace(',', '.')) * 100,
        currency: 'eur',
      }),
    );
  data.image && formData.append('image', data.image);
  data.priority && formData.append('priority', JSON.stringify(data.priority));

  return formData;
};

export const addAccompaniment: (
  data: AccompanimentFormType,
) => Promise<void> = async (data) => {
  const formData = getFormData(data);
  await Api.post('/accompaniments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateAccompaniment: (
  id: string,
  data: Partial<AccompanimentFormType>,
) => Promise<void> = async (id, data) => {
  const formData = getFormData(data);

  await Api.put(`/accompaniments/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteAccompaniment: (id: string) => Promise<void> = (id) =>
  Api.delete(`/accompaniments/${id}`);
