import {
    Box,
    Button,
    CircularProgress,
    makeStyles,
    Paper,
    TextField,
    Typography,
    useTheme,
  } from '@material-ui/core';
  import { grey } from '@material-ui/core/colors';
  import { useSnackbar } from 'notistack';
  import React, { useState } from 'react';
  import { useHistory } from 'react-router-dom';
  import FormValidation from '../utils/FormValidation';
  import background from '../assets/img/gradient_background_with_geometric_elements.jpg';
  import { motion } from 'framer-motion';
  import { Loading } from '../components/Common';
  import { confirm_reset_password, reset_password, resendConfirmationCode } from '../services/auth';
  
  const useStyles = makeStyles((theme) => ({
    root: {
      width: '100vw',
      height: '100vh',
      backgroundColor: grey[300],
      backgroundImage: `url(${background})`,
      backgroundSize: 'cover',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    form: {
      padding: theme.spacing(4),
      color: grey[700],
      borderRadius: 20,
    },
    input: {
      boxSizing: 'border-box',
      minWidth: 420,
      '& input': {
        backgroundColor: 'white',
        padding: theme.spacing(1.5, 2),
      },
    },
    error: {
      border: `1px solid ${theme.palette.primary.main}`,
      '& MuiFormHelperText-root': {
        color: theme.palette.primary.main,
      },
    },
    loginButton: {
      textTransform: 'none',
    },
  }));
  
  const ForgotPasswordPage: React.FC = () => {
    const classes = useStyles();
    const theme = useTheme();
  
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmCode, setConfirmCode] = useState('');
    const [token, setToken] = useState('');
    const [forgotPassword, setForgotPassword] = useState(false);
    const [resendCode, setResendCode] = useState(false);
    const [formValidation, setFormValidation] = useState(false);
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [loading, setLoading] = useState(true);
  
    const { enqueueSnackbar } = useSnackbar();
  
    const history = useHistory();
  
    const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
      e.preventDefault();
  
      if (!formValidation) setFormValidation(true);
  
      if (!forgotPassword && username) {
        setForgotPassword(true);

        try {
            const result = await reset_password( { phoneNumber: username });
            if (result) {
                setToken(result.data.token);
                setIsResetPassword(true);
            } else {
                enqueueSnackbar('Numéro invalide', { variant: 'error' });
            }
        } catch {
            enqueueSnackbar('Erreur lors de la connexion', { variant: 'error' });
        } finally {
            setForgotPassword(false);
        }
      }
    };

    // Reset password for user
    const onSubmitNewPassword : React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        if (!formValidation) setFormValidation(true);

        if (!forgotPassword && username && confirmCode && newPassword) {
            setForgotPassword(true);
    
            try {

                const reset = await confirm_reset_password({
                    token,
                    code: confirmCode, 
                    password: newPassword
                });

                if (reset) {
                    enqueueSnackbar('Mot de passe modifié avec succès, veullez vous reconnecter ', { variant: 'success' });
                    history.push("/login");
                } else {
                    enqueueSnackbar('Veuillez vérifier votre code', { variant: 'error' });
                }

            } catch {
                enqueueSnackbar('Erreur lors de la connexion', { variant: 'error' });
            } finally {
                setForgotPassword(false);
            }
          }
        
    }

    const cancel = () => {
        history.push("/login");
    }

    const resendConfirmCode = async (e: any) => {
      e.preventDefault();
      setResendCode(true);

      try {
          const result = await resendConfirmationCode(token);
          if (result) {
            enqueueSnackbar('Votre code de confirmation à été envoyé', { variant: 'success' });
          } else {
              enqueueSnackbar('Un erreur est survenue, veuillez réessayer', { variant: 'error' });
          }
      } catch {
          enqueueSnackbar('Erreur lors de la connexion', { variant: 'error' });
      } finally {
        setResendCode(false);
      }
    }
  
    return (
      <>
        <Loading open={loading} />
        <img
          onLoad={() => setLoading(false)}
          alt="placeholder"
          src={background}
          style={{ display: 'none' }}
        />
        <div className={classes.root}>
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={
              !loading
                ? {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.8,
                    },
                  }
                : undefined
            }
          >
            <Paper className={classes.form}>
              {
                !isResetPassword?
                <form noValidate onSubmit={onSubmit}>
                <Typography variant="h5" component="p" gutterBottom>
                  Entrer votre numéro de téléphone pour recevoir votre code
                </Typography>
                <Box height={theme.spacing(3)} />
                <TextField
                    error={formValidation && !FormValidation.isNotEmpty(username)}
                    helperText={
                        formValidation && !FormValidation.isNotEmpty(username)
                        ? 'Le numéro de téléphone ne doit pas être vide'
                        : ''
                    }
                    value={username}
                    onChange={({ target: { value } }) => setUsername(value)}
                    fullWidth
                    className={classes.input}
                    variant="outlined"
                    placeholder="Numéro de téléphone"
                />
                <Box height={theme.spacing(2)} />
                <Button
                  className={classes.loginButton}
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  fullWidth
                >
                  {!forgotPassword ? (
                    'Valider'
                  ) : (
                    <CircularProgress color="inherit" size="25.45px" />
                  )}
                </Button>
                <Box height={theme.spacing(2)} />
                <Button
                  className={classes.loginButton}
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  onClick={cancel}
                >
                    Annuler
                </Button>
              </form>
              :
              <form noValidate onSubmit={onSubmitNewPassword}>
                <Typography variant="h5" component="p" gutterBottom>
                  Entrer votre nouveau mot de passe
                </Typography>
                <Box height={theme.spacing(3)} />
                <TextField
                    error={formValidation && !FormValidation.isNotEmpty(confirmCode)}
                    helperText={
                        formValidation && !FormValidation.isNotEmpty(confirmCode)
                        ? 'Code de validation ne doit pas être vide'
                        : ''
                    }
                    value={confirmCode}
                    onChange={({ target: { value } }) => setConfirmCode(value)}
                    fullWidth
                    className={classes.input}
                    variant="outlined"
                    placeholder="Code de validation"
                />
                <Box height={theme.spacing(2)} />
                <TextField
                    error={formValidation && !FormValidation.isNotEmpty(newPassword)}
                    helperText={
                        formValidation && !FormValidation.isNotEmpty(newPassword)
                        ? 'Le mot de passe ne doit pas être vide'
                        : ''
                    }
                    value={newPassword}
                    onChange={({ target: { value } }) => setNewPassword(value)}
                    fullWidth
                    className={classes.input}
                    variant="outlined"
                    type="password"
                    placeholder="Votre nouveau mot de passe"
                />
                <Box height={theme.spacing(2)} />
                <Button
                  className={classes.loginButton}
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  fullWidth
                >
                  {!forgotPassword ? (
                    'Valider'
                  ) : (
                    <CircularProgress color="inherit" size="25.45px" />
                  )}
                </Button>
                <Box height={theme.spacing(2)} />
                <Button
                  className={classes.loginButton}
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  onClick={resendConfirmCode}
                >
                    {!resendCode ? (
                    'Renvoyer le code'
                  ) : (
                    <CircularProgress color="inherit" size="25.45px" />
                  )}
                </Button>
              </form>
            }
            </Paper>
          </motion.div>
        </div>
      </>
    );
  };
  
  export default ForgotPasswordPage;
  