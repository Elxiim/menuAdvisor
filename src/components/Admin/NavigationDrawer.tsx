import {
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import {
  Dashboard as DashboardIcon,
  Fastfood as FastfoodIcon,
  MenuBook as MenuBookIcon,
  Restaurant as RestaurantIcon,
  Category as CategoryIcon,
  SvgIconComponent,
  EditAttributes as EditAttributesIcon,
  People as PeopleIcon,
  Book as BookIcon,
  ChevronLeft,
  CropFree,
  List as ListIcon,
  ViewModule as ViewModuleIcon,
  ShoppingCartOutlined as CommandIcon,
  Message,
  Pages,
  NearMeOutlined,
  RedeemOutlined
} from '@material-ui/icons';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import Logo from '../Common/Logo';
import { useAuth } from '../../providers/authentication';
import { Spacer } from '../Common';
import { useSnackbar } from 'notistack';
import { web_url } from '../../constants/url';

const drawerWidth = 300;

const useStyles = makeStyles<Theme, { mini?: boolean }>((theme) => ({
  drawer: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    [theme.breakpoints.up('md')]: {
      width: ({ mini }) => (mini ? theme.spacing(7) + 1 : drawerWidth),
      height: '100vh',
      flexShrink: 0,
    },
  },
  drawerPaper: ({ mini }) => ({
    overflowX: 'hidden',
    width: mini ? theme.spacing(7) + 1 : drawerWidth,
    borderRight: 'none',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  toolbar: {
    justifyContent: 'center',
    marginBottom: 'auto',
    height: 'fit-content',
  },
  links: {
    marginBottom: 'auto',
  },
  link: {
    position: 'relative',
    transition: theme.transitions.create('color', {
      duration: theme.transitions.duration.enteringScreen,
      easing: theme.transitions.easing.sharp,
    }),
    '&.active': {
      color: theme.palette.primary.main,
    },
    '&.active svg': {
      transformOrigin: 'right bottom',
      animation: `$activeIconAnimation ${theme.transitions.duration.enteringScreen}ms ${theme.transitions.easing.sharp}`,
    },
    '&::before': {
      backgroundColor: theme.palette.primary.main,
      content: "''",
      display: 'block',
      position: 'absolute',
      left: 0,
      height: '100%',
      width: 0,
      transition: theme.transitions.create('width', {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.sharp,
      }),
    },
    '&.active::before': {
      width: 3,
    },
  },
  '@keyframes activeIconAnimation': {
    '0%': {
      transform: 'none',
    },
    '50%': {
      transform: 'rotateZ(45deg)',
    },
    '100%': {
      transform: 'none',
    },
  },
  minimizeIcon: {
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    transform: ({ mini }) => (mini ? 'rotate(-180deg)' : 'none'),
  },
  logo: {
    height: theme.mixins.toolbar.height,
  },
  logoImage: {
    width: ({ mini }) => (!mini ? 60 : 40),
  },
  logoText: {
    fontSize: ({ mini }) =>
      !mini ? theme.typography.pxToRem(28) : theme.typography.h6.fontSize,
  },
  restoImg: {
    width: ({ mini }) => (!mini ? 60 : 40),
  },
  title: {
    marginLeft: 8,
    fontWeight: 'bold'
  },
  restoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
}));

type NavLink = {
  title: string;
  icon: SvgIconComponent;
  href: string;
  adminOnly?: boolean;
  restoOnly?: boolean;
};

const links: NavLink[] = [
  {
    title: 'Dashboard',
    icon: DashboardIcon,
    href: '/dashboard',
    restoOnly: false,
  },
  {
    title: 'Commandes',
    icon: CommandIcon,
    href: '/commands',
    restoOnly: false,
  },
  {
    title: 'Restaurants',
    icon: RestaurantIcon,
    href: '/restaurants',
    restoOnly: false,
  },
  {
    title: 'Plats',
    icon: FastfoodIcon,
    href: '/foods',
    restoOnly: false,
  },
  {
    title: 'Menus',
    icon: MenuBookIcon,
    href: '/menus',
    restoOnly: false,
  },
  {
    title: 'Catégories',
    icon: CategoryIcon,
    href: '/categories',
    adminOnly: true,
    restoOnly: false,
  },
  {
    title: 'Types',
    icon: ListIcon,
    href: '/types',
    restoOnly: false,
  },
  {
    title: 'Attributs',
    icon: EditAttributesIcon,
    href: '/attributes',
    adminOnly: true,
    restoOnly: false,
  },
  {
    title: 'Accompagnements',
    icon: ViewModuleIcon,
    href: '/accompaniments',
    restoOnly: false,
  },
  {
    title: 'Utilisateurs',
    icon: PeopleIcon,
    href: '/users',
    adminOnly: true,
    restoOnly: false,
  },
  {
    title: 'Blogs',
    icon: BookIcon,
    href: '/blogs',
    adminOnly: true,
    restoOnly: false,
  },
  {
    title: 'Code QR',
    icon: CropFree,
    href: '/qrcode',
    restoOnly: false,
  },
  {
    title: 'Messages',
    icon: Message,
    href: '/adminMessage',
    adminOnly: true,
    restoOnly: false,
  }, 
  {
    title: 'Resto Recommander',
    icon: NearMeOutlined,
    href: '/restoRecommander',
    adminOnly: true,
    restoOnly: false,
  },
  {
    title: 'Plat Recommander',
    icon: RedeemOutlined,
    href: '/platRecommander',
    adminOnly: true,
    restoOnly: false,
  },
  {
    title: 'Voir ma page',
    icon: Pages,
    href: '/maPage',
    restoOnly: true,
  }
];

interface NavigationDrawerProps {
  mobileOpen?: boolean;
  onClose?: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  mobileOpen,
  onClose,
}) => {
  const [mini, setMini] = useState(false);

  const classes = useStyles({ mini });
  const { isAdmin, isRestaurantAdmin, restaurant } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const { pathname } = useLocation();

  const drawer = (
    <div className={classes.root}>
      <Logo
        className={classes.logo}
        classes={{ image: classes.logoImage, text: classes.logoText }}
      />
      <div style={{marginLeft: '8px'}}>
        {(isRestaurantAdmin && restaurant) && (
          mini 
            ? (
                <img className={classes.restoImg} src={restaurant?.imageURL} alt={restaurant?.name} />
              ) 
            : (
              <div className={classes.restoContainer}>
                <img className={classes.restoImg} src={restaurant?.imageURL} alt={restaurant?.name} />
                <Typography variant="h5" className={classes.title}>
                  {restaurant?.name}
                </Typography>
              </div>
              )
        )}
      </div>
     {!mini &&  <div style={{marginLeft: '8px'}}>
        {isRestaurantAdmin ? 'RESTAURATEUR' : isAdmin ? 'ADMINISTRATEUR' : null}
      </div>}
      <Toolbar className={classes.toolbar}>
        <Spacer />
        <Tooltip title={mini ? 'Agrandir' : 'Réduire'}>
          <IconButton
            edge={!mini ? 'end' : false}
            color="inherit"
            onClick={() => setMini((v) => !v)}
          >
            <ChevronLeft className={classes.minimizeIcon} />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <List className={classes.links}>
        {links.map(
          ({ title, icon: Icon, href, adminOnly, restoOnly }) =>
            !restoOnly && (!adminOnly || isAdmin)
            ? (
                <ListItem
                  className={clsx(classes.link, {
                    active: pathname.startsWith(href),
                  })}
                  button
                  key={title}
                  component={Link}
                  to={href}
                  title={mini ? title : undefined}
                  onClick={(e: any) => {
                    if (isRestaurantAdmin && !restaurant) {
                      enqueueSnackbar(
                        'Vous devez être associé à un restaurant pour pouvoir accéder à cette section',
                        {
                          variant: 'info',
                        },
                      );
                      return e.preventDefault();
                    }
                    onClose?.({}, 'backdropClick');
                  }}
                >
                  <ListItemIcon>
                    <Icon
                      color={pathname.startsWith(href) ? 'primary' : 'inherit'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    style={{ whiteSpace: 'nowrap' }}
                    primary={title}
                  />
                </ListItem>
              )
            : (restoOnly && isRestaurantAdmin) 
            ? (
                <ListItem
                  className={clsx(classes.link, {
                    active: pathname.startsWith(href),
                  })}
                  button
                  key={title}
                  // component={Link}
                  // to={href}
                  // target='_blank'
                  title={mini ? title : undefined}
                  onClick={(e: any) => {
                    if (isRestaurantAdmin && !restaurant) {
                      enqueueSnackbar(
                        'Vous devez être associé à un restaurant pour pouvoir accéder à cette section',
                        {
                          variant: 'info',
                        },
                      );
                      return e.preventDefault();
                    }
                    onClose?.({}, 'backdropClick');
                  }}
                >
                  <ListItemIcon>
                    <Icon
                      color={pathname.startsWith(href) ? 'primary' : 'inherit'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <a href={`${web_url}/restaurants/${restaurant?._id}`} rel='noreferrer' target='_blank' style={{textDecoration: 'none', color: 'black'}}>{title}</a>
                  </ListItemText>
                </ListItem>
              )
            : null
        )}
      </List>
    </div>
  );

  return (
    <nav className={classes.drawer}>
      <Hidden mdUp>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden smDown>
        <Drawer
          elevation={0}
          classes={{ paper: classes.drawerPaper }}
          variant="persistent"
          open
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default NavigationDrawer;
