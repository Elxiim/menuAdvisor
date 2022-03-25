import React, { useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import Role from '../../types/Role';
import FormValidation from '../../utils/FormValidation';
import { useAuth } from '../../providers/authentication';

export type UserFormType = {
  _id?: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phoneNumber: string;
  confirmPassword: string;
  role: Role | '';
};

interface UserFormProps {
  modification?: boolean;
  initialValues?: UserFormType;
  validateOnChange?: boolean;
  onSave?: (data: UserFormType) => void;
  onCancel?: () => void;
  saving?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  modification,
  initialValues = {
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: '',
  },
  onCancel,
  onSave,
  saving,
}) => {
  const validation = useCallback<FormValidationHandler<UserFormType>>(
    (data) => {
      const errors: FormError<UserFormType> = {};

      if (!data.firstname.length)
        errors.firstname = 'Ce champ ne doit pas être vide';
      if (!data.lastname.length)
        errors.lastname = 'Ce champ ne doit pas être vide';
      if (!data.email.length) errors.email = 'Ce champ ne doit pas être vide';
      else if (!FormValidation.isEmail(data.email))
        errors.email = 'Email non valide';
      if (!data.phoneNumber.length)
        errors.phoneNumber = 'Ce champ ne doit pas être vide';
      else if (!FormValidation.isPhoneNumber(data.phoneNumber))
        errors.phoneNumber = 'Téléphone non valide';
      if (!modification && data.password.length < 6)
        errors.password = 'Doit contenir au moins 6 caractères';
      if (
        !modification &&
        data.password.length &&
        data.confirmPassword !== data.password
      )
        errors.confirmPassword = 'Ne correspond pas';

      if (
        modification &&
        data.confirmPassword !== data.password
      )
        errors.confirmPassword = 'Ne correspond pas';


      return errors;
    },
    [modification],
  );

  const {
    values,
    validate,
    errors,
    handleInputBlur,
    handleSelectChange,
  } = useForm<UserFormType>(initialValues, false, validation);

  const theme = useTheme();

  const { user, isAdmin } = useAuth();

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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" style={{ fontWeight: 'bold' }} gutterBottom>
            Détails de l'utilisateur
          </Typography>
        </Grid>
        <Box height={theme.spacing(4)}></Box>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Nom
          </Typography>
          <TextField
            name="lastname"
            placeholder="Nom"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.lastname}
            error={!!errors.lastname}
            helperText={errors.lastname}
            onBlur={handleInputBlur}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Prénom
          </Typography>
          <TextField
            name="firstname"
            placeholder="Prénom"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.firstname}
            error={!!errors.firstname}
            helperText={errors.firstname}
            onBlur={handleInputBlur}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Email
          </Typography>
          <TextField
            type="email"
            name="email"
            placeholder="Email"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.email}
            error={!!errors.email}
            helperText={errors.email}
            onBlur={handleInputBlur}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Téléphone
          </Typography>
          <TextField
            type="tel"
            name="phoneNumber"
            placeholder="Téléphone"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.phoneNumber}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            onBlur={handleInputBlur}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Rôle
          </Typography>
          <Select
            fullWidth
            variant="outlined"
            name="role"
            defaultValue={initialValues.role}
            onChange={handleSelectChange}
            value={values.role}
          >
            <MenuItem value="" disabled>
              Veuillez sélectionner
            </MenuItem>
            <MenuItem value="ROLE_ADMIN">Administrateur</MenuItem>
            <MenuItem value="ROLE_RESTAURANT_ADMIN">Restaurateur</MenuItem>
            <MenuItem value="ROLE_DELIVERY_AGENT">Agent de livraison</MenuItem>
            <MenuItem value="ROLE_USER">Utilisateur</MenuItem>
          </Select>
        </Grid>
        {
          modification && (
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Mot de passe
              </Typography>
              <TextField
                type="password"
                placeholder="......."
                variant="outlined"
                fullWidth
                defaultValue="......."
                disabled
              />
            </Grid>
          )
        }
        {(!modification || (user && user._id === values._id) || isAdmin) && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                {!modification ? 'Mot de passe' : 'Modifier mot de passe'}
              </Typography>
              <TextField
                type="password"
                name="password"
                placeholder="Mot de passe"
                variant="outlined"
                fullWidth
                defaultValue={initialValues.password}
                error={!!errors.password}
                helperText={errors.password}
                onBlur={handleInputBlur}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Confirmer le mot de passe
              </Typography>
              <TextField
                type="password"
                name="confirmPassword"
                placeholder="Mot de passe"
                variant="outlined"
                fullWidth
                defaultValue={initialValues.confirmPassword}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                onBlur={handleInputBlur}
              />
            </Grid>
          </>
        )}
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

export default UserForm;
