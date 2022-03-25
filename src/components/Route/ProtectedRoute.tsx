import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router';
import { useAuth } from '../../providers/authentication';

const ProtectedRoute: React.FC<RouteProps> = (props) => {
  const { authenticated, initialized } = useAuth();

  return authenticated ? (
    <Route {...props} />
  ) : initialized ? (
    <Redirect to={`/login?redirectTo=${props.location?.pathname}`} />
  ) : null;
};

export default ProtectedRoute;
