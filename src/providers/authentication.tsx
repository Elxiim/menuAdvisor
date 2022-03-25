import { useSnackbar } from 'notistack';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import Api from '../Api';
import Restaurant from '../models/Restaurant.model';
import User from '../models/User.model';
import {
  checkToken,
  login as signin,
  logout as signout,
} from '../services/auth';
import { getOneRestaurant } from '../services/restaurant';
import { getMe } from '../services/user';
import RoleFormatter from '../utils/RoleFormatter';

export type AuthContext = {
  initialized: boolean;
  authenticated: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  isAdmin: boolean;
  isRestaurantAdmin: boolean;
  restaurant: Restaurant | null;
  login: (
    username: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshRestaurant: () => Promise<void>;
};

const authContext = createContext<AuthContext>({
  initialized: false,
  authenticated: false,
  isAdmin: false,
  isRestaurantAdmin: false,
  restaurant: null,
  login: async () => {},
  logout: async () => {},
  refreshRestaurant: async () => {},
});

export const AuthProvider: React.FC = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(() => {
    return (
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken') ||
      undefined
    );
  });
  const [refreshToken, setRefreshToken] = useState<string | undefined>(() => {
    return (
      localStorage.getItem('refreshToken') ||
      sessionStorage.getItem('refreshToken') ||
      undefined
    );
  });
  const [user, setUser] = useState<User | undefined>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  const location = useLocation();

  const login = useCallback(
    async (username: string, password: string, rememberMe?: boolean) => {
      const { user, accessToken, refreshToken } = await signin(
        username,
        password,
      );
      if (RoleFormatter.hasRestaurantAdminRole(user.roles)) {
        setRestaurant(await getOneRestaurant({ admin: user._id }));
      }
      setUser(user);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);

      if (rememberMe) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
    },
    [],
  );

  const refreshRestaurant = useCallback(async () => {
    if (user && RoleFormatter.hasRestaurantAdminRole(user.roles)) {
      setRestaurant(await getOneRestaurant({ admin: user._id }));
    }
  }, [user]);

  const logout = useCallback(async () => {
    await signout();
    setUser(undefined);
    setAccessToken(undefined);
    setRefreshToken(undefined);
  }, []);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    (async () => {
      if (accessToken && refreshToken) {
        try {
          const tokenValidity = await checkToken(accessToken, refreshToken);
          let at: string = accessToken;
          if (tokenValidity?.validity === 'expired') {
            const { access_token, refresh_token } = tokenValidity;
            setAccessToken(access_token);
            setRefreshToken(refresh_token);
            at = access_token;
          } else if (tokenValidity?.validity === 'invalid') {
            throw new Error('Invalid token');
          }
          if (!Api.defaults.headers) Api.defaults.headers = {};
          Api.defaults.headers.authorization = `Bearer ${at}`;

          const user = await getMe();
          setUser(user);
          if (user && RoleFormatter.hasRestaurantAdminRole(user.roles)) {
            setRestaurant(await getOneRestaurant({ admin: user._id }));
          }
        } catch {
          enqueueSnackbar('Session expirée. Veuillez vous reconnecter', {
            variant: 'warning',
          });
          logout();
        } finally {
          if (!initialized) setInitialized(true);
        }
      } else {
        if (!initialized) setInitialized(true);
      }
    })();
  }, [
    location,
    accessToken,
    enqueueSnackbar,
    logout,
    refreshToken,
    initialized,
  ]);

  return (
    <authContext.Provider
      value={{
        initialized,
        authenticated: !!user,
        user,
        accessToken,
        refreshToken,
        login,
        logout,
        isAdmin: !!user && RoleFormatter.hasAdminRole(user.roles),
        isRestaurantAdmin:
          !!user && RoleFormatter.hasRestaurantAdminRole(user.roles),
        restaurant,
        refreshRestaurant,
      }}
    >
      {children}
    </authContext.Provider>
  );
};

export const AuthConsumer = authContext.Consumer;

export const useAuth = () => {
  const authState = useContext(authContext);

  return authState;
};
