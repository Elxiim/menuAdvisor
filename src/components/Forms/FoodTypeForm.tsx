import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import Restaurant from '../../models/Restaurant.model';
import { getRestaurants } from '../../services/restaurant';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../providers/authentication';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

export type FoodTypeFormType = {
  _id?: string;
  priority?: number;
  name: string;
  restaurant?: Restaurant;
};

interface FoodTypeFormProps {
  initialValues?: FoodTypeFormType;
  onSave?: (data: FoodTypeFormType) => void;
  onCancel?: () => void;
  saving?: boolean;
  isUpdate?: boolean;
}

const FoodTypeForm: React.FC<FoodTypeFormProps> = ({
  initialValues = {
    name: '',
    restaurant: undefined,
  },
  onSave,
  onCancel,
  saving,
  isUpdate
}) => {
  const classes = useStyles();

  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { isRestaurantAdmin, restaurant } = useAuth();

  const validation = useCallback<FormValidationHandler<FoodTypeFormType>>(
    (data) => {
      const errors: FormError<FoodTypeFormType> = {};

      if (!data.name.length) errors.name = 'Ce champ ne doit pas être vide';
      if (!data.restaurant) errors.restaurant = 'Ce champ ne doit pas être vide';

      return errors;
    },
    [],
  );

  const [restoOptions, setRestoOptions] = useState<Restaurant[]>([]);

  const {
    values,
    handleInputBlur,
    setValues,
    errors,
    validate,
    handleSelectChange
  } = useForm<FoodTypeFormType>(initialValues, false, validation);

  useEffect(() => {
    if (isRestaurantAdmin) {
      setValues((old) => {
        old.restaurant = restaurant || undefined;
        return { ...old };
      });
    }
    getRestaurants()
        .then(data => setRestoOptions(data || []))
        .catch(e => {
            enqueueSnackbar('Erreur lors du chargement des restos', {variant: 'error'})
        })
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
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Nom
          </Typography>
          <TextField
            type="name"
            name="name"
            placeholder="Nom du type"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.name}
            error={!!errors.name}
            helperText={errors.name}
            onBlur={handleInputBlur}
          />
        </Grid>
        {!isRestaurantAdmin && (<Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Restaurant
          </Typography>
          {/* <TextField
            type="restaurant"
            name="restaurant"
            placeholder="Restaurant"
            variant="outlined"
            fullWidth
            value={restoOptions.filter(
              ({ _id }) => _id === values.restaurant?._id
            )[0].name}
            disabled={true}
          /> */}
          <Select
            fullWidth
            variant="outlined"
            name="restaurant"
            onChange={handleSelectChange}
            value={values.restaurant}
            disabled={isUpdate}
          >
            <MenuItem value="" disabled>
              Veuillez sélectionner
            </MenuItem>
            {restoOptions.map((resto, index) => (
              <MenuItem key={index} value={resto._id}>{resto?.name}</MenuItem>
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

export default FoodTypeForm;
