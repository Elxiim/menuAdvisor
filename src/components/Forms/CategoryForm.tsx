import React, { useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import { DropzoneArea } from 'material-ui-dropzone';
import { useSnackbar } from 'notistack';

export type CategoryFormType = {
  _id?: string;
  priority?: number;
  name: string;
  image?: File;
  imageURL?: string;
};

const useStyles = makeStyles(() => ({
  dropzone: {
    height: '100%',
  },
}));

interface CategoryFormProps {
  initialValues?: CategoryFormType;
  saving?: boolean;
  onSave?: (data: CategoryFormType) => void;
  onCancel?: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialValues = {
    name: '',
  },
  onSave,
  onCancel,
  saving,
}) => {
  const validation = useCallback<FormValidationHandler<CategoryFormType>>(
    (data) => {
      const errors: FormError<CategoryFormType> = {};

      if (!data.name.length) errors.name = 'Ce champ ne doit pas être vide';

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
  } = useForm<CategoryFormType>(initialValues, false, validation);

  const classes = useStyles();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (errors.image) {
      enqueueSnackbar('Veuillez ajouter une image', {
        variant: 'warning',
      });
    }
  }, [enqueueSnackbar, errors]);

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
            onChange={handleInputBlur}
          />
          <Box height={theme.spacing(2)} />
        </Grid>
        <Grid item xs={12} md={6}>
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

export default CategoryForm;
