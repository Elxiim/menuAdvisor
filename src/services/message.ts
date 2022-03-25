import Api from '../Api';
import Message from '../models/Message.model';

export const getMessages: (options: {
  target: string | null;
  read?: boolean;
}) => Promise<Message[]> = async ({ target, read }) => {
  try {
    const res = await Api.get<Message[]>(
      `/messages?filter=${JSON.stringify({ target, read })}`,
    );

    if (res.status === 200) return res.data;
    else return Promise.reject(res.data);
  } catch (err) {
    return Promise.reject(err?.response?.data || 'Unknown error');
  }
};

export const getMessageCount: (options: {
  target: string | null;
  read?: boolean;
}) => Promise<any> = async ({ target, read }) => {
  try {
    const res = await Api.get<{ count: number }>(
      `/messages/count?filter=${JSON.stringify({ target, read })}`,
    );

    if (res.status === 200) return { count: res.data.count };
    else return Promise.reject(res.data);
  } catch (err) {
    return Promise.reject(err?.response?.data || 'Unknown error');
  }
};

export const markMessageAsRead: (id: string) => Promise<void> = (id) =>
  Api.put(`/messages/${id}/read`);

export const deleteMessage: (id: string) => Promise<void> = (id) =>
  Api.delete(`/messages/${id}`);
