type TokenValidity =
  | {
      validity: 'valid' | 'invalid';
      message?: string;
    }
  | {
      validity: 'expired';
      access_token: string;
      refresh_token: string;
    };

export default TokenValidity;
