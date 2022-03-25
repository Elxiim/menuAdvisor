import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';
import {
  CropFree as CropFreeIcon,
  GetApp as GetAppIcon,
  Image as ImageIcon,
} from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import PageHeader from '../components/Admin/PageHeader';
import useForm, { FormError, FormValidationHandler } from '../hooks/useForm';
import Restaurant from '../models/Restaurant.model';
import { getRestaurants } from '../services/restaurant';
import Api from '../Api';
import querystring from 'querystring';
import IOSSwitch from '../components/Common/IOSSwitch';
import FileDownload from 'js-file-download';
import clsx from 'clsx';
import { useSnackbar } from 'notistack';
import Image from 'material-ui-image';
import { useAuth } from '../providers/authentication';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  previewContainer: {
    height: '100%',
    minHeight: 250,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    border: '2px dashed grey',
    '&.active': {
      border: 'none',
    },
  },
}));

type QROptions = {
  _id?: string;
  restaurant: string;
  priceless: boolean;
  language: string;
  multipleLangue: string[];
};

const langs = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'Anglais' },
  { code: 'ja', label: 'Japonais' },
  { code: 'zh-CN', label: 'Chinois' },
  { code: 'it', label: 'Italien' },
  { code: 'es', label: 'Espagnol' },
  { code: 'ru', label: 'Russe' },
  { code: 'ko', label: 'Coréen' },
  { code: 'nl', label: 'Néerlandais' },
  { code: 'de', label: 'Allemand' },
  { code: 'pt', label: 'Portugais' },
  { code: 'hi', label: 'Indien' },
  { code: 'ar', label: 'Arabe' },
];

const QRCodePage: React.FC = () => {
  const classes = useStyles();
  const { isRestaurantAdmin, restaurant } = useAuth();

  const validation = useCallback<FormValidationHandler<QROptions>>((data) => {
    const errors: FormError<QROptions> = {};

    if (!data.restaurant.length)
      errors.restaurant = 'Ce champ ne doit pas être vide';

    return errors;
  }, []);

  const {
    values,
    setValues,
    validate,
    handleSwitchChange,
    handleSelectChange,
    errors,
  } = useForm<QROptions>(
    {
      restaurant: isRestaurantAdmin && restaurant ? restaurant._id : '',
      priceless: false,
      language: 'fr',
      multipleLangue: ['']
    },
    false,
    validation,
  );

  const [restaurantOptions, setRestaurantOptions] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState<boolean>(false);

  const [qrcode, setQrcode] = useState<Blob>();
  const [generatingQrcode, setGeneratingQrcode] = useState<boolean>(false);

  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const generateQRCode = useCallback(() => {
    setGeneratingQrcode(true);
    Api.get(
      `/utils/generate-qrcode?${querystring.stringify({
        language: values.language,
        restaurant: values.restaurant,
        priceless: JSON.stringify(values.priceless),
        multipleLanguage: JSON.stringify(values.multipleLangue)
      })}`,
      {
        responseType: 'blob',
      },
    )
      .then(({ data }) => {
        setQrcode(data);
      })
      .catch(() => {
        enqueueSnackbar('Erreur lors de la génration du code', {
          variant: 'error',
        });
      })
      .finally(() => {
        setGeneratingQrcode(false);
      });
  }, [enqueueSnackbar, values.language, values.priceless, values.restaurant, values.multipleLangue]);

  useEffect(() => {
    setLoadingRestaurants(true);
    getRestaurants({})
      .then((data) => setRestaurantOptions(data))
      .finally(() => setLoadingRestaurants(false));
  }, []);

  const [isMultiple, setIsMultiple] = useState(false);

  const handleMultipleSwitchChange = useCallback(
    (e) => {
      setIsMultiple(e.target.checked);
    }, []
  )

  return (
    <>
      <PageHeader
        title="Code QR"
        subTitle="Générateur de code QR"
        icon={CropFreeIcon}
      />
      <Paper className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Langue
            </Typography>
            <Select
              fullWidth
              variant="outlined"
              name="language"
              defaultValue={'fr'}
              onChange={handleSelectChange}
            >
              <MenuItem value="">Veuillez choisir une langue</MenuItem>
              {langs.map(({ code, label }) => (
                <MenuItem key={code} value={code}>
                  {label}
                </MenuItem>
              ))}
            </Select>

            {!isRestaurantAdmin && (
              <>
                <Box height={theme.spacing(2)} />

                <Typography variant="h5" gutterBottom>
                  Restaurant
                </Typography>
                <Autocomplete
                  noOptionsText="Aucun restaurant disponible"
                  loading={loadingRestaurants}
                  options={restaurantOptions}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, v) => {
                    if (v) setValues((old) => ({ ...old, restaurant: v._id }));
                    else setValues((old) => ({ ...old, restaurant: '' }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Restaurant"
                      error={!!errors.restaurant}
                      helperText={errors.restaurant}
                    />
                  )}
                />
              </>
            )}

            <Box height={theme.spacing(2)} />

            <FormControlLabel
              control={
                <IOSSwitch
                  defaultChecked={false}
                  onChange={handleSwitchChange}
                  name="priceless"
                />
              }
              label="Sans prix"
            />
            <FormControlLabel
              control={
                <IOSSwitch
                  defaultChecked={false}
                  onChange={handleMultipleSwitchChange}
                  name="isMultiple"
                />
              }
              label="Choix de langue multiple"
            />

            {isMultiple && (
              <>
                <Box height={theme.spacing(2)} />

                <Typography variant="h5" gutterBottom>
                  Langue multiple
                </Typography>
                <Autocomplete
                  options={langs}
                  multiple
                  value={langs.filter(({code}) => !!values.multipleLangue.find((d) => code === d))}
                  getOptionLabel={(option) => option.label}
                  onChange={(_, v) => {
                    if (v) setValues((old) => ({ ...old, multipleLangue: [...old.multipleLangue, ...v.map(v => v.code)] }));
                    else setValues((old) => ({ ...old, multipleLangue: old.multipleLangue }));
                    console.log(v)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Langue multiple"
                      error={!!errors.multipleLangue}
                      helperText={errors.multipleLangue}
                    />
                  )}
                />
              </>
            )}    
          </Grid>
          <Grid item xs={12} md={6}>
            <div
              className={clsx(classes.previewContainer, { active: !!qrcode })}
            >
              {qrcode ? (
                <Image
                  src={URL.createObjectURL(qrcode)}
                  alt="qrcode preview"
                  style={{ padding: 0, width: 200, height: 200 }}
                />
              ) : (
                <>
                  <Typography>Aperçu</Typography>
                  <ImageIcon />
                </>
              )}
            </div>
          </Grid>
          <Grid item container justify="flex-end" alignItems="center" xs={12}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              style={{ textTransform: 'none' }}
              disabled={!qrcode || generatingQrcode}
              startIcon={<GetAppIcon />}
              onClick={() => {
                if (qrcode) FileDownload(qrcode, 'qrcode.png');
              }}
            >
              Télécharger
            </Button>

            <Box width={theme.spacing(2)} />

            <Button
              variant="contained"
              color="secondary"
              size="large"
              style={{ textTransform: 'none' }}
              disabled={generatingQrcode}
              onClick={() => {
                if (validate()) generateQRCode();
              }}
            >
              Générer
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default QRCodePage;
