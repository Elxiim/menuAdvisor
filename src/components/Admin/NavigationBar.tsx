import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppBar,
  Badge,
  Button,
  IconButton,
  makeStyles,
  Toolbar,
  Tooltip,
} from '@material-ui/core';
import {
  ExitToApp as ExitToAppIcon,
  LocalShipping as LocalShippingIcon,
  Mail as MailIcon,
  Menu as MenuIcon,
  Place as PlaceIcon,
  Refresh as RefreshIcon,
  ShoppingBasket as ShoppingBasketIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@material-ui/icons';
import { useAuth } from '../../providers/authentication';
import { useSnackbar } from 'notistack';
import { useHistory, useLocation } from 'react-router';
import { Spacer } from '../Common';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { getMessageCount } from '../../services/message';
import EventEmitter from '../../services/EventEmitter';
import { getCommandCount } from '../../services/commands';
import { useDispatch } from '../../utils/redux';
import { setLoged } from '../../actions/event.action';

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: theme.palette.background.paper,
    color: 'black',
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  activeButton: {
    position: 'relative',
    '&::after': {
      display: 'block',
      content: "''",
      width: 5,
      height: 5,
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
      position: 'absolute',
      bottom: 5,
      left: '50%',
      transform: 'translateX(-50%)',
    },
  },
  centerButton: {
    margin: theme.spacing(0, 1),
    textTransform: 'none',
    borderRadius: 1000,
    [theme.breakpoints.down('sm')]: {
      padding: 5,
      minWidth: 50,
      '& span.label': {
        display: 'none',
      },
      '& .icon': {
        marginLeft: 0,
        marginRight: 0,
      },
    },
  },
}));

interface NavigationBarProps {
  handleDrawerToggle: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  handleDrawerToggle,
}) => {
  const classes = useStyles();
  const { logout, isAdmin, isRestaurantAdmin, restaurant, user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [unseenMessages, setUnseenMessages] = useState<number>(0);
  const [dc, setDc] = useState<number>(0);
  const [tc, setTc] = useState<number>(0);
  const [osc, setOsc] = useState<number>(0);
  const [newMessage, setNewMessage] = useState<number>(0);
  const [newDelivery, setNewDelivery] = useState<number>(0);
  const [newTakeaway, setNewTakeaway] = useState<number>(0);
  const [newOnSite, setNewOnSite] = useState<number>(0);

  const interval = useRef<number>();

  const history = useHistory();
  const location = useLocation();

  const handleCommandClick = useCallback<
    React.MouseEventHandler<HTMLAnchorElement>
  >(
    (e) => {
      if (isRestaurantAdmin && !restaurant) {
        e.preventDefault();
        enqueueSnackbar(
          'Vous devez être associé à un restaurant pour pouvoir accéder à cette section',
          {
            variant: 'info',
          },
        );
      }
    },
    [enqueueSnackbar, isRestaurantAdmin, restaurant],
  );

  const fetch = useCallback(() => {
    let target: string | null = user?._id || null;
    if (isAdmin) target = null;
    getMessageCount({ target, read: false }).then(({ count }) => {

      if (newMessage < count) {
        enqueueSnackbar(`Vous avez reçu un nouveau message`, {
          variant: 'info',
        });
      }

      setNewMessage(count);
      setUnseenMessages(count)
    });

    if (isRestaurantAdmin && !restaurant) return;
    getCommandCount('delivery', {
      restaurant: isRestaurantAdmin ? restaurant?._id || '' : undefined,
      validated: false,
    }).then((data) => {
      
      if (newDelivery < data) {
        enqueueSnackbar('Vous avez des commandes de livraison non lus', {
          variant: 'info',
        });
      }

      setNewDelivery(data);
      setDc(data)
    });

    getCommandCount('takeaway', {
      restaurant: isRestaurantAdmin ? restaurant?._id || '' : undefined,
      validated: false,
    }).then((data) => {
      
      if (newTakeaway < data) {
        enqueueSnackbar('Vous avez des commandes a emporter non lus', {
          variant: 'info',
        });
      }

      setNewTakeaway(data);
      setTc(data)
    });

    getCommandCount('on_site', {
      restaurant: isRestaurantAdmin ? restaurant?._id || '' : undefined,
      validated: false,
    }).then((data) => {

      if (newOnSite < data) {
        enqueueSnackbar('Vous avez des commandes sur place non lus', {
          variant: 'info',
        });
      }

      setNewOnSite(data);
      setOsc(data)
    });
  }, [isAdmin, isRestaurantAdmin, restaurant, user?._id, enqueueSnackbar, newDelivery, newMessage, newOnSite, newTakeaway]);

  useEffect(() => {
    const onRefresh = () => fetch();

    EventEmitter.on('REFRESH_NAVIGATION_BAR', onRefresh);

    return () => {
      EventEmitter.removeListener('REFRESH_NAVIGATION_BAR', onRefresh);
    };
  }, [fetch]);

  useEffect(() => {
    interval.current = window.setInterval(fetch, 15000);

    return () => window.clearInterval(interval.current);
  }, [fetch]);

  return (
    <>
      <AppBar position="static" className={classes.appBar} elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            title="Actualiser la liste"
            color="inherit"
            aria-label="refresh"
            onClick={() => EventEmitter.emit('REFRESH')}
          >
            <RefreshIcon />
          </IconButton>
          <Spacer />
          <Badge color="primary" badgeContent={dc + tc + osc}>
            <Tooltip title="Tous">
              <Button
                className={classes.centerButton}
                component={Link}
                to="/commands"
                variant="outlined"
                color={
                  location.pathname.startsWith('/commands')
                    ? 'primary'
                    : 'inherit'
                }
                classes={{ startIcon: 'icon' }}
                startIcon={<ShoppingCartIcon />}
                onClick={handleCommandClick}
              >
                <span className="label">Tous</span>
              </Button>
            </Tooltip>
          </Badge>
          <Badge color="primary" badgeContent={dc}>
            <Tooltip title="Livraison">
              <Button
                className={classes.centerButton}
                component={Link}
                to="/delivery-commands"
                variant="outlined"
                color={
                  location.pathname.startsWith('/delivery-commands')
                    ? 'primary'
                    : 'inherit'
                }
                classes={{ startIcon: 'icon' }}
                startIcon={<LocalShippingIcon />}
                onClick={handleCommandClick}
              >
                <span className="label">Livraison</span>
              </Button>
            </Tooltip>
          </Badge>
          <Badge color="primary" badgeContent={tc}>
            <Tooltip title="À emporter">
              <Button
                className={classes.centerButton}
                component={Link}
                to="/takeaway-commands"
                variant="outlined"
                color={
                  location.pathname.startsWith('/takeaway-commands')
                    ? 'primary'
                    : 'inherit'
                }
                classes={{ startIcon: 'icon' }}
                startIcon={<ShoppingBasketIcon />}
                onClick={handleCommandClick}
              >
                <span className="label">À emporter</span>
              </Button>
            </Tooltip>
          </Badge>
          <Badge color="primary" badgeContent={osc}>
            <Tooltip title="Sur place">
              <Button
                className={classes.centerButton}
                component={Link}
                to="/onsite-commands"
                variant="outlined"
                color={
                  location.pathname.startsWith('/onsite-commands')
                    ? 'primary'
                    : 'inherit'
                }
                classes={{ startIcon: 'icon' }}
                startIcon={<PlaceIcon />}
                onClick={handleCommandClick}
              >
                <span className="label">Sur place</span>
              </Button>
            </Tooltip>
          </Badge>
          <Spacer />
          <Tooltip title="Messages">
            <IconButton
              component={Link}
              to="/messages"
              color="inherit"
              aria-label="open messages"
              className={clsx({
                [classes.activeButton]: location.pathname.startsWith(
                  '/messages',
                ),
              })}
            >
              <Badge color="primary" badgeContent={unseenMessages}>
                <MailIcon
                  color={
                    location.pathname.startsWith('/messages')
                      ? 'primary'
                      : undefined
                  }
                />
              </Badge>
            </IconButton>
          </Tooltip>
          <h2>{user?.name.first}</h2>
          <Tooltip title="Se déconnecter">
            <IconButton
              color="inherit"
              aria-label="logout"
              onClick={() => {
                logout().then(async () => {
                  await dispatch(setLoged(false));
                  history.push('/login');
                  enqueueSnackbar('Déconnecté!', { variant: 'success' });
                });
              }}
            >
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default NavigationBar;
