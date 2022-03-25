import Axios from 'axios';
import User from '../models/User.model';
import Api from '../Api';
import TokenValidity from '../types/TokenValidity';

export type LoginResult = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export const login: (
  login: string,
  password: string,
) => Promise<LoginResult> = async (login, password) => {
  try {
    const { data, status } = await Api.post('/login', {
      login,
      password,
    });

    if (status === 200) {
      const {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
      } = data as { access_token: string; refresh_token: string; user: User };

      if (!Api.defaults.headers) Api.defaults.headers = {};

      Api.defaults.headers.authorization = `Bearer ${accessToken}`;

      return { user, accessToken, refreshToken };
    }

    return Promise.reject(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const logout: () => Promise<any> = async () => {
  if (Api.defaults.headers) delete Api.defaults.headers.authorization;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
};

export const register: (data: {
  phoneNumber: string;
  name: {
    first: string;
    last: string;
  };
  email: string;
  password: string;
}) => Promise<any> = async (data) => {
  try {
    const reponse = await Api.post('/users/register', data);
    if (reponse.status === 200) {
      return reponse.data;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

export const resendConfirmationCode: (token: string) => Promise<any> = async (
  token,
) => {
  try {
    const response = await Api.post('/users/resend-confirmation-code', {
      token,
    });
    if (response.status === 200) {
      return response.data;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const confirm_account: (data: {}) => Promise<any> = async (data) => {
  try {
    const reponse = await Api.post('/users/confirm-account', data);
    if (reponse.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

export const reset_password: (data: {}) => Promise<any> = async (data) => {
  try {
    const reponse = await Axios(
      `${process.env.REACT_APP_API_URL}/users/reset-password`,
      {
        method: 'POST',
        data: data,
      },
    );
    if (reponse.status === 200) {
      return reponse;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

export const confirm_reset_password: (data: {}) => Promise<any> = async (
  data,
) => {
  try {
    const reponse = await Api.post('/users/confirm-reset-password', data);
    if (reponse.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }

};

export const checkToken: (
  accessToken: string,
  refreshToken: string,
) => Promise<TokenValidity | null> = async (accessToken, refreshToken) => {
  try {
    const response = await Api.get<TokenValidity>(
      `/check-token?access_token=${accessToken}&refresh_token=${refreshToken}`,
    );
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (err) {
    if (err.response.status === 401) return err.response.data;
    return Promise.reject(err.response.data);
  }
};
