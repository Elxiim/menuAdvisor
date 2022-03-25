import React from 'react';
import {
  AppBar,
  Avatar,
  Button,
  Chip,
  Container,
  Dialog,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  makeStyles,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import Command from '../../models/Command.model';
import {
  Block,
  Check,
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
} from '@material-ui/icons';
import { green, orange, red } from '@material-ui/core/colors';
import clsx from 'clsx';
import { estimateCommandPrice } from '../../services/price';
import SlideTransition from '../Transitions/SlideTransition';
import NumberFormatter from '../../utils/NumberFormatter';
import DateFormatter from '../../utils/DateFormatter';
import { revokeCommand, validateCommand } from '../../services/commands';
import { useSnackbar } from 'notistack';
import PriceFormatter from '../../utils/PriceFormatter';
import EventEmitter from '../../services/EventEmitter';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(14),
  },
  restaurantImage: {
    width: 140,
    height: 140,
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  commandId: {
    color: theme.palette.primary.main,
  },
  status: {
    backgroundColor: orange[400],
    color: 'white',
    '&.active': {
      backgroundColor: green[400],
    },
    '&.revoked': {
      backgroundColor: red[400],
    },
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Work Sans',
  },
  totalPrice: {
    fontSize: 18,
    color: theme.palette.primary.main,
    fontFamily: 'Work Sans',
  },
}));

interface CommandDetailsDialogProps {
  command?: Command;
  open: boolean;
  onClose: () => void;
}

const CommandDetailsDialog: React.FC<CommandDetailsDialogProps> = ({
  command,
  open,
  onClose,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={SlideTransition}
      scroll="body"
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => onClose()}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Détails de la commande
          </Typography>
          {command &&
            command.commandType !== 'on_site' &&
            (!mdDown ? (
              <>
                <Button
                  color="inherit"
                  onClick={() => {
                    command &&
                      validateCommand(command._id)
                        .then(() => {
                          enqueueSnackbar('Commande validée', {
                            variant: 'success',
                          });
                          EventEmitter.emit('REFRESH_NAVIGATION_BAR');
                          onClose();
                        })
                        .catch(() => {
                          enqueueSnackbar('Erreur lors de la validation', {
                            variant: 'error',
                          });
                        });
                  }}
                >
                  Valider la commande
                </Button>
                <Button
                  color="inherit"
                  onClick={() => {
                    command &&
                      revokeCommand(command._id)
                        .then(() => {
                          enqueueSnackbar('Commande refusée', {
                            variant: 'info',
                          });
                          EventEmitter.emit('REFRESH_NAVIGATION_BAR');
                          onClose();
                        })
                        .catch(() => {
                          enqueueSnackbar(
                            'Erreur lors du refus de la commande',
                            {
                              variant: 'error',
                            },
                          );
                        });
                  }}
                >
                  Refuser la commande
                </Button>
              </>
            ) : (
              <>
                <Tooltip title="Valider">
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      command &&
                        validateCommand(command._id)
                          .then(() => {
                            enqueueSnackbar('Commande validée', {
                              variant: 'success',
                            });
                            EventEmitter.emit('REFRESH_NAVIGATION_BAR');
                            EventEmitter.emit('REFRESH');
                            onClose();
                          })
                          .catch(() => {
                            enqueueSnackbar('Erreur lors de la validation', {
                              variant: 'error',
                            });
                          });
                    }}
                  >
                    <Check />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refuser">
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      command &&
                        revokeCommand(command._id)
                          .then(() => {
                            enqueueSnackbar('Commande refusée', {
                              variant: 'info',
                            });
                            EventEmitter.emit('REFRESH_NAVIGATION_BAR');
                            EventEmitter.emit('REFRESH');
                            onClose();
                          })
                          .catch(() => {
                            enqueueSnackbar(
                              'Erreur lors du refus de la commande',
                              {
                                variant: 'error',
                              },
                            );
                          });
                    }}
                  >
                    <Block />
                  </IconButton>
                </Tooltip>
              </>
            ))}
        </Toolbar>
      </AppBar>
      {command && (
        <Container maxWidth="md" className={classes.root}>
          <Grid container direction="column">
            <Divider className={classes.divider} />

            {command.restaurant && (
              <>
                <Grid item container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar
                      className={classes.restaurantImage}
                      src={command.restaurant.imageURL}
                      alt={command.restaurant.name}
                    />
                  </Grid>
                  <Grid item xs container direction="column">
                    <Grid item>
                      <Typography style={{ color: 'black' }} variant="h6">
                        {command.restaurant.name}
                      </Typography>
                    </Grid>
                    <Grid item container alignItems="center">
                      <Grid item>
                        <LocationOnIcon fontSize="small" />
                      </Grid>
                      <Grid item xs>
                        <Typography variant="h6" style={{ color: 'black' }}>
                          {command.restaurant.address}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container alignItems="center">
                      <Grid item>
                        <PhoneIcon fontSize="small" />
                      </Grid>
                      <Grid item xs>
                        <Typography
                          variant="h6"
                          component="a"
                          style={{ color: 'black' }}
                          href={`tel:${command.restaurant.phoneNumber}`}
                        >
                          {command.restaurant.phoneNumber}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Divider className={classes.divider} />
              </>
            )}

            <Grid container justify="space-between" alignItems="center">
              <Typography
                variant="h6"
                style={{ color: 'black', fontWeight: 'bold' }}
              >
                Détails
              </Typography>
              <Typography
                variant="h6"
                style={{ color: 'black', fontWeight: 'bold' }}
              >
                {command.priceless ? 'Sans prix' : 'Avec prix'}
              </Typography>
            </Grid>

            <Divider className={classes.divider} />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: theme.spacing(2),
                rowGap: theme.spacing(1),
              }}
            >
              <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                Nom et prénom
              </Typography>
              <Typography variant="h5">
                {command.relatedUser
                  ? `${command.relatedUser.name.first} ${command.relatedUser.name.last}`
                  : command.customer
                  ? command.customer.name
                  : 'Non spécifié'}
              </Typography>

              <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                Téléphone
              </Typography>
              <Typography variant="h5">
                {command.relatedUser
                  ? command.relatedUser.phoneNumber
                  : command.customer
                  ? command.customer.phoneNumber
                  : 'Non spécifié'}
              </Typography>

              {command.commandType === 'delivery' && (
                <>
                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Adresse de livraison
                  </Typography>
                  <Typography variant="h5">
                    {command.shippingAddress}
                  </Typography>

                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Appartement
                  </Typography>
                  <Typography variant="h5">{command.appartement}</Typography>

                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Étage
                  </Typography>
                  <Typography variant="h5">{command.etage}</Typography>

                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Type de livraison
                  </Typography>
                  <Typography variant="h5">
                    {command.optionLivraison === 'behind_the_door'
                      ? 'Derrière la porte'
                      : command.optionLivraison === 'on_the_door'
                      ? 'Devant la porte'
                      : "À l'extérieur"}
                  </Typography>

                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Date et heure de livraison
                  </Typography>
                  <Typography variant="h5">
                    {DateFormatter.format(command.shippingTime, true)}
                  </Typography>

                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Paiement
                  </Typography>
                  <Typography variant="h5">
                    {`${
                      command.paiementLivraison
                        ? 'À la livraison'
                        : 'Avant la livraison'
                    } - ${command.payed.status ? 'Payé' : 'Non payé'}`}
                  </Typography>
                </>
              )}

              {command.commandType === 'takeaway' && (
                <>
                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Date et heure de retrait
                  </Typography>
                  <Typography variant="h5">
                    {DateFormatter.format(command.shippingTime, true)}
                  </Typography>
                </>
              )}
            </div>

            <Divider className={classes.divider} />

            <Grid item container justify="space-between">
              <Grid item>
                <Typography variant="h6" component="p">
                  {'ID de commande: '}
                  <span className={classes.commandId}>
                    {NumberFormatter.format(command.code, {
                      minimumIntegerDigits: 6,
                    })}
                  </span>
                </Typography>
              </Grid>
              <Grid item>
                <Chip
                  className={clsx(classes.status, {
                    active: !!command.validated,
                    revoked: !!command.revoked,
                  })}
                  label={
                    <span className="translate">
                      {command.validated
                        ? 'Validée'
                        : command.revoked
                        ? 'Refusée'
                        : 'En attente'}
                    </span>
                  }
                />
              </Grid>
            </Grid>

            <Divider className={classes.divider} />

            {!!command.items.length && (
              <>
                <List
                  subheader={
                    <ListSubheader
                      disableGutters
                      className="translate"
                      disableSticky
                    >
                      Liste des plats commandés
                    </ListSubheader>
                  }
                >
                  {command.items.map((food) => {
                    if (!food.item) return null;

                    const {
                      item: {
                        _id,
                        imageURL,
                        name: { fr: name },
                        price,
                      },
                      options,
                      quantity,
                    } = food;

                    return (
                      <React.Fragment key={_id}>
                        <Divider />

                        <ListItem disableGutters>
                          <ListItemAvatar>
                            <Grid container alignItems="center">
                              <Typography style={{ width: 40 }} align="center">
                                {quantity}
                              </Typography>
                              <Avatar src={imageURL} alt={name} />
                            </Grid>
                          </ListItemAvatar>
                          <ListItemText
                            style={{ marginLeft: theme.spacing(2) }}
                          >
                            <Grid item container justify="space-between">
                              <Grid item>
                                <Typography>{name}</Typography>
                              </Grid>
                              <Grid item>
                                <Typography>
                                  {`PU: ${PriceFormatter.format(price)}`}
                                </Typography>
                              </Grid>
                            </Grid>
                          </ListItemText>
                        </ListItem>

                        <Divider />

                        <Grid
                          item
                          container
                          style={{
                            marginTop: theme.spacing(1),
                            marginBottom: theme.spacing(2),
                            paddingLeft: theme.spacing(14),
                          }}
                          direction="column"
                        >
                          {options.map(
                            ({ items, title }) =>
                              !!items.length && (
                                <Grid item container>
                                  <Typography style={{ fontWeight: 'bold' }}>
                                    {title}
                                  </Typography>
                                  {items.map(
                                    ({
                                      item: { _id, name, price },
                                      quantity,
                                    }) => (
                                      <React.Fragment key={_id}>
                                        <Grid
                                          container
                                          alignItems="center"
                                          justify="space-between"
                                        >
                                          <Grid
                                            item
                                            xs
                                            container
                                            style={{
                                              paddingLeft: theme.spacing(4),
                                            }}
                                          >
                                            <Grid
                                              item
                                              style={{ fontWeight: 'bold' }}
                                            >
                                              {quantity}
                                            </Grid>
                                            <Grid
                                              item
                                              style={{
                                                marginLeft: theme.spacing(2),
                                              }}
                                            >
                                              {name}
                                            </Grid>
                                          </Grid>
                                          {!!price && !!price.amount && (
                                            <Grid item>
                                              <Typography
                                                className={classes.itemPrice}
                                              >
                                                {`PU: ${PriceFormatter.format(
                                                  price,
                                                )}`}
                                              </Typography>
                                            </Grid>
                                          )}
                                        </Grid>
                                      </React.Fragment>
                                    ),
                                  )}
                                </Grid>
                              ),
                          )}
                        </Grid>
                      </React.Fragment>
                    );
                  })}
                </List>
                <Divider className={classes.divider} />
              </>
            )}

            {!!command.menus.length && (
              <>
                <List
                  subheader={
                    <ListSubheader
                      className="translate"
                      disableGutters
                      disableSticky
                    >
                      Liste des menus commandés
                    </ListSubheader>
                  }
                >
                  {command.menus.map(
                    ({
                      foods,
                      quantity,
                      item: {
                        _id,
                        imageURL,
                        price,
                        type,
                        foods: foodsInMenu,
                        name: { fr: name },
                      },
                    }) => {
                      const fixedPrice = type === 'fixed_price',
                        priceless = type === 'priceless';

                      return (
                        <React.Fragment key={_id}>
                          <Divider />

                          <ListItem disableGutters>
                            <ListItemAvatar>
                              <Grid container alignItems="center">
                                <Typography
                                  style={{ width: 40 }}
                                  align="center"
                                >
                                  {quantity}
                                </Typography>
                                <Avatar src={imageURL} alt={name}>
                                  {name.substr(0, 1)}
                                </Avatar>
                              </Grid>
                            </ListItemAvatar>
                            <ListItemText
                              style={{ marginLeft: theme.spacing(2) }}
                            >
                              <Grid container justify="space-between">
                                <Grid item>
                                  <Typography>{name}</Typography>
                                </Grid>
                                {fixedPrice && (
                                  <Grid item>
                                    <Typography>
                                      {`PU: ${PriceFormatter.format(price)}`}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </ListItemText>
                          </ListItem>

                          <Divider />

                          <div
                            style={{
                              marginLeft: theme.spacing(14),
                              marginBottom: theme.spacing(2),
                            }}
                          >
                            {foods.map(
                              ({
                                options,
                                food: {
                                  _id,
                                  imageURL,
                                  name: { fr: name },
                                  price,
                                },
                              }) => {
                                const foodInMenu = foodsInMenu.find(
                                  ({ food: f }) => f._id === _id,
                                );

                                return (
                                  <React.Fragment key={_id}>
                                    <ListItem disableGutters>
                                      <ListItemAvatar>
                                        <Avatar src={imageURL} alt={name} />
                                      </ListItemAvatar>
                                      <ListItemText
                                        style={{ marginLeft: theme.spacing(2) }}
                                      >
                                        <Grid container justify="space-between">
                                          <Grid item>
                                            <Typography>{name}</Typography>
                                          </Grid>
                                          {!priceless && (
                                            <Grid item>
                                              <Typography>
                                                {`${
                                                  !fixedPrice
                                                    ? `PU: ${PriceFormatter.format(
                                                        price,
                                                      )}`
                                                    : ''
                                                }${
                                                  fixedPrice &&
                                                  !!foodInMenu &&
                                                  !!foodInMenu.additionalPrice
                                                    .amount
                                                    ? ` + ${PriceFormatter.format(
                                                        foodInMenu.additionalPrice,
                                                      )}`
                                                    : ''
                                                }`}
                                              </Typography>
                                            </Grid>
                                          )}
                                        </Grid>
                                      </ListItemText>
                                    </ListItem>

                                    <Grid
                                      item
                                      container
                                      style={{ paddingLeft: theme.spacing(6) }}
                                      direction="column"
                                    >
                                      {options.map(
                                        ({ items, title }) =>
                                          !!items.length && (
                                            <Grid item container>
                                              <Typography
                                                style={{ fontWeight: 'bold' }}
                                              >
                                                {title}
                                              </Typography>
                                              {items.map(
                                                ({
                                                  item: { _id, name, price },
                                                  quantity,
                                                }) => (
                                                  <React.Fragment key={_id}>
                                                    <Grid
                                                      container
                                                      alignItems="center"
                                                      justify="space-between"
                                                    >
                                                      <Grid
                                                        item
                                                        xs
                                                        container
                                                        style={{
                                                          paddingLeft:
                                                            theme.spacing(4),
                                                        }}
                                                      >
                                                        <Grid
                                                          item
                                                          style={{
                                                            fontWeight: 'bold',
                                                          }}
                                                        >
                                                          {quantity}
                                                        </Grid>
                                                        <Grid
                                                          item
                                                          style={{
                                                            marginLeft:
                                                              theme.spacing(2),
                                                          }}
                                                        >
                                                          {name}
                                                        </Grid>
                                                      </Grid>
                                                      {!!price &&
                                                        !!price.amount && (
                                                          <Grid item>
                                                            <Typography
                                                              className={
                                                                classes.itemPrice
                                                              }
                                                            >
                                                              {`PU: ${PriceFormatter.format(
                                                                price,
                                                              )}`}
                                                            </Typography>
                                                          </Grid>
                                                        )}
                                                    </Grid>
                                                  </React.Fragment>
                                                ),
                                              )}
                                            </Grid>
                                          ),
                                      )}
                                    </Grid>
                                  </React.Fragment>
                                );
                              },
                            )}
                          </div>
                        </React.Fragment>
                      );
                    },
                  )}
                </List>
                <Divider className={classes.divider} />
              </>
            )}

            {command.commandType === 'delivery' && (
              <Grid
                container
                justify="space-between"
                alignItems="center"
                style={{ padding: '8px 0' }}
              >
                <Typography className="translate">
                  Frais de livraison
                </Typography>
                <Typography className="notranslate">
                  {PriceFormatter.format({
                    amount: command.restaurant?.deliveryPrice?.amount || 0,
                    currency: 'eur',
                  })}
                </Typography>
              </Grid>
            )}
            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <Typography className="translate">Total</Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.totalPrice}>
                  {PriceFormatter.format({
                    amount: estimateCommandPrice(command),
                    currency: 'eur',
                  })}
                </Typography>
              </Grid>
            </Grid>

            <Divider className={classes.divider} />

            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <Typography className="translate">Type de commande</Typography>
              </Grid>
              <Grid item>
                <Typography
                  variant="h6"
                  component="p"
                  style={{ textTransform: 'uppercase' }}
                >
                  {command.commandType === 'delivery'
                    ? 'Livraison'
                    : command.commandType === 'on_site'
                    ? 'Sur place'
                    : 'À emporter'}
                </Typography>
              </Grid>
            </Grid>

            <Divider className={classes.divider} />

            <Typography
              variant="h6"
              className="translate"
              gutterBottom
              style={{ textDecoration: 'underline' }}
            >
              Commentaire
            </Typography>

            <Typography style={{ color: !command.comment ? 'grey' : 'black' }}>
              {command.comment || 'Aucun commentaire'}
            </Typography>
          </Grid>
        </Container>
      )}
    </Dialog>
  );
};

export default CommandDetailsDialog;
