import Api from '../Api';
import { PlatRecommanderFormType } from '../components/Forms/PlatRecommanderForm';
import PlatRecommander from '../models/PlatRecommander.model';

export const getPlatRecommander: (filter?: {}) => Promise<PlatRecommander[]> = (filter) =>
  Api.get<PlatRecommander[]>(`/platRecommander?${filter ? `filter=${JSON.stringify(filter)}` : ''}`).then(({ status, data }) =>
    status === 200 ? data : Promise.reject(data),
  );
  
export const addPlatRecommander: (data: PlatRecommanderFormType) => Promise<any> = (data) =>
  Api.post('/platRecommander', {
    food: data.food,
    restaurant: data.restaurant
  });

export const updatePlatRecommander: (
  id: string,
  data: Partial<PlatRecommanderFormType>,
) => Promise<void> = (id, data) => 
   Api.put(`/platRecommander/${id}`, {
     priority: data.priority,
  });

export const deletePlatRecommander: (id: string) => Promise<void> = (id) =>
  Api.delete(`/platRecommander/${id}`);
