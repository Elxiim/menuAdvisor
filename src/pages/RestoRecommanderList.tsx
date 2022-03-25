import React, { useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles, Paper, TableCell } from '@material-ui/core';
import PageHeader from '../components/Admin/PageHeader';
import { List as ListIcon } from '@material-ui/icons';
import RestoRecommander from '../models/RestoRecommander.model';
import {
  addRestoRecommander,
  deleteRestoRecommander,
  getRestoRecommandeds,
  updateRestoRecommander,
} from '../services/restoRecommander';
import { useSnackbar } from 'notistack';
import EventEmitter from '../services/EventEmitter';
import useDeleteSelection from '../hooks/useDeleteSelection';
import FormDialog from '../components/Common/FormDialog';
import RestoRecommanderForm, {
  RestoRecommandedFormType,
} from '../components/Forms/RestoRecommanderForm';
import EditButton from '../components/Common/EditButton';
import DeleteButton from '../components/Common/DeleteButton';
import useDelete from '../hooks/useDelete';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import { Loading } from '../components/Common';
import { useAuth } from '../providers/authentication';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<RestoRecommander>[] = [
  {
    id: 'restaurant',
    label: 'Restaurant',
    disableSorting: true,
  },
];

const RestoRecommanderListPage: React.FC = () => {
  const classes = useStyles();

  const { isAdmin, isRestaurantAdmin, restaurant } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<RestoRecommander[]>([]);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const modif = useRef<RestoRecommandedFormType>();

  const { enqueueSnackbar } = useSnackbar();
  const { handleDeleteSelection } = useDeleteSelection(
    deleteRestoRecommander,
    selected,
    {
      onDeleteRecord: (id) =>
        setRecords((v) => v.filter(({ _id }) => _id !== id)),
    },
  );
  const { handleDelete } = useDelete(deleteRestoRecommander);

  const fetch = useCallback(() => {
    setLoading(true);
    setRecords([]);
    const filter = (isRestaurantAdmin && restaurant) ? {restaurant: restaurant._id} : undefined
    getRestoRecommandeds(filter)
      .then((data) => {
        setRecords(data);
      })
      .catch(() => {
        enqueueSnackbar('Erreur lors du chargement...', { variant: 'error' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [enqueueSnackbar, isRestaurantAdmin, restaurant]);

  const saveData = useCallback(
    (data: RestoRecommandedFormType) => {
      setSaving(true);
      if (modif.current && data._id)
      updateRestoRecommander(data._id, data)
          .then(async () => {
            enqueueSnackbar('Type modifié avec succès', {
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
      addRestoRecommander(data)
          .then(async (res) => {
            enqueueSnackbar('Type ajouté avec succès', {
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
            modif.current = undefined;
            setSaving(false);
          });
    },
    [enqueueSnackbar],
  );

  const showModification = useCallback((foodType: RestoRecommander) => {
    const {
      _id,
      priority,
      restaurant
    } = foodType;

    modif.current = {
      _id,
      priority,
      restaurant,
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
      <PageHeader title="Types" subTitle="Liste des types" icon={ListIcon} />
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
          addButtonLabel="Recommander un restaurant"
          onAddClick={() => setOpenForm(true)}
          loading={loading}
          emptyPlaceholder="Aucune recommandation"
          options={{
            selectableRows: isAdmin,
            orderBy: 'priority',
            order: 'asc',
            enableDragAndDrop: true,
            hasActionsColumn: true,
            filters: [
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
                      updateRestoRecommander(v._id, { priority: v.priority });
                    });
                } else {
                  // Queueing down
                  records
                    .filter(({ priority }) => priority > p1 && priority <= p2)
                    .forEach((v) => {
                      v.priority--;
                      updateRestoRecommander(v._id, { priority: v.priority });
                    });
                }
                source.priority = p2;
                updateRestoRecommander(source._id, { priority: p2 });

                return [...records];
              }),
            selectOnClick: false,
            onRowClick: (_, foodType) => showModification(foodType),
          }}
        >
          {(foodType) => {
            const {
              _id,
              restaurant,
            } = foodType;

            return (
              <React.Fragment key={_id}>
                <TableCell>{restaurant?.name}</TableCell>
                <TableCell>
                  <EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      showModification(foodType);
                    }}
                  />
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
                </TableCell>
              </React.Fragment>
            );
          }}
        </TableContainer>
      </Paper>
      <FormDialog
        title={modif.current ? 'Modifier un type' : 'Ajouter un type'}
        onClose={() => {
          setOpenForm(false);
          if (modif) modif.current = undefined;
        }}
        open={openForm}
      >
        <RestoRecommanderForm
          initialValues={modif.current}
          isUpdate={modif.current ? true: false}
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

export default RestoRecommanderListPage;
