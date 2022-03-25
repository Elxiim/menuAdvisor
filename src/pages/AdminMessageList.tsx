import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Chip, makeStyles, Paper, TableCell } from '@material-ui/core';
import PageHeader from '../components/Admin/PageHeader';
import { List as ListIcon } from '@material-ui/icons';
import {
  deleteMessage,
  getAllMessages,
  updateMessage,
  postMessage
} from '../services/adminMessage';
import { useSnackbar } from 'notistack';
import EventEmitter from '../services/EventEmitter';
import useDeleteSelection from '../hooks/useDeleteSelection';
import FormDialog from '../components/Common/FormDialog';
import EditButton from '../components/Common/EditButton';
import DeleteButton from '../components/Common/DeleteButton';
import useDelete from '../hooks/useDelete';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import { Loading } from '../components/Common';
import { useAuth } from '../providers/authentication';
import AdminMessage from '../models/AdminMessage';
import AdminMessageForm, { AdminMessageFormType } from '../components/Forms/AdminMessageForm';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<AdminMessage>[] = [
  {
    id: 'message',
    label: 'Message',
    disableSorting: false,
  },
  {
    id: 'target',
    label: 'Destination',
  },
];

const AdminMessageList: React.FC = () => {
  const classes = useStyles();

  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<AdminMessage[]>([]);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const modif = useRef<AdminMessageFormType>();

  const { enqueueSnackbar } = useSnackbar();
  const { handleDeleteSelection } = useDeleteSelection(
    deleteMessage,
    selected,
    {
      onDeleteRecord: (id) =>
        setRecords((v) => v.filter(({ _id }) => _id !== id)),
    },
  );
  const { handleDelete } = useDelete(deleteMessage);

  const fetch = useCallback(async () => {
    setLoading(true);
    setRecords([]);
    getAllMessages()
    .then((data) => {
      setRecords(data);
    })
    .catch(() => {
      enqueueSnackbar('Erreur lors du chargement...', { variant: 'error' });
    })
    .finally(() => {
      setLoading(false);
    });
  }, [enqueueSnackbar]);

  const saveData = useCallback(
    (data: AdminMessageFormType) => {
      setSaving(true);
      if (modif.current && data._id)
        updateMessage(data._id, data)
          .then(() => {
            enqueueSnackbar('Message modifié avec succès', {
              variant: 'success',
            });
            setOpenForm(false);
            EventEmitter.emit('REFRESH');
          })
          .catch(() => {
            enqueueSnackbar('Erreur lors de la modification', {
              variant: 'error',
            });
          })
          .finally(() => {
            modif.current = undefined;
            setSaving(false);
          });
      else
        postMessage(data)
          .then(() => {
            enqueueSnackbar('Message ajouté avec succès', {
              variant: 'success',
            });
            setOpenForm(false);
            EventEmitter.emit('REFRESH');
          })
          .catch(() => {
            enqueueSnackbar("Erreur lors de l'ajout", {
              variant: 'error',
            });
          })
          .finally(() => {
            setSaving(false);
          });
    },
    [enqueueSnackbar],
  );

  const showModification = useCallback((adminMessage: AdminMessage) => {
    const {
      _id,
      message,
      target
    } = adminMessage;

    modif.current = {
      _id,
      message,
      target,
    };
    setOpenForm(true);
  }, []);

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
      <PageHeader title="Messages" subTitle="Liste des messages pour les resto" icon={ListIcon} />
      <Paper className={classes.root}>
        <TableContainer
          headCells={headCells}
          records={records}
          selected={selected}
          onSelectedChange={setSelected}
          onDeleteClick={() => {
            setUpdating(true);
            handleDeleteSelection().finally(() => setUpdating(false));
          }}
          addButtonLabel="Poster un message"
          onAddClick={() => setOpenForm(true)}
          loading={loading}
          emptyPlaceholder="Aucun restaurant"
          options={{
            selectableRows: isAdmin,
            orderBy: 'createdAt',
            order: 'asc',
            enableDragAndDrop: false,
            hasActionsColumn: true,
            // filters: [
            //   {
            //     id: 'target',
            //     label: 'Nom',
            //     type: 'STRING',
            //   },
            // ],
            selectOnClick: false,
            onRowClick: (_, foodType) => showModification(foodType),
          }}
        >
          {(adminMessage) => {
            const {
              _id,
              message,
              target
            } = adminMessage;

            return (
              <React.Fragment key={_id}>
                <TableCell>{message}</TableCell>
                <TableCell>
                  {target.length > 0
                    ? target.map(({ _id, name, imageURL }) => (
                        <Chip
                          style={{ margin: 2 }}
                          key={_id}
                          label={name}
                          avatar={<Avatar src={imageURL} alt="name" />}
                        />
                    ))
                    : 'Tous'
                  }
                </TableCell>
                <TableCell>
                  <EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      showModification(adminMessage);
                    }}
                  />
                  {isAdmin && (
                    <DeleteButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setUpdating(true);
                        handleDelete(_id)
                          .then(() =>
                            setRecords((v) =>
                              v.filter(({ _id: id }) => _id !== id),
                            ),
                          )
                          .finally(() => setUpdating(false));
                      }}
                    />
                  )}
                </TableCell>
              </React.Fragment>
            );
          }}
        </TableContainer>
      </Paper>
      <FormDialog
        title={modif.current ? 'Modifier un message' : 'Poster un message'}
        onClose={() => setOpenForm(false)}
        open={openForm}
      >
        <AdminMessageForm
          initialValues={modif.current}
          saving={saving}
          onSave={saveData}
          onCancel={() => setOpenForm(false)}
        />
      </FormDialog>

      <Loading
        open={updating}
        semiTransparent
        backgroundColor="rgba(0, 0, 0, .7)"
      />
    </>
  );
};

export default AdminMessageList;
