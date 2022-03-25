import React from 'react';
import { makeStyles, Paper, Typography } from '@material-ui/core';
import { Route, RouteProps } from 'react-router';
import { useAuth } from '../../providers/authentication';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
    dispaly: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const PublicRoute: React.FC<RouteProps> = (props) => {
  const classes = useStyles();

  const { isAdmin, initialized } = useAuth();

  return isAdmin ? (
    <Route {...props} />
  ) : initialized ? (
    <Paper className={classes.root}>
      <Typography variant="h5">
        Vous n'êtes pas autorisé à accéder à cette section
      </Typography>
    </Paper>
  ) : null;
};

export default PublicRoute;
