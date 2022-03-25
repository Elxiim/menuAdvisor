import { Avatar, Chip, makeStyles, Paper, TableCell } from '@material-ui/core';
import { Fastfood as FastfoodIcon, Check, Close } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PageHeader from '../components/Admin/PageHeader';
import Food from '../models/Food.model';
import { addFood, deleteFood, getFoods, updateFood } from '../services/food';
import PriceFormatter from '../utils/PriceFormatter';
import EventEmitter from '../services/EventEmitter';
import useDeleteSelection from '../hooks/useDeleteSelection';
import FormDialog from '../components/Common/FormDialog';
import FoodForm, { FoodFormType } from '../components/Forms/FoodForm';
import TableImageCell from '../components/Table/TableImageCell';
import useDelete from '../hooks/useDelete';
import EditButton from '../components/Common/EditButton';
import DeleteButton from '../components/Common/DeleteButton';
import { useAuth } from '../providers/authentication';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import { Loading } from '../components/Common';
import IOSSwitch from '../components/Common/IOSSwitch';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<Food>[] = [
  {
    id: 'name',
    label: 'Nom',
    disableSorting: true,
  },
  {
    id: 'price',
    label: 'Prix',
    disableSorting: true,
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    disableSorting: true,
  },
  {
    id: 'type',
    label: 'Type',
    disableSorting: true,
  },
  {
    id: 'attributes',
    label: 'Attributs',
    disableSorting: true,
  },
  {
    id: 'allergene',
    label: 'Allergène',
    disableSorting: true,
  },
  {
    id: 'options',
    label: 'Accompagnements',
    disableSorting: true,
  },
  {
    id: 'imageURL',
    label: 'Image',
    disableSorting: true,
  },
  {
    id: 'statut',
    label: 'Statut',
    disableSorting: true,
  },
];

const FoodListPage: React.FC = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<Food[]>([]);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const modif = useRef<FoodFormType>();

  const { restaurant, isRestaurantAdmin } = useAuth();

  const { enqueueSnackbar } = useSnackbar();
  const { handleDeleteSelection } = useDeleteSelection(deleteFood, selected, {
    onDeleteRecord: (id) =>
      setRecords((v) => v.filter(({ _id }) => _id !== id)),
  });
  const { handleDelete } = useDelete(deleteFood);

  const fetch = useCallback(() => {
    setLoading(true);
    setRecords([]);
    getFoods({
      lang: 'fr',
      restaurant: isRestaurantAdmin ? restaurant?._id || null : undefined,
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
    (data: FoodFormType) => {
      setSaving(true);
      console.log(data)
      if (modif.current && data._id)
        updateFood(data._id, data)
          .then(() => {
            enqueueSnackbar('Plat modifié avec succès', {
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
        addFood(data)
          .then(() => {
            enqueueSnackbar('Plat ajouté avec succès', {
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

  const showModification = useCallback((food: Food) => {
    const {
      _id,
      priority,
      name,
      price,
      restaurant,
      type,
      attributes,
      options,
      description,
      statut,
      imageURL,
      imageNotContractual,
      allergene,
      isAvailable
    } = food;

    modif.current = {
      _id,
      name,
      price: String((price.amount || 0) / 100),
      description: description || '',
      restaurant: restaurant?._id || '',
      attributes: attributes.map(({ _id }) => _id),
      options: options.map(({ title, maxOptions, items }) => ({
        title,
        maxOptions: String(maxOptions),
        items: items.map((v) => v),
      })),
      priority,
      statut,
      type: type._id,
      imageURL,
      imageNotContractual,
      allergene,
      isAvailable
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
        title="Plats"
        subTitle="Liste des plats"
        icon={FastfoodIcon}
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
          addButtonLabel="Ajouter un plat"
          onAddClick={() => setOpenForm(true)}
          loading={loading}
          emptyPlaceholder="Aucun plat"
          options={{
            orderBy: 'type',
            order: 'asc',
            selectableRows: false,
            hasActionsColumn: true,
            enableDragAndDrop: true,
            filters: [
              {
                id: 'restaurant',
                label: 'Restaurant',
                type: 'RESTAURANT',
                alwaysOn: isRestaurantAdmin ? false : true,
              },
              {
                id: 'name',
                label: 'Nom',
                type: 'STRING',
              },
              {
                id: 'statut',
                label: 'Status',
                type: 'BOOLEAN',
              },
              {
                id: 'attributes',
                label: 'Attributs',
                type: 'ATTRIBUTES',
              },
            ],
            selectOnClick: false,
            onRowClick: (_, food) => showModification(food),
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
                      updateFood(v._id, { priority: v.priority });
                    });
                } else {
                  // Queueing down
                  records
                    .filter(({ priority }) => priority > p1 && priority <= p2)
                    .forEach((v) => {
                      v.priority--;
                      updateFood(v._id, { priority: v.priority });
                    });
                }
                source.priority = p2;
                updateFood(source._id, { priority: p2 });

                return [...records];
              }),
            customComparators: {
              type: (a, b) => 
                  a.type.priority < b.type.priority? 1 
                    : a.type.priority > b.type.priority ? -1 : 0,
              // priority: (a, b) => 
              //     a.priority < b.priority? 1 
              //     : a.priority > b.priority ? -1 : 0,
              // price: (a, b) => 
              //   (a.price.amount || 0) < (b.price.amount || 0)
              //     ? -1
              //     : (a.price.amount || 0) > (b.price.amount || 0)
              //       ? 1
              //       : 0,
              // restaurant: (a, b) =>
              //   (b.restaurant?.name || '').localeCompare(
              //     a.restaurant?.name || '',
              //   ),
            },
          }}
        >
          {(food) => {
            const {
              _id,
              name,
              price,
              restaurant,
              type,
              attributes,
              options,
              imageURL,
              statut,
              allergene
            } = food;

            return (
              <React.Fragment key={_id}>
                <TableCell>{name}</TableCell>
                <TableCell>{PriceFormatter.format(price)}</TableCell>
                <TableCell>
                  {restaurant ? restaurant.name : 'Non associé'}
                </TableCell>
                <TableCell>{type.name}</TableCell>
                <TableCell>
                  {attributes.length
                    ? attributes.map(
                      ({ _id, imageURL, locales: { fr: name } }) => (
                        <Chip
                          key={_id}
                          avatar={<Avatar alt={name} src={imageURL} />}
                          label={name}
                          style={{ margin: 2 }}
                        />
                      ),
                    )
                    : 'Aucun attribut'}
                </TableCell>
                <TableCell>
                  {allergene ? (
                    <Check htmlColor="green" />
                  ) : (
                    <Close htmlColor="red" />
                  )}
                </TableCell>
                <TableCell>
                  {options.length
                    ? options.map(({ title }) => (
                      <Chip key={title} label={title} style={{ margin: 2 }} />
                    ))
                    : 'Aucun accompagnement'}
                </TableCell>
                <TableImageCell alt={name} src={imageURL || ''} height={80} />
                <TableCell>
                  <IOSSwitch
                    checked={statut}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(_, c) => {
                      setUpdating(true);
                      updateFood(_id, { statut: c })
                        .then(() => {
                          food.statut = c;
                          setRecords((records) => [...records]);
                        })
                        .finally(() => setUpdating(false));
                    }}
                  />
                </TableCell>
                <TableCell>
                  <EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      showModification(food);
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
        title={modif.current ? 'Modifier un plat' : 'Ajouter un plat'}
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          modif.current = undefined;
        }}
      >
        <FoodForm
          modification={!!modif.current}
          initialValues={modif.current}
          saving={saving}
          onSave={saveData}
          onCancel={() => {
            setOpenForm(false);
            modif.current = undefined;
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

export default FoodListPage;
