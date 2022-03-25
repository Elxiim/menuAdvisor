import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import logo from '../../assets/img/logo.png';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
    alignItems: 'center',
    padding: theme.spacing(1),
    '&>div:first-child': {
      display: 'flex',
      alignItems: 'center',
    },
  },
  logo: {
    width: 40,
    transition: theme.transitions.create(['width', 'height'], {
      duration: theme.transitions.duration.enteringScreen,
      easing: theme.transitions.easing.sharp,
    }),
  },
  textContainer: {
    marginLeft: theme.spacing(1),
    transition: theme.transitions.create(['font-size', 'margin'], {
      duration: theme.transitions.duration.enteringScreen,
      easing: theme.transitions.easing.sharp,
    }),
    '& *': {
      fontSize: 'inherit',
    },
  },
}));

interface LogoProps {
  className?: string;
  classes?: {
    container?: string;
    image?: string;
    text?: string;
  };
}

const Logo: React.FC<LogoProps> = ({ className, classes: cls }) => {
  const classes = useStyles();

  return (
    <div className={clsx(classes.container, className, cls?.container)}>
      <div>
        <img
          className={clsx(classes.logo, cls?.image)}
          src={logo}
          alt="menu-advisor"
        />
      </div>
      <div className={clsx(classes.textContainer, cls?.text)}>
        <Typography variant="h6" component="span">
          Menu
        </Typography>{' '}
        <Typography variant="h6" component="span" color="primary">
          Advisor
        </Typography>
      </div>
    </div>
  );
};

export default Logo;
