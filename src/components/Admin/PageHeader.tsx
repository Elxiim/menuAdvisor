import React from 'react';
import { Paper, Card, Typography, makeStyles } from '@material-ui/core';
import { SvgIconComponent } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#fdfdff',
  },
  pageHeader: {
    padding: theme.spacing(2),
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  pageIcon: {
    display: 'inline-block',
    padding: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  pageTitle: {
    paddingLeft: theme.spacing(4),
    '& .MuiTypography-subtitle2': {
      opacity: '0.6',
    },
  },
}));

interface PageHeaderProps {
  elevation?: number;
  title: string;
  subTitle: string;
  icon: SvgIconComponent;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  elevation,
  title,
  subTitle,
  icon: Icon,
}) => {
  const classes = useStyles();

  return (
    <Paper elevation={elevation} square className={classes.root}>
      <div className={classes.pageHeader}>
        <Card className={classes.pageIcon}>{<Icon />}</Card>
        <div className={classes.pageTitle}>
          <Typography variant="h6" component="div" color="primary">
            {title}
          </Typography>
          <Typography variant="subtitle1" component="div">
            {subTitle}
          </Typography>
        </div>
      </div>
    </Paper>
  );
};

export default PageHeader;
