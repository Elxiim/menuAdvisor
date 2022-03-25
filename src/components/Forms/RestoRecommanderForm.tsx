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
import Restaurant from '../../models/Restaurant.model';
import { getRestaurants } from '../../services/restaurant';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../providers/authentication';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

export type RestoRecommandedFormType = {
  _id?: string;
  priority?: number;
  restaurant?: Restaurant;
};

interface RestoRecommandedFormProps {
  initialValues?: RestoRecommandedFormType;
  onSave?: (data: RestoRecommandedFormType) => void;
  onCancel?: () => void;
  saving?: boolean;
  isUpdate?: boolean;
}

const RestoRecommanderForm: React.FC<RestoRecommandedFormProps> = ({
  initialValues = {
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

  const validation = useCallback<FormValidationHandler<RestoRecommandedFormType>>(
    (data) => {
      const errors: FormError<RestoRecommandedFormType> = {};

      if (!data.restaurant) errors.restaurant = 'Ce champ ne doit pas être vide';

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
  } = useForm<RestoRecommandedFormType>(initialValues, false, validation);

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
        {!isRestaurantAdmin && (<Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Restaurant
          </Typography>
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

export default RestoRecommanderForm;
