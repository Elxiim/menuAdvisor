import Api from '../Api';
import { AdminMessageFormType } from '../components/Forms/AdminMessageForm';
import AdminMessage from '../models/AdminMessage';

export const getAllMessages: () => Promise<AdminMessage[]> = async () => {
    try {
      const res = await Api.get<AdminMessage[]>(
        `/adminMessage`,
      );
  
      if (res.status === 200) return res.data;
      else return Promise.reject(res.data);
    } catch (err) {
      return Promise.reject(err?.response?.data || 'Unknown error');
    }
  };

export const getRestoMessages: (restoId: string) => Promise<AdminMessage[]> = async (restoId) => {
    try {
      const res = await Api.get<AdminMessage[]>(
        `/adminMessage/${restoId}`,
      );
  
      if (res.status === 200) return res.data;
      else return Promise.reject(res.data);
    } catch (err) {
      return Promise.reject(err?.response?.data || 'Unknown error');
    }
  };

export const postMessage: (data: AdminMessageFormType) => Promise<void> = async (
    data,
  ) => {
    await Api.post('/adminMessage', {...data, target: (data.target || []).length > 0 ? data?.target?.map(e => e._id) : [] });
  };

export const readMessage: (id: string, restoId: string) => Promise<void> = (id, restoId) => Api.put(`/adminMessage/${id}/${restoId}/read`)

export const updateMessage: (id: string, data: Partial<AdminMessage>) => Promise<void> = (id, data) =>  Api.put(`/adminMessage/${id}`, data);

export const deleteMessage: (id: string) => Promise<void> = (id) => Api.delete(`/adminMessage/${id}`)