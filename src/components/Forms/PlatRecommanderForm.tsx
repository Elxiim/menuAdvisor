import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from '@material-ui/core';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import PlatRecommander from '../../models/PlatRecommander.model';
import { getRestaurants } from '../../services/restaurant';
import Restaurant from '../../models/Restaurant.model';
import Food from '../../models/Food.model';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../providers/authentication';
import { getFoods } from '../../services/food'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

export type PlatRecommanderFormType = {
  _id?: string;
  priority?: number;
  food?: string;
  restaurant?: Restaurant;
};
interface PlatRecommandedFormProps {
  initialValues?: PlatRecommanderFormType;
  onSave?: (data: PlatRecommanderFormType) => void;
  onCancel?: () => void;
  saving?: boolean;
  isUpdate?: boolean;
}

const PlatRecommanderForm: React.FC<PlatRecommandedFormProps> = ({
  initialValues = {
    food: '',
    restaurant: undefined,

  },
  onSave,
  onCancel,
  saving,
  isUpdate
}) => {
  const [foods, setFoods] = useState<Food[]>()
  const [loadingFood, setLoadingFood] = useState<boolean>(false)
  const [loadingRestaurants, setLoadingRestaurants] = useState<boolean>(false);

  const classes = useStyles();

  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { isRestaurantAdmin, restaurant } = useAuth();

  const validation = useCallback<FormValidationHandler<PlatRecommanderFormType>>(
    (data) => {
      const errors: FormError<PlatRecommanderFormType> = {};

      if (!data.food) errors.food = 'Ce champ ne doit pas être vide';

      return errors;
    },
    [],
  );

  const [restoOptions, setRestoOptions] = useState<Restaurant[]>([]);

  const {
    values,
    setValues,
    validate,
    handleSelectChange
  } = useForm<PlatRecommanderFormType>(initialValues, false, validation);

  useEffect(() => {
    setLoadingFood(true)
    getFoods().then((data) => {
      setFoods(data)

    }).finally(() => {
      setLoadingFood(false)
    })

    setLoadingRestaurants(true);

    getRestaurants()
        .then(data => setRestoOptions(data || []))
        .catch(e => {
            enqueueSnackbar('Erreur lors du chargement des restos', {variant: 'error'})
        })
      .finally(() => setLoadingRestaurants(false));
  }, [enqueueSnackbar, isRestaurantAdmin, restaurant, setValues])

  return (
    <form
      noValidate
      className={classes.root}
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
          <Select
            fullWidth
            variant="outlined"
            name="restaurant"
            onChange={handleSelectChange}
            value={values.restaurant}
            // disabled={isUpdate}
          >
            <MenuItem value="" disabled>
              Veuillez sélectionner
            </MenuItem>
            {restoOptions?.map((resto, index) => (
              <MenuItem key={index} value={resto?._id}>{resto?.name}</MenuItem>
            ))}
          </Select>
          <Typography variant="h5" gutterBottom>
            Plat recommander
          </Typography>
          <Select
            fullWidth
            variant="outlined"
            name="food"
            onChange={handleSelectChange}
            value={values.food}
            // disabled={isUpdate}
          >
            <MenuItem value="" disabled>
              Veuillez sélectionner
            </MenuItem>
            {foods?.filter(k => k.restaurant?._id === values.restaurant || '').map((food: any, index) => (
              <MenuItem key={index} value={food._id}>{food?.name}</MenuItem>
            ))}
          </Select>
        </Grid>)}
        <Grid item container justify="flex-end" alignItems="center" xs={12}>
          <Button
            variant="contained"
            color="default"
            disabled={saving}
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Box width={theme.spacing(2)} />
          <Button variant="contained" color="primary" type="submit">
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

export default PlatRecommanderForm;

