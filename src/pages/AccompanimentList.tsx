import { makeStyles, Paper, TableCell } from '@material-ui/core';
import { ViewModule as ViewModuleIcon } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PageHeader from '../components/Admin/PageHeader';
import { Loading } from '../components/Common';
import DeleteButton from '../components/Common/DeleteButton';
import EditButton from '../components/Common/EditButton';
import FormDialog from '../components/Common/FormDialog';
import AccompanimentForm, {
  AccompanimentFormType,
} from '../components/Forms/AccompanimentForm';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import TableImageCell from '../components/Table/TableImageCell';
import useDelete from '../hooks/useDelete';
import useDeleteSelection from '../hooks/useDeleteSelection';
import Accompaniment from '../models/Accompaniment.model';
import { useAuth } from '../providers/authentication';
import {
  addAccompaniment,
  deleteAccompaniment,
  getAccompaniments,
  updateAccompaniment,
} from '../services/accompaniments';
import EventEmitter from '../services/EventEmitter';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<Accompaniment>[] = [
  {
    id: 'name',
    label: 'Nom',
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    disableSorting: true,
  },
  {
    id: 'isObligatory',
    label: 'Obligatoire',
  },
  {
    id: 'imageURL',
    label: 'Image',
    disableSorting: true,
    alignment: 'center',
  },
];

const AccompanimentListPage: React.FC = () => {
  const classes = useStyles();

  const { isAdmin, isRestaurantAdmin, restaurant } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<Accompaniment[]>([]);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const modif = useRef<AccompanimentFormType>();

  const { enqueueSnackbar } = useSnackbar();
  const { handleDeleteSelection } = useDeleteSelection(
    deleteAccompaniment,
    selected,
    {
      onDeleteRecord: (id) =>
        setRecords((v) => v.filter(({ _id }) => _id !== id)),
    },
  );
  const { handleDelete } = useDelete(deleteAccompaniment);

  const fetch = useCallback(() => {
    setLoading(true);
    setRecords([]);
    const filter = (isRestaurantAdmin && restaurant) ? {restaurant: restaurant._id} : undefined
    getAccompaniments(filter)
      .then((data) => setRecords(data))
      .catch(() =>
        enqueueSnackbar('Erreur lors du chargement des données...', {
          variant: 'error',
        }),
      )
      .finally(() => setLoading(false));
  }, [enqueueSnackbar, isRestaurantAdmin, restaurant]);

  const saveData = useCallback(
    (data: AccompanimentFormType) => {
      setSaving(true);

      if (modif.current && data._id)
        updateAccompaniment(data._id, data)
          .then(() => {
            enqueueSnackbar('Accompagnement modifié avec succès', {
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
        addAccompaniment(data)
          .then(() => {
            enqueueSnackbar('Accompagnement ajouté avec succès', {
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

  const showModification = useCallback((accompaniment: Accompaniment) => {
    const { _id, name, price, isObligatory, priority, imageURL } = accompaniment;

    modif.current = {
      _id,
      name,
      price: String((price?.amount || 0) / 100),
      isObligatory,
      priority,
      imageURL
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
      <PageHeader
        title="Accompagnement"
        subTitle="Liste des accompagnements"
        icon={ViewModuleIcon}
      />
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
          addButtonLabel="Ajouter un accompagnement"
          onAddClick={() => setOpenForm(true)}
          loading={loading}
          emptyPlaceholder="Aucun accompagnement"
          options={{
            selectableRows: isAdmin,
            orderBy: 'priority',
            order: 'asc',
            hasActionsColumn: true,
            enableDragAndDrop: true,
            filters: [
              {
                id: 'name',
                label: 'Nom',
                type: 'STRING',
              },
              {
                id: 'restaurant',
                label: 'Restaurant',
                type: 'RESTAURANT',
                alwaysOn: isRestaurantAdmin ? false : true,
              },
            ],
            onDragEnd: (source, destination) =>
              setRecords((records) => {
                const p1 = source.priority,
                  p2 = destination.priority;

                if (p1 > p2) {
                  // Queueing up
                  records
                    .filter(({ priority }) => priority >= p2 && priority < p1)
                    .forEach((v) => {
                      v.priority++;
                      updateAccompaniment(v._id, { priority: v.priority });
                    });
                } else {
                  // Queueing down
                  records
                    .filter(({ priority }) => priority > p1 && priority <= p2)
                    .forEach((v) => {
                      v.priority--;
                      updateAccompaniment(v._id, { priority: v.priority });
                    });
                }
                source.priority = p2;
                updateAccompaniment(source._id, { priority: p2 });

                return [...records];
              }),
            // customComparators: {
            //   price: (a, b) =>
            //     (b.price?.amount || 0) < (a.price?.amount || 0)
            //       ? -1
            //       : (b.price?.amount || 0) > (a.price?.amount || 0)
            //       ? 1
            //       : 0,
            // },
            selectOnClick: false,
            onRowClick: (_, accompaniment) => showModification(accompaniment),
          }}
        >
          {(accompaniment) => {
            const { _id, name, isObligatory, imageURL, restaurant } = accompaniment;

            return (
              <React.Fragment key={_id}>
                <TableCell>{name}</TableCell>
                <TableCell>{restaurant?.name}</TableCell>
                <TableCell>
                  {isObligatory ? 'Oui' : 'Non'}
                </TableCell>
                <TableImageCell
                  height={50}
                  width={(50 * 16) / 9}
                  alt={name}
                  src={imageURL}
                  showOnClick
                />
                <TableCell>
                  <EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      showModification(accompaniment);
                    }}
                  />
                  <DeleteButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setUpdating(true);
                      handleDelete(_id)
                        .then(() =>
                          setRecords((v) =>
                            v.filter(({ _id: id }) => id !== _id),
                          ),
                        )
                        .finally(() => setUpdating(false));
                    }}
                  />
                </TableCell>
              </React.Fragment>
            );
          }}
        </TableContainer>
      </Paper>
      <FormDialog
        title="Ajouter un accompagnement"
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          modif.current = undefined;
        }}
      >
        <AccompanimentForm
          modification={!!modif.current}
          initialValues={modif.current}
          saving={saving}
          onSave={saveData}
          onCancel={() => {
            setOpenForm(false);
            modif.current = undefined;
          }}
          isUpdate={modif.current ? true : false}
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

export default AccompanimentListPage;
