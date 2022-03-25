import Api from '../Api';
import { RestoRecommandedFormType } from '../components/Forms/RestoRecommanderForm';
import RestoRecommander from '../models/RestoRecommander.model';

export const getRestoRecommandeds: (filter?: { restaurant: string }) => Promise<RestoRecommander[]> = (filter) =>
  Api.get<RestoRecommander[]>(`/restoRecommander?${filter ? `filter=${JSON.stringify(filter)}` : ''}`).then(({ status, data }) =>
    status === 200 ? data : Promise.reject(data),
  );

export const addRestoRecommander: (data: RestoRecommandedFormType) => Promise<any> = (data) =>
  Api.post('/restoRecommander', {
    restaurant: data.restaurant,
  });

export const updateRestoRecommander: (
  id: string,
  data: Partial<RestoRecommandedFormType>,
) => Promise<void> = (id, data) =>
    Api.put(`/restoRecommander/${id}`, {
      priority: data.priority,
    });

export const deleteRestoRecommander: (id: string) => Promise<void> = (id) =>
  Api.delete(`/restoRecommander/${id}`);
