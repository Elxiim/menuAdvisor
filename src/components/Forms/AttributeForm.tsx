import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';
import React, { useCallback, useEffect } from 'react';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import { DropzoneArea } from 'material-ui-dropzone';
import IOSSwitch from '../Common/IOSSwitch';
import { useSnackbar } from 'notistack';

export type AttributeFormType = {
  _id?: string;
  name: string;
  isAllergen: boolean;
  image?: File;
  imageURL?: string;
};

interface AttributeFormProps {
  modification?: boolean;
  initialValues?: AttributeFormType;
  onSave?: (data: AttributeFormType) => void;
  onCancel?: () => void;
  saving?: boolean;
}

const AttributeForm: React.FC<AttributeFormProps> = ({
  modification,
  initialValues = {
    name: '',
    isAllergen: false,
  },
  onSave,
  onCancel,
  saving,
}) => {
  const validation = useCallback<FormValidationHandler<AttributeFormType>>(
    (data) => {
      const errors: FormError<AttributeFormType> = {};

      if (!data.name.length) errors.name = 'Ce champ ne doit pas être vide';

      if (!modification && !data.image)
        errors.image = 'Ce champ ne doit pas être vide';

      return errors;
    },
    [modification],
  );

  const {
    values,
    setValues,
    errors,
    handleInputChange,
    validate,
  } = useForm<AttributeFormType>(initialValues, false, validation);

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
            Nom de l'attribut
          </Typography>
          <TextField
            name="name"
            placeholder="Nom de l'attribut"
            variant="outlined"
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
            value={values.name}
            onChange={handleInputChange}
          />
          <Box height={theme.spacing(2)} />
          <FormControlLabel
            control={
              <IOSSwitch
                checked={values.isAllergen}
                onChange={(_, checked) =>
                  setValues((v) => ({ ...v, isAllergen: checked }))
                }
                name="isAllergen"
              />
            }
            label="Allergène"
          />
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

export default AttributeForm;
