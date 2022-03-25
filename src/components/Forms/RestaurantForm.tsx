import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  capitalize,
  CircularProgress,
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { useCallback, useEffect, useState } from 'react';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import Category from '../../models/Category.model';
// import FoodType from '../../models/FoodType.model';
import { getCategories } from '../../services/categories';
// import { getFoodTypes } from '../../services/foodTypes';
import IOSSwitch from '../Common/IOSSwitch';
import { DropzoneArea } from 'material-ui-dropzone';
import {
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationOnIcon,
} from '@material-ui/icons';
import { KeyboardTimePicker } from '@material-ui/pickers';
import moment from 'moment';
import 'moment/locale/fr';
import FormValidation from '../../utils/FormValidation';
import User from '../../models/User.model';
import { getUsers, getUsersById } from '../../services/user';
import { getGeoLocation } from '../../utils/location';
import { useSnackbar } from 'notistack';
import { daysOfWeek } from '../../constants/days';
import AddressInput from '../Common/AddressInput';
import { geocodeByAddress, getLatLng, geocodeByPlaceId } from 'react-places-autocomplete';
import { useAuth } from '../../providers/authentication';

moment.locale('fr');

type OpeningTime = {
  activated: boolean;
  openings: {
    begin: {
      hour: string;
      minute: string;
    };
    end: {
      hour: string;
      minute: string;
    };
  }[];
};

export type RestaurantFormType = {
  _id?: string;
  name: string;
  address: string;
  phoneNumber: string;
  fixedLinePhoneNumber: string;
  categories: string[];
  city: string;
  postalCode: string;
  description: string;
  foodTypes: string[];
  delivery: boolean;
  surPlace: boolean;
  aEmporter: boolean;
  referencement: boolean;
  status: boolean;
  paiementLivraison: boolean;
  deliveryPrice: string;
  longitude: string;
  latitude: string;
  openingTimes: Map<string, OpeningTime>;
  admin: string;
  priority?: number;
  image?: File;
  imageURL?: string;
  customerStripeKey: string;
  customerSectretStripeKey: string;
  paiementCB: boolean;
  cbDirectToAdvisor: boolean;
  isMenuActive: boolean;
  isBoissonActive: boolean;
  discount: string;
};

interface RestaurantFormProps {
  modification?: boolean;
  initialValues?: RestaurantFormType;
  saving?: boolean;
  onSave?: (data: RestaurantFormType) => void;
  onCancel?: () => void;
}

const useStyles = makeStyles(() => ({
  dropzone: {
    height: '100%',
  },
  marginTop: {
    marginTop: '20px'
  }
}));

const RestaurantForm: React.FC<RestaurantFormProps> = ({
  initialValues = {
    name: '',
    address: '',
    phoneNumber: '',
    fixedLinePhoneNumber: '',
    categories: [],
    city: '',
    postalCode: '',
    description: '',
    foodTypes: [],
    delivery: false,
    surPlace: true,
    aEmporter: true,
    referencement: true,
    status: true,
    paiementLivraison: true,
    deliveryPrice: '0',
    longitude: '',
    latitude: '',
    admin: '',
    customerStripeKey: '',
    customerSectretStripeKey: '',
    paiementCB: false,
    cbDirectToAdvisor: true,
    isMenuActive: true,
    isBoissonActive: true,
    openingTimes: new Map(
      daysOfWeek.map((day) => [
        day,
        {
          activated: true,
          openings: [
            {
              begin: { hour: '06', minute: '00' },
              end: { hour: '12', minute: '00' },
            },
            {
              begin: { hour: '13', minute: '00' },
              end: { hour: '20', minute: '00' },
            },
          ],
        },
      ]),
    ),
    discount: '0'
  },
  saving,
  modification,
  onSave,
  onCancel,
}) => {
  const { isAdmin, isRestaurantAdmin, user } = useAuth();

  const validation = useCallback<FormValidationHandler<RestaurantFormType>>(
    (data) => {
      const errors: FormError<RestaurantFormType> = {};

      if (!data.name.length) errors.name = 'Ce champ ne doit pas être vide';
      if (!data.description.length)
        errors.description = 'Ce champ ne doit pas être vide';
      if (!data.address.length)
        errors.address = 'Ce champ ne doit pas être vide';
      if (!data.categories.length)
        errors.categories = 'Vous devez au moins ajouter une catégorie';
      // if (!data.foodTypes.length)
      //   errors.foodTypes = 'Vous devez au moins ajouter un type';
      if (!data.phoneNumber.length)
        errors.phoneNumber = 'Ce champ ne doit pas être vide';
      else if (!FormValidation.isPhoneNumber(data.phoneNumber))
        errors.phoneNumber = 'Téléphone non valide';
      if (!data.city.length) errors.city = 'Ce champ ne doit pas être vide';
      if (!data?.postalCode?.length) errors.postalCode = 'Ce champ ne doit pas être vide';
      if (!data.admin.length) errors.admin = 'Ce champ ne doit pas être vide';
      if (data.delivery && data.paiementCB && !data.cbDirectToAdvisor && !data.customerStripeKey.length)
        errors.customerStripeKey = 'Ce champ ne doit pas être vide';
      if (data.delivery && data.paiementCB && !data.cbDirectToAdvisor && !data.customerSectretStripeKey.length)
        errors.customerSectretStripeKey = 'Ce champ ne doit pas être vide';
      return errors;
    },
    [],
  );

  const {
    values,
    setValues,
    handleInputBlur,
    handleInputChange,
    handleSwitchChange,
    validate,
    errors,
  } = useForm<RestaurantFormType>(
    {
      ...initialValues,
      admin: isRestaurantAdmin && user ? user._id : initialValues.admin,
    },
    false,
    validation,
  );

  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

  // const [typeOptions, setTypeOptions] = useState<FoodType[]>([]);
  // const [loadingTypes, setLoadingTypes] = useState<boolean>(false);

  const [userOptions, setUserOptions] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  const [openingTimes, setOpeningTimes] = useState<Map<string, OpeningTime>>(
    initialValues.openingTimes,
  );

  const [isDelivery, setIsDelivery] = useState<boolean>(values.delivery);
  const [isCB, setIsCB] = useState<boolean>(values.paiementCB);
  const [isDirectToAdvisor, setIsDirectToAdvisor] = useState<boolean>(values.cbDirectToAdvisor);

  const [existAdmin, setExistAdmin] = useState<any>(null);

  const isDayActivated = useCallback(
    (day: string) => !!openingTimes.get(day)?.activated,
    [openingTimes],
  );

  const getOpenings = useCallback(
    (day: string) => (openingTimes.get(day) as OpeningTime).openings,
    [openingTimes],
  );

  const getOpeningTime = useCallback(
    (day: string) => openingTimes.get(day) as OpeningTime,
    [openingTimes],
  );

  const applyToAll = useCallback(
    (day: string) => {
      setOpeningTimes((values) => {
        const openingTime = getOpeningTime(day);
        daysOfWeek.forEach((d) => {
          if (d !== day) values.set(d, { ...openingTime });
        });

        return new Map(values);
      });
    },
    [getOpeningTime],
  );

  const applyToNext = useCallback(
    (day: string) => {
      setOpeningTimes((values) => {
        const openingTimes = getOpeningTime(day),
          index = daysOfWeek.indexOf(day),
          nextDay = daysOfWeek[index + 1];

        nextDay && values.set(nextDay, { ...openingTimes });

        return new Map(values);
      });
    },
    [getOpeningTime],
  );

  const classes = useStyles();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoadingCategories(true);
    getCategories()
      .then((data) => setCategoryOptions(data))
      .finally(() => setLoadingCategories(false));

    // setLoadingTypes(true);
    // getFoodTypes()
    //   .then((data) => setTypeOptions(data))
    //   .finally(() => setLoadingTypes(false));

    setLoadingUsers(true);
    getUsers({ role: 'ROLE_RESTAURANT_ADMIN', alreadyRestaurantAdmin: false })
      .then((data) => {
        setUserOptions(data)
      })
      .finally(() => setLoadingUsers(false));

    getUsersById(values.admin)
      .then((data: any) => {
        setExistAdmin(data._doc);
      })
  }, [values.admin]);

  useEffect(() => {
    if (errors.image) {
      enqueueSnackbar('Veuillez ajouter une image', {
        variant: 'warning',
      });
    }
  }, [enqueueSnackbar, errors]);

  const onChangeAddress = async (data: any) => {
    const results = await geocodeByAddress(data.description);
    const { lng, lat } = await getLatLng(results[0]);
    const [place] = await geocodeByPlaceId(data.placeId);
    const address = place.formatted_address;
    const { long_name: postalCode = '' } =
      place.address_components.find(c => c.types.includes('postal_code')) || {};
    const { long_name: city = '' } =
      place.address_components.find(c => c.types.includes('locality')) || {};

    setValues((values) => ({
      ...values,
      address,
      city,
      postalCode,
      latitude: String(lat),
      longitude: String(lng),
    }))
  }

  const handleSwitchDelivery = (e: any) => {
    const { name, checked } = e.target;

    if (name === 'delivery') {
      setIsDelivery(checked);
    }

    if (name === 'paiementCB') {
      setIsCB(checked);
    }

    if (name === 'cbDirectToAdvisor') {
      setIsDirectToAdvisor(checked)
    }

    setValues((values) => ({
      ...values,
      [name]: checked
    }));
  }

  return (
    <form
      noValidate
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        (
          e.currentTarget.querySelector('[type=submit]') as HTMLInputElement
        ).focus();
        if (validate()) onSave?.({ ...values, openingTimes });
      }}
    >
      <Grid container spacing={2} justify="center">
        <Grid item xs={12}>
          <Typography variant="h4" style={{ fontWeight: 'bold' }} gutterBottom>
            Général
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Nom
          </Typography>
          <TextField
            name="name"
            placeholder="Nom"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.name}
            error={!!errors.name}
            helperText={errors.name}
            onBlur={handleInputBlur}
            required
          />
          <Box height={theme.spacing(2)} />
          <Typography variant="h5" gutterBottom>
            Adresse
          </Typography>
          <AddressInput
            defaultValue={initialValues.address}
            error={!!errors.address}
            helperText={errors.address}
            onChange={onChangeAddress}
          />
          <Box height={theme.spacing(2)} />
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Localisation
              </Typography>
            </Grid>
            <Grid item xs>
              <TextField
                name="longitude"
                type="number"
                placeholder="Longitude"
                variant="outlined"
                fullWidth
                value={values.longitude}
                error={!!errors.longitude}
                helperText={errors.longitude}
                disabled
              />
            </Grid>
            <Grid item xs>
              <TextField
                name="latitude"
                type="number"
                placeholder="Latitude"
                variant="outlined"
                fullWidth
                value={values.latitude}
                error={!!errors.latitude}
                helperText={errors.latitude}
                disabled
              />
            </Grid>
            <Grid item>
              <Tooltip title="Utiliser votre position actuelle">
                <IconButton
                  onClick={() => {
                    getGeoLocation()
                      .then((position) => {
                        setValues((values) => {
                          values.longitude = `${position.coords.longitude}`;
                          values.latitude = `${position.coords.latitude}`;
                          return { ...values };
                        });
                      })
                      .catch(() => {
                        enqueueSnackbar('Erreur lors la localisation', {
                          variant: 'error',
                        });
                      });
                  }}
                >
                  <LocationOnIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          <Typography variant="h5" gutterBottom>
            Image de courverture
          </Typography>
          <DropzoneArea
            inputProps={{
              name: 'image',
            }}
            previewGridProps={{
              container: { spacing: 2, justify: 'center' },
            }}
            dropzoneText="Image de couverture"
            acceptedFiles={['image/*']}
            filesLimit={1}
            classes={{ root: classes.dropzone }}
            getFileAddedMessage={() => 'Fichier ajouté'}
            getFileRemovedMessage={() => 'Fichier enlevé'}
            onChange={(files) => {
              if (files.length) setValues((v) => ({ ...v, image: files[0] }));
            }}
            initialFiles={[initialValues.imageURL ?? ""]}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Ville
          </Typography>
          <TextField
            name="city"
            placeholder="Ville"
            variant="outlined"
            fullWidth
            value={values.city}
            error={!!errors.city}
            helperText={errors.city}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Code Postal
          </Typography>
          <TextField
            name="postalCode"
            placeholder="Code Postal"
            variant="outlined"
            fullWidth
            value={values.postalCode}
            error={!!errors.postalCode}
            helperText={errors.postalCode}
            onChange={handleInputChange}
            required
          />
        </Grid>
        {isAdmin && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Administrateur
            </Typography>
            <Autocomplete
              loadingText="Chargement"
              noOptionsText="Aucun utilisateur trouvé"
              loading={loadingUsers}
              filterSelectedOptions
              options={userOptions}
              value={
                userOptions.find(({ _id }) => _id === values.admin) || existAdmin || null
              }
              onChange={(_, v) => {
                if (v)
                  setValues((old) => {
                    old.admin = v._id;
                    return { ...old };
                  });
              }}
              getOptionLabel={(option) =>
                option.name.first || option.name.last
                  ? `${option.name.first} ${option.name.last}`
                  : `Aucun nom - ${option.phoneNumber}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Administrateur"
                  error={!!errors.admin}
                  helperText={errors.admin}
                />
              )}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Mobile
          </Typography>
          <TextField
            type="tel"
            name="phoneNumber"
            placeholder="Mobile"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.phoneNumber}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            onBlur={handleInputBlur}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Téléphone fixe
          </Typography>
          <TextField
            type="tel"
            name="fixedLinePhoneNumber"
            placeholder="Téléphone fixe"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.fixedLinePhoneNumber}
            error={!!errors.fixedLinePhoneNumber}
            helperText={errors.fixedLinePhoneNumber}
            onBlur={handleInputBlur}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Description
          </Typography>
          <TextField
            name="description"
            placeholder="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={6}
            defaultValue={initialValues.description}
            error={!!errors.description}
            helperText={errors.description}
            onBlur={handleInputBlur}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Catégories
          </Typography>
          <Autocomplete
            loadingText="Chargement"
            noOptionsText="Aucune catégorie disponible"
            multiple
            disableCloseOnSelect
            loading={loadingCategories}
            filterSelectedOptions
            options={categoryOptions}
            value={categoryOptions.filter(
              ({ _id }) => !!values.categories.find((d) => _id === d),
            )}
            onChange={(_, v) => {
              setValues((old) => {
                old.categories = v.map(({ _id }) => _id);
                return { ...old };
              });
            }}
            getOptionLabel={(option) => option.name.fr}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Catégories"
                error={!!errors.categories}
                helperText={errors.categories}
              />
            )}
          />
        </Grid>
        {/* <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Types de plats
          </Typography>
          <Autocomplete
            loadingText="Chargement"
            noOptionsText="Aucun type disponible"
            multiple
            disableCloseOnSelect
            loading={loadingTypes}
            filterSelectedOptions
            options={typeOptions}
            value={typeOptions.filter(
              ({ _id }) => !!values.foodTypes.find((d) => _id === d),
            )}
            onChange={(_, v) => {
              setValues((old) => {
                old.foodTypes = v.map(({ _id }) => _id);
                return { ...old };
              });
            }}
            getOptionLabel={(option) => option.name.fr}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Types de plats"
                error={!!errors.foodTypes}
                helperText={errors.foodTypes}
              />
            )}
          />
        </Grid> */}
        <Grid item xs={12}>
          <Box height={theme.spacing(6)} />
          <Typography variant="h4" style={{ fontWeight: 'bold' }} gutterBottom>
            Paramètres du restaurant
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">Heures d'ouvertures</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List style={{ width: '100%' }}>
                {daysOfWeek.map((day, i) => (
                  <React.Fragment key={day}>
                    <ListItem button>
                      <ListItemIcon>
                        <IOSSwitch
                          onClick={(e) => e.stopPropagation()}
                          checked={isDayActivated(day)}
                          onChange={(_, checked) =>
                            setOpeningTimes((values) => {
                              getOpeningTime(day).activated = checked;
                              return new Map(values);
                            })
                          }
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${capitalize(day)} - ${getOpeningTime(day).activated ? 'Ouvert' : 'Fermé'
                          }`}
                        secondary={
                          <>
                            <span
                              style={{
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                outline: 'none',
                                padding: 0,
                                border: 'none',
                                color: theme.palette.primary.main,
                                textDecoration: 'underline',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                applyToAll(day);
                              }}
                            >
                              Appliquer à tous
                            </span>
                            <span style={{ margin: theme.spacing(0, 1) }}>
                              -
                            </span>
                            <span
                              style={{
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                outline: 'none',
                                padding: 0,
                                border: 'none',
                                color: theme.palette.primary.main,
                                textDecoration: 'underline',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                applyToNext(day);
                              }}
                            >
                              Appliquer au suivant
                            </span>
                          </>
                        }
                      />
                    </ListItem>
                    <Collapse in={getOpeningTime(day).activated}>
                      <Box padding={theme.spacing(1, 3)}>
                        <Grid container spacing={1}>
                          {getOpenings(day).map((openingTime, i, a) => {
                            const {
                              begin: { hour: bh, minute: bm },
                              end: { hour: eh, minute: em },
                            } = openingTime;

                            return (
                              <Grid
                                key={i}
                                item
                                container
                                xs
                                alignItems="center"
                                justify="center"
                              >
                                <span>
                                  {i === 0 ? 'Matinée: ' : 'Après-midi: '}
                                </span>

                                <Box width={theme.spacing(1)} />

                                <span>De</span>

                                <Box width={theme.spacing(1)} />

                                <KeyboardTimePicker
                                  ampm={false}
                                  margin="none"
                                  inputVariant="outlined"
                                  style={{ width: 130 }}
                                  value={moment(`2020-01-01 ${bh}:${bm}`)}
                                  onChange={(date) => {
                                    openingTime.begin = {
                                      hour: (date as moment.Moment).format(
                                        'HH',
                                      ),
                                      minute: (date as moment.Moment).format(
                                        'mm',
                                      ),
                                    };
                                    setOpeningTimes((v) => new Map(v));
                                  }}
                                />

                                <Box width={theme.spacing(1)} />

                                <span>à</span>

                                <Box width={theme.spacing(1)} />

                                <KeyboardTimePicker
                                  ampm={false}
                                  margin="none"
                                  inputVariant="outlined"
                                  style={{ width: 130 }}
                                  value={moment(`2020-01-01 ${eh}:${em}`)}
                                  onChange={(date) => {
                                    openingTime.end = {
                                      hour: (date as moment.Moment).format(
                                        'HH',
                                      ),
                                      minute: (date as moment.Moment).format(
                                        'mm',
                                      ),
                                    };
                                    setOpeningTimes((v) => new Map(v));
                                  }}
                                />
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    </Collapse>
                    {i < 6 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <IOSSwitch
                defaultChecked={initialValues.delivery}
                onChange={handleSwitchDelivery}
                name="delivery"
              />
            }
            label="Livraison"
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <IOSSwitch
                defaultChecked={initialValues.surPlace}
                onChange={handleSwitchChange}
                name="surPlace"
              />
            }
            label="Sur place"
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <IOSSwitch
                defaultChecked={initialValues.aEmporter}
                onChange={handleSwitchChange}
                name="aEmporter"
              />
            }
            label="À emporter"
          />
        </Grid>
        {
          isDelivery && (
            <Grid container spacing={2} justify="center" className={classes.marginTop}>
              <Grid item>
                <FormControlLabel
                  control={
                    <IOSSwitch
                      defaultChecked={values.paiementCB}
                      onChange={handleSwitchDelivery}
                      name="paiementCB"
                    />
                  }
                  label="Paiement par CB"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <IOSSwitch
                      defaultChecked={values.paiementLivraison}
                      onChange={handleSwitchChange}
                      name="paiementLivraison"
                    />
                  }
                  label="Paiement à la livraison"
                />
              </Grid>
            </Grid>
          )}
        {
          (isAdmin && isCB && isDelivery) && (
            <Grid item className={classes.marginTop}>
              <FormControlLabel
                control={
                  <IOSSwitch
                    defaultChecked={values.cbDirectToAdvisor}
                    onChange={handleSwitchDelivery}
                    name="cbDirectToAdvisor"
                  />
                }
                label="Paiement directement a MENU ADVISOR"
              />
            </Grid>
          )}
        {
          (isAdmin && isDelivery && isCB && !isDirectToAdvisor) && (
            <Grid container>
              <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    Clé stripe public du restaurateur
                  </Typography>
                  <TextField
                    name="customerStripeKey"
                    placeholder="Clé stripe public du restaurateur"
                    variant="outlined"
                    fullWidth
                    defaultValue={initialValues.customerStripeKey}
                    error={!!errors.customerStripeKey}
                    helperText={errors.customerStripeKey}
                    onBlur={handleInputBlur}
                    required
                  />
              </Grid>
              <Grid item xs={12} className={classes.marginTop}>
                <Typography variant="h5" gutterBottom>
                  Clé stripe privé du restaurateur
                </Typography>
                <TextField
                  name="customerSectretStripeKey"
                  placeholder="Clé stripe privé du restaurateur"
                  variant="outlined"
                  fullWidth
                  defaultValue={initialValues.customerSectretStripeKey}
                  error={!!errors.customerSectretStripeKey}
                  helperText={errors.customerSectretStripeKey}
                  onBlur={handleInputBlur}
                  required
                />
              </Grid>
            </Grid>
            
          )
        }

        <Grid item className={classes.marginTop}>
          <FormControlLabel
            control={
              <IOSSwitch
                defaultChecked={initialValues.isMenuActive}
                onChange={handleSwitchChange}
                name="isMenuActive"
              />
            }
            label="Activer le menu"
          />
        </Grid>

        <Grid item className={classes.marginTop}>
          <FormControlLabel
            control={
              <IOSSwitch
                defaultChecked={initialValues.isBoissonActive}
                onChange={handleSwitchChange}
                name="isBoissonActive"
              />
            }
            label="Activer la boisson"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Prix de livraison
          </Typography>
          <TextField
            name="deliveryPrice"
            type="number"
            placeholder="Prix de livraison"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">€</InputAdornment>
              ),
            }}
            variant="outlined"
            fullWidth
            defaultValue={initialValues.deliveryPrice}
            error={!!errors.deliveryPrice}
            helperText={errors.deliveryPrice}
            onBlur={handleInputBlur}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Remise
          </Typography>
          <TextField
            name="discount"
            type="number"
            placeholder="Remise"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">%</InputAdornment>
              ),
            }}
            variant="outlined"
            fullWidth
            defaultValue={initialValues.discount}
            error={!!errors.discount}
            helperText={errors.discount}
            onBlur={handleInputBlur}
          />
        </Grid>

        <Grid item container justify="flex-end" alignItems="center" xs={12}>
          <Button
            variant="contained"
            color="default"
            disabled={saving}
            size="large"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Box width={theme.spacing(2)} />
          <Button
            variant="contained"
            color="primary"
            size="large"
            type="submit"
          >
            {!saving ? (
              'Enregistrer'
            ) : (
              <CircularProgress color="inherit" size="25.45px" />
            )}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default RestaurantForm;
