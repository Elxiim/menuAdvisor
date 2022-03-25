import Api from '../Api';
import Command from '../models/Command.model';

export const getCommands: (
  type?: 'delivery' | 'on_site' | 'takeaway',
  filter?: { restaurant?: string | null; validated?: boolean },
) => Promise<Command[]> = (type, filter) =>
  Api.get<Command[]>(
    `/commands?${type ? `type=${type}` : ''}${
      filter ? `&filter=${JSON.stringify(filter)}` : ''
    }`,
  ).then(({ status, data }) => (status === 200 ? data : Promise.reject(data)));

export const getCommandCount: (
  type?: 'delivery' | 'on_site' | 'takeaway',
  filter?: { restaurant?: string | null; validated?: boolean },
) => Promise<number> = (type, filter) =>
  Api.get<{ count: number }>(
    `/commands/count?${type ? `type=${type}` : ''}${
      filter ? `&filter=${JSON.stringify(filter)}` : ''
    }`,
  ).then(({ status, data }) =>
    status === 200 ? data.count : Promise.reject(data),
  );

export const getCommandById: (id: string) => Promise<Command> = (id) =>
  Api.get<Command>(`/commands/${id}`).then(({ status, data }) =>
    status === 200 ? data : Promise.reject(data),
  );

export const getCommandsOfUser: (params: {
  relatedUser?: string;
  commandType?: string;
  limit?: number;
  offset?: number;
}) => Promise<Command[]> = ({ relatedUser, commandType, limit, offset }) =>
  Api.get<Command[]>(
    `/commands?filter=${JSON.stringify({ relatedUser, commandType })}${
      limit ? '&limit=' + limit : ''
    }${offset ? '&offset=' + offset : ''}`,
  ).then(({ status, data }) => (status === 200 ? data : Promise.reject(data)));

export const deleteCommand: (id: string) => Promise<void> = (id) =>
  Api.delete(`/commands/${id}`);

export const validateCommand: (id: string) => Promise<void> = (id) =>
  Api.post(`/commands/${id}/validate`);

export const revokeCommand: (id: string) => Promise<void> = (id) =>
  Api.post(`/commands/${id}/revoke`);
