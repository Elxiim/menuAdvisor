import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import { DropzoneArea } from 'material-ui-dropzone';
import { useSnackbar } from 'notistack';
import Restaurant from '../../models/Restaurant.model';
import { useAuth } from '../../providers/authentication';
import { getRestaurants } from '../../services/restaurant';
import IOSSwitch from '../Common/IOSSwitch';

export type AccompanimentFormType = {
  _id?: string;
  name: string;
  price?: string;
  image?: File;
  imageURL?: string;
  restaurant?: string;
  isObligatory?: boolean;
  priority?: number;
};

const useStyles = makeStyles(() => ({
  dropzone: {
    height: '100%',
  },
}));

interface AccompanimentFormProps {
  modification?: boolean;
  initialValues?: AccompanimentFormType;
  saving?: boolean;
  onSave?: (data: AccompanimentFormType) => void;
  onCancel?: () => void;
  isUpdate?: boolean;
}

const AccompanimentForm: React.FC<AccompanimentFormProps> = ({
  modification,
  initialValues = {
    name: '',
    restaurant: undefined,
  },
  onSave,
  onCancel,
  saving,
  isUpdate
}) => {
  const validation = useCallback<FormValidationHandler<AccompanimentFormType>>(
    (data) => {
      const errors: FormError<AccompanimentFormType> = {};

      if (!data.name.length) errors.name = 'Ce champ ne doit pas être vide';
      if (!data.restaurant) errors.restaurant = 'Ce champ ne doit pas être vide';
      if (!modification && !data.image)
        errors.image = 'Ce champ ne doit pas être vide';

      return errors;
    },
    [modification],
  );

  const {
    values,
    setValues,
    validate,
    errors,
    handleInputBlur,
    handleSelectChange
  } = useForm<AccompanimentFormType>(initialValues, false, validation);

  const classes = useStyles();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { isRestaurantAdmin, restaurant } = useAuth();

  const [restoOptions, setRestoOptions] = useState<Restaurant[]>([]);

  useEffect(() => {
    if (errors.image) {
      enqueueSnackbar('Veuillez ajouter une image', {
        variant: 'warning',
      });
    }
  }, [enqueueSnackbar, errors]);

  useEffect(() => {
    if (isRestaurantAdmin) {
      setValues((old) => {
        old.restaurant = restaurant?._id || undefined;
        return { ...old };
      });
    }
    getRestaurants()
        .then(data => setRestoOptions(data || []))
        .catch(e => {
            enqueueSnackbar('Erreur lors du chargement des restos', {variant: 'error'})
        })
  }, [enqueueSnackbar, isRestaurantAdmin, restaurant, setValues])

  const handleSwitchObligatory = useCallback(
    (e) => {
      setValues((v) => ({...v, isObligatory: e.target.checked}))
    }, [setValues]
  )

  return (
    <form
      noValidate
      method="post"
      encType="multipart/form-data"
      onSubmit={(e) => {
        e.preventDefault();
        (e.currentTarget.querySelector(
          '[type=submit]',
        ) as HTMLButtonElement).focus();
        if (validate()) onSave?.(values);
      }}
    >
      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Nom
          </Typography>
          <TextField
            name="name"
            placeholder="Nom"
            variant="outlined"
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
            defaultValue={initialValues.name}
            onBlur={handleInputBlur}
          />          
          <Box height={theme.spacing(2)} />
          {!isRestaurantAdmin && (
            <>
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
            </>
          )}
          <Box height={theme.spacing(2)} />
          <Grid item>
            <FormControlLabel
              control={
                <IOSSwitch
                  defaultChecked={values.isObligatory}
                  onChange={handleSwitchObligatory}
                  name="isObligatory"
                />
              }
              label="Obligatoire"
            />
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
            Image
          </Typography>
          <DropzoneArea
            inputProps={{
              name: 'image',
            }}
            previewGridProps={{
              container: { spacing: 2, justify: 'center' },
            }}
            dropzoneText="Image"
            acceptedFiles={['image/*']}
            filesLimit={1}
            classes={{ root: classes.dropzone }}
            getFileAddedMessage={() => 'Fichier ajouté'}
            getFileRemovedMessage={() => 'Fichier enlevé'}
            onChange={(files) => {
              if (files.length) setValues((v) => ({ ...v, image: files[0] }));
            }}
            initialFiles={[initialValues.imageURL??""]}
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

export default AccompanimentForm;
