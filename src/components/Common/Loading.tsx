import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Backdrop, CircularProgress, Theme } from '@material-ui/core';

const useStyles = makeStyles<
  Theme,
  { backgroundColor?: string; semiTransparent?: boolean; color?: string }
>((theme) => ({
  backdrop: ({
    backgroundColor = 'white',
    semiTransparent,
    color = '#000',
  }) => ({
    zIndex: theme.zIndex.drawer + 1,
    color: semiTransparent ? undefined : color,
    backgroundColor: semiTransparent ? undefined : backgroundColor,
  }),
}));

interface LoadingProps {
  open: boolean;
  backgroundColor?: string;
  semiTransparent?: boolean;
  color?: string;
  unmountOnExit?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  open,
  backgroundColor,
  semiTransparent,
  color,
  unmountOnExit,
}) => {
  const classes = useStyles({
    backgroundColor,
    semiTransparent,
    color,
  });

  return (
    <Backdrop
      unmountOnExit={unmountOnExit}
      open={open}
      className={classes.backdrop}
    >
      <CircularProgress />
    </Backdrop>
  );
};

export default Loading;
