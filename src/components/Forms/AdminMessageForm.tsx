import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';

import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import { useSnackbar } from 'notistack';
import Restaurant from '../../models/Restaurant.model';
import { getRestaurants } from '../../services/restaurant';
import { Autocomplete } from '@material-ui/lab';

export type AdminMessageFormType = {
  _id?: string;
  message: string;
  target: Restaurant[];
};

interface CategoryFormProps {
  initialValues?: AdminMessageFormType;
  saving?: boolean;
  onSave?: (data: AdminMessageFormType) => void;
  onCancel?: () => void;
}

const AdminMessageForm: React.FC<CategoryFormProps> = ({
  initialValues = {
    message: '',
    target: [],
  },
  onSave,
  onCancel,
  saving,
}) => {
  const validation = useCallback<FormValidationHandler<AdminMessageFormType>>(
    (data) => {
      const errors: FormError<AdminMessageFormType> = {};

      if (!data.message.length) errors.message = 'Ce champ ne doit pas être vide';

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
  } = useForm<AdminMessageFormType>(initialValues, false, validation);

  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [restoOptions, setRestoOptions] = useState<Restaurant[]>([]);
  const [loadingResto, setLoadingResto] = useState<boolean>(false);

  useEffect(() => {
    setLoadingResto(true);
    getRestaurants()
        .then(data => setRestoOptions(data || []))
        .catch(e => {
            enqueueSnackbar('Erreur lors du chargement des restos', {variant: 'error'})
        })
        .finally(() => setLoadingResto(false))
  }, [enqueueSnackbar])

  return (
    <form
      noValidate
      method="post"
      encType="multipart/form-data"
      onSubmit={(e) => {
        e.preventDefault();
        (e.currentTarget.querySelector(
          '[type=submit]',
        ) as HTMLInputElement).focus();
        if (validate()) onSave?.(values);
      }}
    >
      <Grid container spacing={2} justify="center">
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Message
          </Typography>
          <TextField
            name="message"
            placeholder="Message"
            variant="outlined"
            fullWidth
            multiline
            error={!!errors.message}
            helperText={errors.message}
            defaultValue={initialValues.message}
            onChange={handleInputBlur}
          />
          <Box height={theme.spacing(2)} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Restaurants
          </Typography>
          <Autocomplete
            loadingText="Chargement"
            noOptionsText="Aucun restaurant disponible"
            multiple
            disableCloseOnSelect
            loading={loadingResto}
            filterSelectedOptions
            options={restoOptions}
            value={restoOptions.filter(
              ({ _id }) => !!values.target.find((d) => _id === d._id),
            )}
            onChange={(_, v): any => {
              setValues((old) => {
                old.target = v.map((v: any) => v);
                return { ...old };
              });
            }}
            getOptionLabel={(option: any) => option.name}
            renderInput={(params: any) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Restaurant"
                error={!!errors.target}
                helperText={errors.target}
              />
            )}
          />
        </Grid>
        <Grid
          item
          container
          justify="flex-end"
          alignItems="center"
          xs={12}
          spacing={2}
        >
          <Button variant="contained" color="default" onClick={onCancel}>
            Annuler
          </Button>
          <Box width={10} />
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

export default AdminMessageForm;
