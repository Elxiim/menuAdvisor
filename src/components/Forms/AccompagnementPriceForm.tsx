import React, { useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import { AccompanimentFormType } from './AccompanimentForm';

interface AccompanimentPriceFormProps {
  modification?: boolean;
  initialValues?: AccompanimentFormType;
  saving?: boolean;
  onSave?: (data: AccompanimentFormType) => void;
  onCancel?: () => void;
  isUpdate?: boolean;
}

const AccompagnementPriceForm: React.FC<AccompanimentPriceFormProps> = ({
  modification,
  initialValues = {
    name: '',
    restaurant: undefined,
    price: '0'
  },
  onSave,
  onCancel,
  saving,
}) => {
  const validation = useCallback<FormValidationHandler<AccompanimentFormType>>(
    (data) => {
      const errors: FormError<AccompanimentFormType> = {};
      return errors;
    },
    [],
  );

  const {
    values,
    validate,
    handleInputBlur,
  } = useForm<AccompanimentFormType>(initialValues, false, validation);

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
            Prix
          </Typography>
          <TextField
            name="price"
            placeholder="Prix"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.price}
            onBlur={handleInputBlur}
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

export default AccompagnementPriceForm;
