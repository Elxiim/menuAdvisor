import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  makeStyles,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import logo from '../assets/img/logo.png';
import { useAuth } from '../providers/authentication';
import FormValidation from '../utils/FormValidation';
import querystring from 'querystring';
import background from '../assets/img/gradient_background_with_geometric_elements.jpg';
import { motion } from 'framer-motion';
import { Loading } from '../components/Common';
import { Link } from 'react-router-dom';
import { useDispatch } from '../utils/redux';
import { setLoged } from '../actions/event.action';

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
  logo: {
    height: 40,
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
  forgotPassword: {
    color: theme.palette.primary.main,
    marginTop: '25px'
  },
  loginButton: {
    textTransform: 'none',
  },
}));

const LoginPage: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [logingIn, setLogingIn] = useState(false);
  const [formValidation, setFormValidation] = useState(false);
  const [loading, setLoading] = useState(true);

  const { login } = useAuth();

  const { enqueueSnackbar } = useSnackbar();

  const history = useHistory();
  const location = useLocation();

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!formValidation) setFormValidation(true);

    if (
      !FormValidation.isEmail(username) ||
      !FormValidation.isNotEmpty(password)
    )
      return;

    if (!logingIn) {
      setLogingIn(true);
      try {
        await login(username, password, rememberMe);
        enqueueSnackbar('Succès de la connexion', { variant: 'success' });

        await dispatch(setLoged(true));

        const redirectTo: string = querystring.parse(location.search.slice(1))
          .redirectTo as string;
        if (redirectTo) history.push(redirectTo);
        else history.push('/');
      } catch (e) {
        console.log(e)
        enqueueSnackbar('Erreur lors de la connexion', { variant: 'error' });
      } finally {
        setLogingIn(false);
      }
    }
  };

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
            <form noValidate onSubmit={onSubmit}>
              <div>
                <img
                  src={logo}
                  alt="Menu advisor's logo"
                  className={classes.logo}
                />
              </div>
              <Typography variant="h6" component="p" gutterBottom>
                Bon retour
              </Typography>
              <Typography variant="h5" component="p" gutterBottom>
                Se connecter à votre compte
              </Typography>
              <Box height={theme.spacing(3)} />
              <TextField
                error={formValidation && !FormValidation.isEmail(username)}
                helperText={
                  formValidation && !FormValidation.isEmail(username)
                    ? "Nom d'utilisateur invalide"
                    : ''
                }
                value={username}
                onChange={({ target: { value } }) => setUsername(value)}
                fullWidth
                className={classes.input}
                variant="outlined"
                placeholder="Mail ou numéro de téléphone"
              />
              <Box height={theme.spacing(2)} />
              <TextField
                error={formValidation && !FormValidation.isNotEmpty(password)}
                helperText={
                  formValidation && !FormValidation.isNotEmpty(password)
                    ? 'Le mot de passe ne doit pas être vide'
                    : ''
                }
                value={password}
                onChange={({ target: { value } }) => setPassword(value)}
                fullWidth
                className={classes.input}
                variant="outlined"
                type="password"
                placeholder="Mot de passe"
              />
              <Box height={theme.spacing(2)} />
              <Grid container alignItems="center" justify="space-between">
                <Grid item>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={rememberMe}
                        onChange={(_, value) => setRememberMe(value)}
                        name="rememberMe"
                      />
                    }
                    label="Se souvenir de moi"
                  />
                </Grid>

              </Grid>
              <Box height={theme.spacing(2)} />
              <Button
                className={classes.loginButton}
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                fullWidth
              >
                {!logingIn ? (
                  'Se connecter'
                ) : (
                  <CircularProgress color="inherit" size="25.45px" />
                )}
              </Button>
              <Box height={theme.spacing(2)} />
              <Link to="/forgotPassword" className={classes.forgotPassword}>
                Mot de passe oublié?
              </Link>
            </form>
          </Paper>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
