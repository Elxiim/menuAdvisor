import { makeStyles, Paper, TableCell, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@material-ui/core';
import { People as PeopleIcon } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PageHeader from '../components/Admin/PageHeader';
import User from '../models/User.model';
import { addUser, deleteUser, getUsers, updateUser } from '../services/user';
import DateFormatter from '../utils/DateFormatter';
import moment from 'moment';
import RoleFormatter from '../utils/RoleFormatter';
import EventEmitter from '../services/EventEmitter';
import useDeleteSelection from '../hooks/useDeleteSelection';
import FormDialog from '../components/Common/FormDialog';
import UserForm, { UserFormType } from '../components/Forms/UserForm';
import useDelete from '../hooks/useDelete';
import EditButton from '../components/Common/EditButton';
import DeleteButton from '../components/Common/DeleteButton';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import { Loading } from '../components/Common';
import { deleteRestaurantByName } from '../services/restaurant';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<User>[] = [
  {
    id: 'name',
    label: 'Nom complet',
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
    id: 'roles',
    label: 'Rôle',
  },
  {
    id: 'resto',
    label: 'Restaurant',
  },
  {
    id: 'createdAt',
    label: "Date d'inscription",
  },
];

const UserListPage: React.FC = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<User[]>([]);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const modif = useRef<UserFormType>();

  const { enqueueSnackbar } = useSnackbar();
  const { handleDeleteSelection } = useDeleteSelection(deleteUser, selected, {
    onDeleteRecord: (id) =>
      setRecords((v) => v.filter(({ _id }) => _id !== id)),
  });
  const { handleDelete } = useDelete(deleteUser);

  const fetch = useCallback(() => {
    setLoading(true);
    setRecords([]);
    getUsers()
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
  }, [enqueueSnackbar]);

  const saveData = useCallback(
    (data: UserFormType) => {
      setSaving(true);

      if (modif.current && data._id)
        updateUser(data._id, data)
          .then(() => {
            enqueueSnackbar('Utilisateur modifié avec succès', {
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
        addUser(data)
          .then(() => {
            enqueueSnackbar('Utilisateur ajouté avec succès', {
              variant: 'success',
            });
            setOpenForm(false);
            EventEmitter.emit('REFRESH');
          })
          .catch(() => {
            enqueueSnackbar("Erreur lors de l'ajout", { variant: 'error' });
          })
          .finally(() => {
            setSaving(false);
          });
    },
    [enqueueSnackbar],
  );

  const showModification = useCallback((user: User) => {
    const { _id, name, email, phoneNumber, roles } = user;

    modif.current = {
      _id,
      email,
      phoneNumber,
      role: roles[0] || '',
      firstname: name.first,
      lastname: name.last,
      password: '',
      confirmPassword: '',
    };
    setOpenForm(true);
  }, []);

  const [showRemoveResto, setShowRemoveResto] = useState({
    show: false,
    id: '',
    resto: '',
    loading: false,
  });

  const removeRestoAndUser = useCallback(
    () => {
      if (showRemoveResto.id) {
        setShowRemoveResto((s) => ({...s, loading: true}))
        deleteRestaurantByName(showRemoveResto.resto)
          .then(() => {
            handleDelete(showRemoveResto.id)
              .then(() =>
                setRecords((v) =>
                  v.filter(({ _id: id }) => showRemoveResto.id !== id),
                ),
              )
          })
          .finally(() => setShowRemoveResto({show: false, id: '', resto: '', loading: false}))
      }
    }, [handleDelete, showRemoveResto.id, showRemoveResto.resto]
  )

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
        title="Utilisateurs"
        subTitle="Liste des utilisateurs"
        icon={PeopleIcon}
      />
      <Paper className={classes.root}>
        <TableContainer
          records={records}
          onDeleteClick={() => {
            setUpdating(true);
            handleDeleteSelection().finally(() => setUpdating(false));
          }}
          addButtonLabel="Ajouter un utilisateur"
          onAddClick={() => setOpenForm(true)}
          loading={loading}
          emptyPlaceholder="Aucun utilisateur"
          headCells={headCells}
          selected={selected}
          onSelectedChange={(selected) => setSelected(selected)}
          options={{
            orderBy: 'name',
            hasActionsColumn: true,
            customResolvers: {
              name: (u) => `${u.name.last} ${u.name.first}`,
            },
            filters: [
              {
                id: 'roles',
                label: 'Rôle',
                type: 'STRING',
              },
              {
                id: 'email',
                label: 'Email',
                type: 'STRING',
              },
              {
                id: 'name',
                label: 'Nom',
                type: 'STRING',
              },
              {
                id: 'phoneNumber',
                label: 'Numéro téléphone',
                type: 'STRING',
              },
            ],
            customComparators: {
              name: (a, b) =>
                `${b.name.last} ${b.name.first}`.localeCompare(
                  `${a.name.last} ${a.name.first}`,
                ),
              createdAt: (a, b) =>
                moment(a.createdAt).diff(b.createdAt, 'days'),
              roles: (a, b) => RoleFormatter.compare(a.roles, b.roles),
            },
            selectOnClick: false,
            onRowClick: (_, user) => showModification(user),
          }}
        >
          {(user) => {
            const { _id, name, email, phoneNumber, roles, createdAt, resto } = user;

            return (
              <React.Fragment key={_id}>
                <TableCell>
                  {name.last || name.first ? (
                    `${name.last} ${name.first}`
                  ) : (
                    <b>Aucun nom</b>
                  )}
                </TableCell>
                <TableCell>{email}</TableCell>
                <TableCell>{phoneNumber}</TableCell>
                <TableCell>{RoleFormatter.format(roles)}</TableCell>
                <TableCell>{resto}</TableCell>
                <TableCell>{DateFormatter.format(createdAt)}</TableCell>
                <TableCell>
                  <EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      showModification(user);
                    }}
                  />
                  <DeleteButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (resto) {
                        setShowRemoveResto((s) => ({...s, show: true, id: _id, resto: resto}));
                      } else {
                        setUpdating(true);
                        handleDelete(_id)
                          .then(() =>
                            setRecords((v) =>
                              v.filter(({ _id: id }) => _id !== id),
                            ),
                          )
                          .finally(() => setUpdating(false));
                      }
                    }}
                  />
                </TableCell>
              </React.Fragment>
            );
          }}
        </TableContainer>
      </Paper>
      <Dialog onClose={() => setShowRemoveResto((s) => ({...s, show: false, id: '', resto: ''}))} aria-labelledby="simple-dialog-title" open={showRemoveResto.show}>
        <DialogTitle id="simple-dialog-title">Attention</DialogTitle>
        <DialogContent>
          Cet utilisateur est rattaché à un Restaurant
          Voulez-vous supprimer le restaurant et l'utilisateur ?
        </DialogContent>

        <DialogActions>
          <Button variant="text" onClick={() => setShowRemoveResto((s) => ({...s, show: false, id: '', resto: ''}))}>Annuler</Button>
          <Button variant="contained" color={'primary'} disabled={showRemoveResto.loading} onClick={() => removeRestoAndUser()}>Supprimer</Button>
        </DialogActions>
      </Dialog>
      <FormDialog
        open={openForm}
        onClose={() => {
          modif.current = undefined;
          setOpenForm(false);
        }}
        title={
          modif.current ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'
        }
      >
        <UserForm
          modification={!!modif.current}
          initialValues={modif.current}
          saving={saving}
          onSave={saveData}
          onCancel={() => {
            modif.current = undefined;
            setOpenForm(false);
          }}
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

export default UserListPage;
