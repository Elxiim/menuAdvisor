import { Container, makeStyles, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(5),
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
}));

const NotFoundPage: React.FC = () => {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <Typography variant="h5" align="center">
        Page non trouvé
      </Typography>
    </Container>
  );
};

export default NotFoundPage;
