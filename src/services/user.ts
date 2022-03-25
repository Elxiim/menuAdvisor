import Api from '../Api';
import { UserFormType } from '../components/Forms/UserForm';
import User from '../models/User.model';
import Role from '../types/Role';

export const getMe: () => Promise<User | undefined> = async () => {
  try {
    const res = await Api.get<User>('/users/me');
    if (res.status === 200) {
      return res.data;
    } else {
      return Promise.reject(res.data);
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getUsers: (filter?: {
  role?: Role;
  alreadyRestaurantAdmin?: boolean;
}) => Promise<User[]> = async (filter = {}) => {
  try {
    const filters: { [key: string]: any } = {};

    if (filter.role) filters.roles = { $in: [filter.role] };

    if (typeof filter.alreadyRestaurantAdmin !== 'undefined')
      filters.alreadyRestaurantAdmin = filter.alreadyRestaurantAdmin;

    const res = await Api.get<User[]>(
      `/users?filter=${JSON.stringify(filters)}`,
    );

    if (res.status === 200) {
      return res.data;
    } else {
      return Promise.reject(res.data);
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getUsersById: (data: string) => Promise<User> = async (data) => {
  try {
    const res = await Api.get<User>(
      `/users/one/${data}`,
    );

    if (res.status === 200) {
      return res.data;
    } else {
      return Promise.reject(res.data);
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

export const changeProfile: (data: Partial<User>) => Promise<void> = async (
  data,
) => {
  const res = await Api.put(`/users/${data._id}`, data);

  if (res.status !== 200) {
    const error = {
      status: res.status,
      message: 'Erreur',
    };

    return Promise.reject(error);
  }
};

export const changePassword: (data: {
  oldPassword: string;
  newPassword: string;
}) => Promise<void> = async ({ oldPassword, newPassword }) => {
  const res = await Api.post('/users/update-password', {
    oldPassword,
    newPassword,
  });

  if (res.status !== 200) {
    const error = {
      status: res.status,
      ...res.data,
    };

    return Promise.reject(error);
  }
};

export const deleteUser: (id: string) => Promise<void> = async (id) =>
  Api.delete(`/users/${id}`);

export type UserData = {
  name: {
    first?: string;
    last?: string;
  };
  email: string;
  roles: Role[];
  phoneNumber: string;
  password: string;
};

const getUserData: (data: Partial<UserFormType>) => Partial<UserData> = ({
  firstname: first,
  lastname: last,
  password,
  email,
  phoneNumber,
  role,
}) => ({
  name: {
    first,
    last,
  },
  password,
  email,
  phoneNumber,
  roles: [role as Role],
});

export const addUser: (user: UserFormType) => Promise<void> = async (user) => {
  const userData = getUserData(user);
  await Api.post('/users', userData);
};

export const updateUser: (
  id: string,
  user: Partial<UserFormType>,
) => Promise<void> = async (id, user) => {
  const userData = getUserData(user);

  if (userData.password === "") {
    delete userData.password;
  }

  await Api.put(`/users/${id}`, userData);
};

export default changeProfile;
