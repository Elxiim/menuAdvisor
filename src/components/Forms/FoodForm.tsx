import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  makeStyles,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import { DropzoneArea } from 'material-ui-dropzone';
import FoodType from '../../models/FoodType.model';
import { getFoodTypes } from '../../services/foodTypes';
import { Autocomplete } from '@material-ui/lab';
import {
  AddCircle as AddCircleIcon,
  Close,
  ExpandMore as ExpandMoreIcon,
} from '@material-ui/icons';
import Restaurant from '../../models/Restaurant.model';
import { getRestaurants } from '../../services/restaurant';
import { addAccompaniment, getAccompaniments } from '../../services/accompaniments';
import Accompaniment from '../../models/Accompaniment.model';
import FoodAttribute from '../../models/FoodAttribute.model';
import { getFoodAttributes } from '../../services/foodattributes';
import { useAuth } from '../../providers/authentication';
import IOSSwitch from '../Common/IOSSwitch';
import AccompanimentForm, { AccompanimentFormType } from './AccompanimentForm';
import AccompagnementPriceForm from './AccompagnementPriceForm';
import { useSnackbar } from 'notistack';
import FormDialog from '../Common/FormDialog';

export type FoodFormType = {
  _id?: string;
  name: string;
  price: string;
  description: string;
  type: string;
  options: { title: string; maxOptions: string; items: Accompaniment[] }[];
  attributes: string[];
  restaurant: string;
  priority?: number;
  statut: boolean;
  imageNotContractual: boolean;
  image?: File;
  imageURL?: string;
  allergene: boolean;
  isAvailable?: boolean;
};

const useStyles = makeStyles(() => ({
  dropzone: {
    height: '100%',
  },
}));

interface CurrentAcc {
  title: string;
  index: number;
}

interface FoodFormProps {
  modification?: boolean;
  initialValues?: FoodFormType;
  saving?: boolean;
  onSave?: (data: FoodFormType) => void;
  onCancel?: () => void;
}

const FoodForm: React.FC<FoodFormProps> = ({
  initialValues = {
    name: '',
    price: '0',
    description: '',
    type: '',
    restaurant: '',
    options: [],
    attributes: [],
    statut: true,
    imageNotContractual: false,
    allergene: false,
    isAvailable: true,
  },
  saving,
  onSave,
  onCancel,
  modification,
}) => {
  const { restaurant, isRestaurantAdmin } = useAuth();

  const [typeOptions, setTypeOptions] = useState<FoodType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false);

  const [restaurantOptions, setRestaurantOptions] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState<boolean>(false);

  const [attributeOptions, setAttributeOptions] = useState<FoodAttribute[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState<boolean>(false);

  const [accompanimentOptions, setAccompanimentOptions] = useState<
    Accompaniment[]
  >([]);
  const [loadingAccompaniments, setLoadingAccompaniments] = useState<boolean>(
    false,
  );

  const validation = useCallback<FormValidationHandler<FoodFormType>>(
    (data) => {
      const errors: FormError<FoodFormType> = {};

      if (!data.name.length) errors.name = 'Ce champ ne doit pas être vide';
      if (!data.type.length) errors.type = 'Ce champ ne doit pas être vide';
      if (!data.description.length)
        errors.description = 'Ce champ ne doit pas être vide';
      if (!data.price.length) errors.price = 'Ce champ ne doit pas être vide';
      if (!data.restaurant.length)
        errors.restaurant = 'Ce champ ne doit pas être vide';
      // if (!modification && !data.image)
      //   errors.image = 'Ce champ ne doit pas être vide';

      return errors;
    },
    [],
  );

  const {
    values,
    setValues,
    validate,
    errors,
    handleInputBlur,
    handleSwitchChange,
  } = useForm<FoodFormType>(
    {
      ...initialValues,
      restaurant: restaurant ? restaurant._id : initialValues.restaurant,
    },
    false,
    validation,
  );

  const classes = useStyles();
  const theme = useTheme();

  const addNewAccompaniment = useCallback(() => {
    const { options } = values;
    options.push({
      title: '',
      maxOptions: '0',
      items: [],
    });
    setValues((v) => ({ ...v, options }));
    setOptionsLength(0)
  }, [setValues, values]);

  const removeAccompaniment = useCallback(
    (index: number) => {
      const { options } = values;
      options.splice(index, 1);
      setValues((v) => ({ ...v, options }));
    },
    [setValues, values],
  );

  const [selectedResto, setSelectedResto] = useState<Restaurant | null>(null);
  const [disableAll, setDisableAll] = useState(true);

  const [newAcc, setNewAcc] = useState(true);

  const handleSelectResto = useCallback(
    (resto: Restaurant) => {
      if (resto) {
        setSelectedResto(resto);
        setDisableAll(false);
        setNewAcc(true)
      }
    }, []
  )

  useEffect(() => {
    setLoadingTypes(true);
    let filter = undefined;
    if (isRestaurantAdmin && restaurant) {
      filter = {restaurant: restaurant._id}
    } else if (!isRestaurantAdmin && selectedResto) {
      filter = {restaurant: selectedResto?._id}
    }
    getFoodTypes(filter)
      .then((data) => {
        console.log(data)
        setTypeOptions(data)
      })
      .finally(() => setLoadingTypes(false));

    setLoadingRestaurants(true);
    getRestaurants()
      .then((data) => setRestaurantOptions(data))
      .finally(() => setLoadingRestaurants(false));

    if (newAcc) {
      setLoadingAccompaniments(true);
      getAccompaniments(filter)
        .then((data) => setAccompanimentOptions(data))
        .finally(() => {
          setLoadingAccompaniments(false)
          setNewAcc(false);
        });
    }

    setLoadingAttributes(true);
    getFoodAttributes()
      .then((data: any) => setAttributeOptions(data))
      .finally(() => setLoadingAttributes(false));

  }, [isRestaurantAdmin, restaurant, selectedResto, newAcc]);

  // useEffect(() => {
  //   if (errors.image) {
  //     enqueueSnackbar('Veuillez ajouter une image', {
  //       variant: 'warning',
  //     });
  //   }
  // }, [enqueueSnackbar, errors]);

  const handleSwitchAvailable = useCallback(
    (e) => {
      setValues((v) => ({...v, isAvailable: e.target.checked}))
    }, [setValues]
  )

  const [openForm, setOpenForm] = useState(false);
  const modif = useRef<AccompanimentFormType>();
  const [isSaving, setSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [optionsLength, setOptionsLength] = useState(0);
  const [showUpdatePrice, setUpdatePrice] = useState(false);
  const [currentOption, setCurrentOption] = useState<Accompaniment>();
  const [currentAcc, setCurrentAcc] = useState<CurrentAcc>();

  const newAccompaniment = useCallback(
    () => {
      setOpenForm(true)
    }, []
  )

  const updatePrice = useCallback(
    (data: AccompanimentFormType) => {
      console.log(data)
      let options = values.options;
      const accIndex = values.options.findIndex(({title}) => title === currentAcc?.title)
      let acc = values.options[accIndex];
      const optionsIndex = acc.items.findIndex((acc) => acc._id === currentOption?._id);
      const option = {...acc.items[optionsIndex], price: {amount: parseInt(data.price || '0') * 100, currency: 'eur'}} as Accompaniment;

      acc.items.splice(optionsIndex, 1)
      acc = {...acc, items: [...acc.items, option]} 

      options.splice(accIndex, 1)
      options[accIndex] = acc

      setValues((v) => ({...v, options: options}))

      console.log(values)
      // setValues({...v, options: })
      setUpdatePrice(false);
    }, [currentOption, setValues, currentAcc?.title, values]
  )

  const saveData = useCallback(
    (data: AccompanimentFormType) => {
      setSaving(true);
      addAccompaniment(data)
        .then(() => {
          enqueueSnackbar('Accompagnement ajouté avec succès', {
            variant: 'success',
          });
          setOpenForm(false);
        })
        .catch(() => {
          enqueueSnackbar("Erreur lors de l'ajout", {
            variant: 'error',
          });
        })
        .finally(() => {
          setNewAcc(true)
          setSaving(false);
        });
    },
    [enqueueSnackbar],
  );

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        (e.currentTarget.querySelector(
          '[type=submit]',
        ) as HTMLInputElement).focus();
        if (validate()) onSave?.(values);
      }}
    >
      <Grid container spacing={2}>
        {!isRestaurantAdmin && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Restaurant
            </Typography>
            <Autocomplete
              noOptionsText="Aucun restaurant disponible"
              loading={loadingRestaurants}
              options={restaurantOptions}
              getOptionLabel={(option) => option.name}
              value={
                restaurantOptions.find(
                  ({ _id }) => _id === values.restaurant,
                ) || null
              }
              onChange={(_, v) => {
                if (v) {
                  setValues((old) => ({ ...old, restaurant: v._id }));
                  handleSelectResto(v)
                }
                else {
                  setValues((old) => ({ ...old, restaurant: '' }));
                  setSelectedResto(null)
                  setDisableAll(true)
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Restaurant"
                  error={!!errors.restaurant}
                  helperText={errors.restaurant}
                />
              )}
            />
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Nom
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Nom"
            name="name"
            defaultValue={initialValues.name}
            error={!!errors.name}
            helperText={errors.name}
            onBlur={handleInputBlur}
          />

          <Box height={theme.spacing(2)} />

          <Typography variant="h5" gutterBottom>
            Type
          </Typography>
          <Autocomplete
            noOptionsText="Aucun type disponible"
            loading={loadingTypes}
            options={typeOptions}
            disabled={!selectedResto && disableAll}
            getOptionLabel={(option) => option.name.fr}
            value={typeOptions.find(({ _id }) => _id === values.type) || null}
            onChange={(_, v) => {
              if (v) setValues((old) => ({ ...old, type: v._id }));
              else setValues((old) => ({ ...old, type: '' }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Type"
                error={!!errors.type}
                helperText={errors.type}
              />
            )}
          />

          <Box height={theme.spacing(2)} />

          <Typography variant="h5" gutterBottom>
            Prix
          </Typography>
          <TextField
            type="number"
            fullWidth
            variant="outlined"
            placeholder="Prix"
            name="price"
            defaultValue={initialValues.price}
            error={!!errors.price}
            helperText={errors.price}
            onBlur={handleInputBlur}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">€</InputAdornment>
              ),
            }}
          />
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
            Image
          </Typography>
          <DropzoneArea
            inputProps={{
              name: 'image',
            }}
            previewGridProps={{
              container: { spacing: 2, justify: 'center' },
            }}
            classes={{ root: classes.dropzone }}
            dropzoneText="Image"
            acceptedFiles={['image/*']}
            filesLimit={1}
            getFileAddedMessage={() => 'Fichier ajouté'}
            getFileRemovedMessage={() => 'Fichier enlevé'}
            onChange={(files) => {
              if (files.length) setValues((v) => ({ ...v, image: files[0] }));
            }}
            initialFiles={[initialValues.imageURL??""]}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <IOSSwitch
                defaultChecked={initialValues.imageNotContractual}
                onChange={handleSwitchChange}
                name="imageNotContractual"
              />
            }
            label="Photo non contratctuel"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <IOSSwitch
                defaultChecked={initialValues.statut}
                onChange={handleSwitchChange}
                name="statut"
              />
            }
            label="Statut"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Attributs
          </Typography>
          <Autocomplete
            loadingText="Chargement"
            disabled={!selectedResto && disableAll}
            noOptionsText="Aucun attribut disponible"
            loading={loadingAttributes}
            options={attributeOptions}
            multiple
            filterSelectedOptions
            getOptionLabel={(option) => option.locales.fr}
            value={attributeOptions.filter(
              ({ _id }) => !!values.attributes.find((d) => d === _id),
            )}
            onChange={(_, v) => {
              if (v)
                setValues((old) => ({
                  ...old,
                  attributes: v.map(({ _id }) => _id),
                }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Attributs"
                error={!!errors.attributes}
                helperText={errors.attributes}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <IOSSwitch
                defaultChecked={initialValues.allergene}
                onChange={handleSwitchChange}
                name="allergene"
              />
            }
            label="Allergène"
          />
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">Accompagnements</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: 'block' }}>
              <Grid
                container
                justify="flex-end"
                alignItems="center"
                style={{ position: 'relative' }}
              >
                {!values.options.length && (
                  <Typography
                    style={{
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    Aucun accompagnement
                  </Typography>
                )}
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    color="secondary"
                    onClick={addNewAccompaniment}
                  >
                    Ajouter
                  </Button>
                </Grid>
                <Grid item style={{marginLeft: '8px'}}>
                  <Button
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    color="primary"
                    onClick={newAccompaniment}
                  >
                    Ajouter un accompagnement
                  </Button>
                </Grid>
              </Grid>
              {!!values.options.length && (
                <>
                  <Box height={theme.spacing(2)} />
                  <Grid container spacing={2}>
                    {values.options.map(({ title, maxOptions, items }, i) => (
                      <React.Fragment key={i}>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Titre"
                            style={{ flexGrow: 1 }}
                            defaultValue={title}
                            onBlur={({ target: { value } }) => {
                              const { options } = values;
                              options[i].title = value;
                              setValues((v) => ({ ...v, options }));
                            }}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            type="number"
                            fullWidth
                            variant="outlined"
                            placeholder="Choix maximum"
                            style={{ flexGrow: 1 }}
                            defaultValue={maxOptions}
                            onBlur={({ target: { value } }) => {
                              const { options } = values;
                              options[i].maxOptions = value;
                              setValues((v) => ({ ...v, options }));
                            }}
                          />
                        </Grid>
                        <Grid item xs={6} style={{ display: 'flex' }}>
                          <Autocomplete
                            fullWidth
                            multiple
                            filterSelectedOptions
                            style={{ flexGrow: 2 }}
                            noOptionsText="Aucun choix disponible"
                            loading={loadingAccompaniments}
                            options={accompanimentOptions}
                            disabled={!selectedResto && disableAll}
                            getOptionLabel={(option) => option.name}
                            value={accompanimentOptions.filter(({ _id }) =>
                              values.options[i].items.find((d) => d._id === _id),
                            )}
                            onChange={(_, v) => {
                              const { options } = values;
                              options[i].items = v;
                              if (v.length > optionsLength) {
                                setCurrentOption(v[v.length - 1])
                                setCurrentAcc({title: options[i].title, index: i});
                                setUpdatePrice(true);
                                const { _id, name, price, isObligatory } = v[v.length - 1];

                                modif.current = {
                                  _id,
                                  name,
                                  price: String((price?.amount || 0) / 100),
                                  isObligatory,
                                };
                              }
                              setOptionsLength(v.length)
                              setValues((v) => ({ ...v, options }));
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                placeholder="Accompagnement"
                              />
                            )}
                          />
                          <div style={{ marginLeft: theme.spacing(1) }}>
                            <IconButton onClick={() => removeAccompaniment(i)}>
                              <Close />
                            </IconButton>
                          </div>
                        </Grid>
                      </React.Fragment>
                    ))}
                  </Grid>
                </>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Box height={theme.spacing(2)} />
          <Grid item>
            <FormControlLabel
              control={
                <IOSSwitch
                  defaultChecked={values.isAvailable}
                  onChange={handleSwitchAvailable}
                  name="isAvailable"
                />
              }
              label="Disponible"
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

        <FormDialog
          title="Ajouter un accompagnement"
          open={openForm}
          fullScreen={false}
          onClose={() => {
            setOpenForm(false);
            modif.current = undefined;
          }}
        >
          <AccompanimentForm
            modification={!!modif.current}
            initialValues={modif.current}
            saving={isSaving}
            onSave={saveData}
            
            onCancel={() => {
              setOpenForm(false);
              modif.current = undefined;
            }}
            isUpdate={modif.current ? true : false}
          />
        </FormDialog>

        <FormDialog
          title={`Ajouter un prix à ${currentOption?.name}`}
          open={showUpdatePrice}
          fullScreen={false}
          onClose={() => {
            setUpdatePrice(false);
            modif.current = undefined;
          }}
        >
          <AccompagnementPriceForm
            modification={!!modif.current}
            initialValues={modif.current}
            saving={isSaving}
            onSave={updatePrice}
            
            onCancel={() => {
              setUpdatePrice(false);
              modif.current = undefined;
            }}
          />
        </FormDialog>

      </Grid>
    </form>
  );
};

export default FoodForm;
