import React, { useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles, Paper, TableCell } from '@material-ui/core';
import { MenuBook as MenuBookIcon } from '@material-ui/icons';
import PageHeader from '../components/Admin/PageHeader';
import Menu from '../models/Menu.model';
import { useSnackbar } from 'notistack';
import { addMenu, deleteMenu, getMenus, updateMenu } from '../services/menu';
import EventEmitter from '../services/EventEmitter';
import useDeleteSelection from '../hooks/useDeleteSelection';
import FormDialog from '../components/Common/FormDialog';
import MenuForm, { MenuFormType } from '../components/Forms/MenuForm';
import EditButton from '../components/Common/EditButton';
import DeleteButton from '../components/Common/DeleteButton';
import useDelete from '../hooks/useDelete';
import { useAuth } from '../providers/authentication';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import { Loading } from '../components/Common';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<Menu>[] = [
  {
    id: 'name',
    label: 'Nom',
    disableSorting: true,
  },
  {
    id: 'description',
    label: 'Description',
    disableSorting: true,
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    disableSorting: true,
  },
];

const MenuListPage: React.FC = () => {
  const classes = useStyles();
  const { isRestaurantAdmin, restaurant } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<Menu[]>([]);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const modif = useRef<MenuFormType>();

  const { enqueueSnackbar } = useSnackbar();
  const { handleDeleteSelection } = useDeleteSelection(deleteMenu, selected, {
    onDeleteRecord: (id) =>
      setRecords((v) => v.filter(({ _id }) => _id !== id)),
  });
  const { handleDelete } = useDelete(deleteMenu);

  const fetch = useCallback(() => {
    setLoading(true);
    setRecords([]);
    getMenus({
      lang: 'fr',
      restaurant: isRestaurantAdmin ? restaurant?._id || '' : undefined,
    })
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
  }, [enqueueSnackbar, isRestaurantAdmin, restaurant?._id]);

  const saveData = useCallback(
    (data: MenuFormType) => {
      setSaving(true);
      if (modif.current && data._id)
        updateMenu(data._id, data)
          .then(() => {
            enqueueSnackbar('Menu modifié avec succès', {
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
        addMenu(data)
          .then(() => {
            enqueueSnackbar('Menu ajouté avec succès', {
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

  const showModification = useCallback((menu: Menu) => {
    const {
      _id,
      priority,
      name,
      description,
      restaurant,
      foods,
      type,
      price: { amount: price },
    } = menu;

    modif.current = {
      _id,
      price: String(price / 100),
      priority,
      name,
      description,
      foods: foods.map(({ food: { _id } }) => _id),
      prices: foods.map(({ additionalPrice }) =>
        String(additionalPrice.amount / 100),
      ),
      restaurant: restaurant?._id || '',
      type,
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
        title="Menus"
        subTitle="Liste des menus"
        icon={MenuBookIcon}
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
          addButtonLabel="Ajouter un menu"
          onAddClick={() => setOpenForm(true)}
          loading={loading}
          emptyPlaceholder="Aucun menu"
          options={{
            orderBy: 'priority',
            hasActionsColumn: true,
            enableDragAndDrop: true,
            filters: [
              {
                id: 'name',
                label: 'Nom',
                type: 'STRING',
              },
              {
                id: 'priority',
                label: 'Priorité',
                type: 'NUMBER',
              },
              {
                id: 'restaurant',
                label: 'Restaurant',
                type: 'RESTAURANT',
                alwaysOn: isRestaurantAdmin ? false : true,
              },
            ],
            selectOnClick: false,
            onRowClick: (_, menu) => showModification(menu),
            onDragEnd: (source, destination) =>
              setRecords((records) => {
                const p1 = source.priority,
                  p2 = destination.priority;

                if (p1 === p2) return records;

                if (p1 > p2) {
                  // Queueing up
                  records
                    .filter(({ priority }) => priority >= p2 && priority < p1)
                    .forEach((v) => {
                      v.priority++;
                      updateMenu(v._id, { priority: v.priority });
                    });
                } else {
                  // Queueing down
                  records
                    .filter(({ priority }) => priority > p1 && priority <= p2)
                    .forEach((v) => {
                      v.priority--;
                      updateMenu(v._id, { priority: v.priority });
                    });
                }
                source.priority = p2;
                updateMenu(source._id, { priority: p2 });

                return [...records];
              }),
            customComparators: {
              restaurant: (a, b) =>
                (b.restaurant?.name || '').localeCompare(
                  a.restaurant?.name || '',
                ),
            },
          }}
        >
          {(menu) => {
            const { _id, name, description, restaurant } = menu;

            return (
              <React.Fragment key={_id}>
                <TableCell>{name}</TableCell>
                <TableCell>{description}</TableCell>
                <TableCell>
                  {restaurant ? restaurant.name : 'Non associé'}
                </TableCell>
                <TableCell>
                  <EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      showModification(menu);
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
        title={modif.current ? 'Modifier un menu' : 'Ajouter un menu'}
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          modif.current = undefined;
        }}
      >
        <MenuForm
          initialValues={modif.current}
          saving={saving}
          onCancel={() => {
            setOpenForm(false);
            modif.current = undefined;
          }}
          onSave={saveData}
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

export default MenuListPage;
