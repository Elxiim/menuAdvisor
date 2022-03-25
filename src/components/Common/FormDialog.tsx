import React from 'react';
import {
  AppBar,
  Container,
  Dialog,
  IconButton,
  makeStyles,
  Theme,
  Toolbar,
  Typography,
} from '@material-ui/core';
import SlideTransition from '../Transitions/SlideTransition';
import { Close as CloseIcon } from '@material-ui/icons';

const useStyles = makeStyles<Theme, { noPadding?: boolean }>((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  formDialog: {
    paddingTop: ({ noPadding }) => (!noPadding ? theme.spacing(6) : undefined),
    paddingBottom: ({ noPadding }) => (!noPadding ? theme.spacing(6) : undefined),
  },
}));

interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  noPadding?: boolean;
}

const FormDialog: React.FC<FormDialogProps> = ({
  open,
  title,
  onClose,
  children,
  maxWidth,
  fullScreen = true,
  noPadding,
}) => {
  const classes = useStyles({ noPadding });

  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth
      open={open}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      maxWidth={maxWidth}
      scroll="body"
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => onClose({}, 'escapeKeyDown')}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container className={classes.formDialog} maxWidth={maxWidth}>
        <>{children}</>
      </Container>
    </Dialog>
  );
};

export default FormDialog;
