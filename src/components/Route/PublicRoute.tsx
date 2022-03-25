import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router';
import { useAuth } from '../../providers/authentication';

type PublicRouteProps = RouteProps & {
  redirectTo?: string;
};

const PublicRoute: React.FC<PublicRouteProps> = ({
  redirectTo = '/',
  ...props
}) => {
  const { authenticated, initialized } = useAuth();

  return !authenticated ? (
    <Route {...props} />
  ) : initialized ? (
    <Redirect to={redirectTo} />
  ) : null;
};

export default PublicRoute;
