import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Paper,
  TableCell,
  Typography,
} from '@material-ui/core';
import { Close, Mail as MailIcon } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/Admin/PageHeader';
import Message from '../models/Message.model';
import {
  deleteMessage,
  getMessages,
  markMessageAsRead,
} from '../services/message';
import { useAuth } from '../providers/authentication';
import moment from 'moment';
import EventEmitter from '../services/EventEmitter';
import DateFormatter from '../utils/DateFormatter';
import useDeleteSelection from '../hooks/useDeleteSelection';
import SlideTransition from '../components/Transitions/SlideTransition';
import ShowButton from '../components/Common/ShowButton';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<Message>[] = [
  {
    id: 'name',
    label: 'Nom',
  },
  {
    id: 'email',
    label: 'Email',
  },
  {
    id: 'phoneNumber',
    label: 'Téléphone',
  },
  {
    id: 'message',
    label: 'Message',
  },
  {
    id: 'createdAt',
    label: 'Date',
  },
];

const MessageListPage: React.FC = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<Message[]>([]);
  const [messageToShow, setMessageToShow] = useState<Message>();
  const [selected, setSelected] = useState<string[]>([]);

  const { user, isAdmin } = useAuth();

  const { enqueueSnackbar } = useSnackbar();
  const { handleDeleteSelection } = useDeleteSelection(
    deleteMessage,
    selected,
    {
      onDeleteRecord: (id) =>
        setRecords((v) => v.filter(({ _id }) => _id !== id)),
    },
  );

  const fetch = useCallback(() => {
    let target: string | null = user && !isAdmin ? user?._id : null;

    setLoading(true);
    setRecords([]);
    getMessages({ target })
      .then((data) => {
        setRecords(data);
      })
      .catch(() => {
        enqueueSnackbar('Erreur lors du chargement des données...', {
          variant: 'error',
        });
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enqueueSnackbar]);

  useEffect(() => {
    const onRefresh = () => {
      fetch();
    };

    EventEmitter.on('REFRESH', onRefresh);
    return () => {
      EventEmitter.removeListener('REFRESH', onRefresh);
    };
  }, [fetch]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <>
      <PageHeader
        title="Messages"
        subTitle="Liste des messages reçus"
        icon={MailIcon}
      />
      <Paper className={classes.root}>
        <TableContainer
          headCells={headCells}
          records={records}
          selected={selected}
          onSelectedChange={setSelected}
          showAddButton={false}
          onDeleteClick={handleDeleteSelection}
          loading={loading}
          emptyPlaceholder="Aucun message"
          options={{
            orderBy: 'name',
            hasActionsColumn: true,
            customComparators: {
              createdAt: (a, b) =>
                moment(a.createdAt).diff(b.createdAt, 'days'),
            },
            selectOnClick: false,
            onRowClick: (_, message) => setMessageToShow(message),
          }}
        >
          {(data) => {
            const { name, email, phoneNumber, message, createdAt, read } = data;

            return (
              <>
                <TableCell style={{ fontWeight: !read ? 'bold' : 'initial' }}>
                  {name}
                </TableCell>
                <TableCell style={{ fontWeight: !read ? 'bold' : 'initial' }}>
                  {email}
                </TableCell>
                <TableCell style={{ fontWeight: !read ? 'bold' : 'initial' }}>
                  {phoneNumber}
                </TableCell>
                <TableCell style={{ fontWeight: !read ? 'bold' : 'initial' }}>
                  {message}
                </TableCell>
                <TableCell style={{ fontWeight: !read ? 'bold' : 'initial' }}>
                  {DateFormatter.format(createdAt)}
                </TableCell>
                <TableCell>
                  <ShowButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setMessageToShow(data);
                    }}
                  />
                </TableCell>
              </>
            );
          }}
        </TableContainer>
      </Paper>
      <Dialog
        maxWidth="sm"
        fullWidth
        open={!!messageToShow}
        TransitionComponent={SlideTransition}
      >
        <DialogTitle
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
          disableTypography
        >
          <Typography
            variant="h6"
            style={{ flexGrow: 1 }}
          >{`Message de ${messageToShow?.name}`}</Typography>
          <div>
            <IconButton onClick={() => setMessageToShow(undefined)}>
              <Close />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          {/* <Typography variant="h6" gutterBottom>
            Contenu
          </Typography> */}
          <Typography>{messageToShow?.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            style={{ textTransform: 'none' }}
            color="secondary"
            onClick={() => {
              EventEmitter.emit('REFRESH_NAVIGATION_BAR');
              messageToShow?._id && markMessageAsRead(messageToShow._id);
              setMessageToShow(undefined)
            }}
          >
            Marquer comme lu
          </Button>
          <Button
            style={{ textTransform: 'none' }}
            color="primary"
            onClick={() => setMessageToShow(undefined)}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MessageListPage;
