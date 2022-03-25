import { Avatar, Button, Chip, makeStyles, Paper, TableCell } from '@material-ui/core';
import { Restaurant as RestaurantIcon } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PageHeader from '../components/Admin/PageHeader';
import { Loading } from '../components/Common';
import DeleteButton from '../components/Common/DeleteButton';
import EditButton from '../components/Common/EditButton';
import FormDialog from '../components/Common/FormDialog';
import IOSSwitch from '../components/Common/IOSSwitch';
import RestaurantForm, {
  RestaurantFormType,
} from '../components/Forms/RestaurantForm';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import TableImageCell from '../components/Table/TableImageCell';
import { daysOfWeek } from '../constants/days';
import { web_url } from '../constants/url';
import useDelete from '../hooks/useDelete';
import useDeleteSelection from '../hooks/useDeleteSelection';
import Restaurant from '../models/Restaurant.model';
import { useAuth } from '../providers/authentication';
import EventEmitter from '../services/EventEmitter';
import {
  addRestaurant,
  deleteRestaurant,
  getRestaurants,
  updateRestaurant,
} from '../services/restaurant';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<Restaurant>[] = [
  {
    id: 'name',
    label: 'Nom',
    disableSorting: true,
  },
  {
    id: 'phoneNumber',
    label: 'Mobile',
    disableSorting: true,
  },
  {
    id: 'fixedLinePhoneNumber',
    label: 'Téléphone fixe',
    disableSorting: true,
  },
  {
    id: 'city',
    label: 'Ville',
    disableSorting: true,
  },
  {
    id: 'postalCode',
    label: 'Code postal',
    disableSorting: true,
  },
  {
    id: 'admin',
    label: 'Restaurateur',
    disableSorting: true,
  },
  {
    id: 'category',
    label: 'Catégorie(s)',
    disableSorting: true,
  },
  {
    id: 'imageURL',
    label: 'Image',
    disableSorting: true,
  },
  {
    id: 'qrcodeLink',
    label: 'Code QR',
    disableSorting: true,
  },
  {
    id: 'referencement',
    label: 'Référencement',
    alignment: 'center',
    hideOnAdmin: true,
  },
  {
    id: 'status',
    label: 'Etat',
    alignment: 'center',
    disableSorting: true,
    hideOnRestaurantAdmin: true,
  },
  {
    id: 'name',
    label: 'Page',
    alignment: 'center',
    disableSorting: true,
  },
];

const RestaurantListPage: React.FC = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<Restaurant[]>([]);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const modif = useRef<RestaurantFormType>();

  const { enqueueSnackbar } = useSnackbar();
  const { handleDelete } = useDelete(deleteRestaurant);
  const { handleDeleteSelection } = useDeleteSelection(
    deleteRestaurant,
    selected,
    {
      onDeleteRecord: (id) =>
        setRecords((v) => v.filter(({ _id }) => _id !== id)),
    },
  );

  const { isAdmin, isRestaurantAdmin, user, restaurant, refreshRestaurant } =
    useAuth();

  const fetch = useCallback(() => {
    setLoading(true);
    setRecords([]);
    getRestaurants({
      admin: isRestaurantAdmin && user ? user._id : undefined,
    })
      .then((data) => {
        setRecords(data);
      })
      .catch(() => {
        enqueueSnackbar('Erreur lors du chargement...', { variant: 'error' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [enqueueSnackbar, isRestaurantAdmin, user]);

  const saveData = useCallback(
    (data: RestaurantFormType) => {
      setSaving(true);
      if (modif.current && data._id)
        updateRestaurant(data._id, data)
          .then(() => {
            enqueueSnackbar('Restaurant modifié avec succès', {
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
        addRestaurant(data)
          .then(async () => {
            enqueueSnackbar('Restaurant ajouté avec succès', {
              variant: 'success',
            });
            await refreshRestaurant();
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
    [enqueueSnackbar, refreshRestaurant],
  );

  const showModification = useCallback((restaurant: Restaurant) => {
    const {
      _id,
      name,
      phoneNumber,
      fixedLinePhoneNumber,
      city,
      postalCode,
      admin,
      category,
      referencement,
      status,
      delivery,
      deliveryPrice,
      description,
      aEmporter,
      surPlace,
      address,
      foodTypes,
      location,
      openingTimes,
      paiementLivraison,
      priority,
      imageURL,
      paiementCB,
      cbDirectToAdvisor,
      customerStripeKey,
      customerSectretStripeKey,
      isMenuActive,
      isBoissonActive,
      discount
    } = restaurant;

    modif.current = {
      _id,
      delivery,
      aEmporter,
      surPlace,
      address,
      admin: admin._id,
      categories: category.map(({ _id }) => _id),
      city,
      postalCode,
      deliveryPrice: String(deliveryPrice.amount / 100),
      description,
      foodTypes: foodTypes.map(({ _id }) => _id),
      longitude: String(location.coordinates[0]),
      latitude: String(location.coordinates[1]),
      name,
      openingTimes: new Map(
        daysOfWeek.map((d) => [
          d,
          {
            activated: openingTimes.findIndex(({ day }) => day === d) !== -1,
            openings:
              openingTimes
                .find(({ day }) => day === d)
                ?.openings.map(
                  ({
                    begin: { hour: bh, minute: bm },
                    end: { hour: eh, minute: em },
                  }) => ({
                    begin: {
                      hour: String(bh),
                      minute: String(bm),
                    },
                    end: {
                      hour: String(eh),
                      minute: String(em),
                    },
                  }),
                ) || [],
          },
        ]),
      ),
      status,
      paiementLivraison,
      phoneNumber,
      fixedLinePhoneNumber,
      referencement,
      priority,
      imageURL,
      customerStripeKey,
      customerSectretStripeKey,
      paiementCB,
      cbDirectToAdvisor,
      isMenuActive,
      isBoissonActive,
      discount
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
        title="Restaurant"
        subTitle="Liste des restaurants"
        icon={RestaurantIcon}
      />
      <Paper className={classes.root}>
        <TableContainer
          records={records}
          headCells={headCells}
          onDeleteClick={() => {
            setUpdating(true);
            handleDeleteSelection()
              .then(async () => {
                if (isRestaurantAdmin) await refreshRestaurant();
              })
              .finally(() => setUpdating(false));
          }}
          showAddButton={isAdmin || !restaurant}
          selected={selected}
          onSelectedChange={setSelected}
          addButtonLabel="Ajouter un restaurant"
          onAddClick={() => setOpenForm(true)}
          loading={loading}
          emptyPlaceholder="Aucun restaurant"
          options={{
            selectableRows: false,
            orderBy: 'priority',
            order: 'asc',
            hasActionsColumn: true,
            enableDragAndDrop: false,
            filters: [
              {
                id: 'name',
                label: 'Nom du restaurant',
                type: 'STRING',
              },
              { id: 'city', label: 'Ville', type: 'STRING' },
              { id: 'postalCode', label: 'Code postal', type: 'STRING' },
              { id: 'phoneNumber', label: 'Mobile', type: 'STRING' },
              { id: 'fixedLinePhoneNumber', label: 'Téléphone fixe', type: 'STRING' },
              { id: 'category', label: 'Catégorie', type: 'CATEGORY' },
              { id: 'status', label: 'Etat', type: 'BOOLEAN' },
              { id: 'referencement', label: 'Référencement', type: 'BOOLEAN' },
            ],
            selectOnClick: false,
            onRowClick: (_, restaurant) => showModification(restaurant),
            // onDragEnd: (source, destination) =>
            //   setRecords((records) => {
            //     const p1 = source.priority,
            //       p2 = destination.priority;

            //     if (p1 === p2) return records;

            //     if (p1 > p2) {
            //       // Queueing up
            //       records
            //         .filter(({ priority }) => priority >= p2 && priority < p1)
            //         .forEach((v) => {
            //           v.priority++;
            //           updateRestaurant(v._id, { priority: v.priority });
            //         });
            //     } else {
            //       // Queueing down
            //       records
            //         .filter(({ priority }) => priority > p1 && priority <= p2)
            //         .forEach((v) => {
            //           v.priority--;
            //           updateRestaurant(v._id, { priority: v.priority });
            //         });
            //     }
            //     source.priority = p2;
            //     updateRestaurant(source._id, { priority: p2 });

            //     return [...records];
            //   }),
            customComparators: {
              admin: (a, b) =>
                `${b.admin.name.last} ${b.admin.name.first}`.localeCompare(
                  `${a.admin.name.last} ${a.admin.name.first}`,
                ),
            },
          }}
        >
          {(restaurant) => {
            const {
              _id,
              name,
              phoneNumber,
              fixedLinePhoneNumber,
              city,
              postalCode,
              admin,
              category,
              imageURL,
              qrcodeLink,
              referencement,
              status,
            } = restaurant;

            return (
              <React.Fragment key={_id}>
                <TableCell>{name}</TableCell>
                <TableCell>{phoneNumber}</TableCell>
                <TableCell>{fixedLinePhoneNumber}</TableCell>
                <TableCell>{city}</TableCell>
                <TableCell>{postalCode}</TableCell>
                <TableCell>{`${admin.name.last} ${admin.name.first}`}</TableCell>
                <TableCell>
                  {category.map(({ _id, name: { fr: name }, imageURL }) => (
                    <Chip
                      style={{ margin: 2 }}
                      key={_id}
                      label={name}
                      avatar={<Avatar src={imageURL} alt="name" />}
                    />
                  ))}
                </TableCell>
                <TableImageCell alt={name} height={80} src={imageURL} showOnClick />
                <TableImageCell alt="Code qr" src={qrcodeLink} showOnClick />
                {isRestaurantAdmin && (
                  <TableCell align="center">
                    <IOSSwitch
                      checked={referencement}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(_, c) => {
                        setUpdating(true);
                        updateRestaurant(_id, { referencement: c })
                          .then(() => {
                            restaurant.referencement = c;
                            setRecords((records) => [...records]);
                          })
                          .finally(() => setUpdating(false));
                      }}
                    />
                  </TableCell>
                )}
                {isAdmin && (
                  <TableCell align="center">
                    <IOSSwitch
                      checked={status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(_, c) => {
                        setUpdating(true);
                        updateRestaurant(_id, { status: c })
                          .then(() => {
                            restaurant.status = c;
                            setRecords((records) => [...records]);
                          })
                          .finally(() => setUpdating(false));
                      }}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Button
                    size='small'
                    color='primary'
                    variant='text'
                  >
                    <a href={`${web_url}/restaurants/${restaurant._id}`} rel='noreferrer' target='_blank' style={{ textDecoration: 'none', color: 'black' }}>Voir la page</a>
                  </Button>
                </TableCell>
                <TableCell>
                  <EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      showModification(restaurant);
                    }}
                  />
                  <DeleteButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setUpdating(true);
                      handleDelete(_id)
                        .then(async () => {
                          if (isRestaurantAdmin) await refreshRestaurant();
                          setRecords((v) =>
                            v.filter(({ _id: id }) => _id !== id),
                          );
                        })
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
        title={
          modif.current ? 'Modifier un restaurant' : 'Ajouter un restaurant'
        }
        onClose={() => {
          setOpenForm(false);
          if (modif) modif.current = undefined;
        }}
        open={openForm}
      >
        <RestaurantForm
          initialValues={modif.current}
          modification={!!modif.current}
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

export default RestaurantListPage;
