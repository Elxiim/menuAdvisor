import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import Restaurant from '../../models/Restaurant.model';
import { getRestaurants } from '../../services/restaurant';
import { Autocomplete } from '@material-ui/lab';
import { getFoods } from '../../services/food';
import Food from '../../models/Food.model';
import { useAuth } from '../../providers/authentication';

export type MenuFormType = {
  _id?: string;
  priority?: number;
  name: string;
  description: string;
  type: string;
  restaurant: string;
  foods: string[];
  price: string;
  prices: string[];
};

interface MenuFormProps {
  initialValues?: MenuFormType;
  saving?: boolean;
  onSave?: (data: MenuFormType) => void;
  onCancel?: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({
  initialValues = {
    name: '',
    description: '',
    type: '',
    restaurant: '',
    foods: [],
    price: '0',
    prices: [],
  },
  saving,
  onSave,
  onCancel,
}) => {
  const { restaurant, isRestaurantAdmin } = useAuth();

  const [restaurantOptions, setRestaurantOptions] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState<boolean>(false);

  const [foodOptions, setFoodOptions] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState<boolean>(false);

  const [foods, setFoods] = useState<Food[]>([]);

  const validation: FormValidationHandler<MenuFormType> = (data) => {
    const errors: FormError<MenuFormType> = {};

    if (!data.name.length) errors.name = 'Ce champ ne doit pas être vide';
    if (!data.type.length) errors.type = 'Ce champ ne doit pas être vide';
    if (!data.restaurant.length)
      errors.restaurant = 'Ce champ ne doit pas être vide';
    if (!data.foods.length)
      errors.foods = 'Vous devez sélectionner au moins un plat';
    if (!data.description.length)
      errors.description = 'Ce champ ne doit pas être vide';

    return errors;
  };

  const {
    values,
    setValues,
    validate,
    handleInputBlur,
    handleSelectChange,
    errors,
  } = useForm(
    {
      ...initialValues,
      restaurant: restaurant ? restaurant._id : initialValues.restaurant,
    },
    false,
    validation,
  );

  const theme = useTheme();

  const [selectedResto, setSelectedResto] = useState<Restaurant | null>(null);
  const [disableAll, setDisableAll] = useState(true);

  const handleSelectResto = useCallback(
    (resto: Restaurant) => {
      if (resto) {
        setSelectedResto(resto);
        setDisableAll(false);
      }
    }, []
  )

  useEffect(() => {
    setLoadingRestaurants(true);
    getRestaurants()
      .then((data) => setRestaurantOptions(data))
      .finally(() => setLoadingRestaurants(false));
  }, []);

  useEffect(() => {
    setFoodOptions([]);
    setLoadingFoods(true);
    let filter = '';
    if (isRestaurantAdmin && restaurant) {
      filter = restaurant._id
    } else if (!isRestaurantAdmin && selectedResto) {
      filter = selectedResto?._id
    }
    getFoods({
      lang: 'fr',
      restaurant: filter
    })
      .then((data) => {
        setFoods(data.filter(({ _id }) => values.foods.find((d) => _id === d)));
        setFoodOptions(data);
      })
      .finally(() => setLoadingFoods(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.restaurant, selectedResto]);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        (e.currentTarget.querySelector(
          '[type=submit]',
        ) as HTMLInputElement).focus();
        if (validate()) onSave?.(values);
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Nom
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Nom"
            name="name"
            defaultValue={initialValues.name}
            onBlur={handleInputBlur}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Type
          </Typography>
          <FormControl fullWidth variant="outlined" error={!!errors.type}>
            <Select
              defaultValue={initialValues.type}
              name="type"
              onChange={handleSelectChange}
            >
              <MenuItem value="" disabled>
                Sélectionner un type
              </MenuItem>
              <MenuItem value="per_food">Prix par plats</MenuItem>
              <MenuItem value="priceless">Sans prix</MenuItem>
              <MenuItem value="fixed_price">Prix fixe</MenuItem>
            </Select>
            <FormHelperText>{errors.type}</FormHelperText>
          </FormControl>
        </Grid>
        {values.type === 'fixed_price' && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Prix
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="price"
              name="price"
              defaultValue={initialValues.price}
              onBlur={handleInputBlur}
              error={!!errors.price}
              helperText={errors.price}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">€</InputAdornment>
                ),
              }}
            />
          </Grid>
        )}
        {!isRestaurantAdmin && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Restaurant
            </Typography>
            <Autocomplete
              loadingText="Chargement"
              noOptionsText="Aucun restaurant disponible"
              loading={loadingRestaurants}
              options={restaurantOptions}
              getOptionLabel={(option) => option.name}
              value={
                restaurantOptions.find(
                  ({ _id }) => values.restaurant === _id,
                ) || null
              }
              onChange={(_, v) => {
                if (v) {
                  setValues((old) => ({ ...old, restaurant: v._id }));
                  handleSelectResto(v)
                }
                else {
                  setValues((old) => ({ ...old, restaurant: '' }));
                  setSelectedResto(null)
                  setDisableAll(true)
                }
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
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Plats
          </Typography>
          <Autocomplete
            loadingText="Chargement"
            noOptionsText="Aucun plat disponible"
            loading={loadingFoods}
            options={foodOptions}
            multiple
            filterSelectedOptions
            disabled={!selectedResto && disableAll}
            getOptionLabel={(option) => option.name}
            value={foodOptions.filter(({ _id }) =>
              values.foods.find((d) => _id === d),
            )}
            onChange={(_, v) => {
              setFoods(v);
              setValues((old) => {
                if (v.length > old.prices.length) old.prices.push('0');
                else if (v.length < old.prices.length) old.prices.pop();

                return { ...old, foods: v.map(({ _id }) => _id) };
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Plats"
                error={!!errors.foods}
                helperText={errors.foods}
              />
            )}
          />
        </Grid>
        {values.type === 'fixed_price' && !!values.prices.length && (
          <Grid item xs={12}>
            <Typography
              variant="h5"
              gutterBottom
              style={{ textDecoration: 'underline', fontWeight: 'bold' }}
            >
              Prix additionnels
            </Typography>
            <Container
              maxWidth="sm"
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: theme.spacing(2),
                padding: theme.spacing(2, 0),
              }}
            >
              {values.prices.map((price, i) => (
                <React.Fragment key={i}>
                  <Typography
                    variant="h5"
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey',
                        marginRight: theme.spacing(1),
                      }}
                    ></span>
                    {foods[i]?.name}
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    variant="outlined"
                    placeholder="Prix"
                    defaultValue={price}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">€</InputAdornment>
                      ),
                    }}
                    onChange={({ target: { value } }) => {
                      setValues((old) => {
                        old.prices[i] = value;
                        return old;
                      });
                    }}
                  />
                </React.Fragment>
              ))}
            </Container>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Description
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Description"
            name="description"
            multiline
            rows={6}
            defaultValue={initialValues.description}
            onBlur={handleInputBlur}
            error={!!errors.description}
            helperText={errors.description}
          />
        </Grid>
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

export default MenuForm;
