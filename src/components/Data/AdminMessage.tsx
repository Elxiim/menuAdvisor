import React, { useCallback, useEffect, useState } from 'react';
import { setLoged } from '../../actions/event.action';
import { useDispatch, useSelector } from '../../utils/redux';

import AdminMessage from '../../models/AdminMessage'
import { getRestoMessages, readMessage } from '../../services/adminMessage';
import { useAuth } from '../../providers/authentication';
import { useSnackbar } from 'notistack';

import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { Loading } from '../Common';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  title: string;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { title, classes, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{title}</Typography>
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const AdminMessageModal = () => {
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const {loged}: any = useSelector(({event}: any) => ({loged: event.loged}));
    const { isRestaurantAdmin, restaurant } = useAuth();

    const [index, setIndex] = useState<number>(0);
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const load = () => {
            setLoading(true);
            getRestoMessages(restaurant?._id || '')
                .then((data) => setMessages(data.filter((mess) => {
                    console.log(mess)
                    return mess.read.findIndex((restoId) => restoId === restaurant?._id) === -1
                })))
                .catch((e) => enqueueSnackbar('Erreur lors du chargement du message', {variant: 'error'}))
                .finally(() => setLoading(false));
        }

        if (isRestaurantAdmin && loged && restaurant?._id) load();
    }, [restaurant?._id, isRestaurantAdmin, loged, enqueueSnackbar])

    const handleClose = useCallback(async () => {
        await dispatch(setLoged(false));
        messages?.forEach(async (mess) => {
            await readMessage(mess._id, restaurant?._id || '');
        })
    }, [restaurant?._id, dispatch, messages]);

    const next = useCallback(() => {
        setIndex(index + 1);
    }, [index]);

    const prev = useCallback(() => {
        setIndex(index - 1);
    }, [index]);

    return (
        <>
            {messages.length > 0 && (
                <Dialog 
                    fullScreen={fullScreen}
                    maxWidth="md" 
                    fullWidth 
                    onClose={handleClose} 
                    aria-labelledby="customized-dialog-title" 
                    open={loged}
                >
                    <DialogTitle id="customized-dialog-title" title="Message de l'administrateur" />
                    <DialogContent dividers>
                        {loading 
                        ?(
                            <Loading open />
                         ) 
                        :(
                            <Typography gutterBottom>
                                {messages[index]?.message}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                    <Button disabled={index === 0 || index === messages.length - 1} onClick={prev} color="primary">
                        Precédant
                    </Button>    
                    <Button disabled={index === messages.length - 1} onClick={next} color="primary">
                        Suivant
                    </Button>
                    <Button disabled={index !== messages.length - 1} onClick={handleClose} color="primary">
                        Fermer
                    </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    )
};

export default AdminMessageModal;