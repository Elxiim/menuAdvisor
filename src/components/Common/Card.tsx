import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 140,
  },
});

interface DashboardProps {
    dashboardDay: number,
    dashboardWeek: number,
    dashboardMonth: number,
    dashboardYear: number,
    chiffreAffaireDay: number,
    chiffreAffaireWeek: number,
    chiffreAffaireMonth: number,
    chiffreAffaireYear: number,
    BestRestoDayName: string,
    BestRestoSomme: number,
    BestRestoCommande: number,
    BestRestoWeekName: string,
    BestRestoWeekSomme: number,
    BestRestoWeekCommande: number,
    BestRestoMonthName: string,
    BestRestoMonthSomme: number,
    BestRestoMonthCommande: number,
    BestRestoYearName: string,
    BestRestoYearSomme: number,
    BestRestoYearCommande: number
  }

const MediaCard : React.FC<DashboardProps> = ({
    dashboardDay,
    dashboardWeek,
    dashboardMonth,
    dashboardYear,
    chiffreAffaireDay,
    chiffreAffaireWeek,
    chiffreAffaireMonth,
    chiffreAffaireYear,
    BestRestoDayName,
    BestRestoSomme,
    BestRestoCommande,
    BestRestoWeekName,
    BestRestoWeekSomme,
    BestRestoWeekCommande,
    BestRestoMonthName,
    BestRestoMonthSomme,
    BestRestoMonthCommande,
    BestRestoYearName,
    BestRestoYearSomme,
    BestRestoYearCommande
  }) => {
  const classes = useStyles();

  return (
    <>
    <h2>Nombre de commandes</h2>
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Aujourd'hui: { dashboardDay }</span>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
         <Typography gutterBottom variant="h5" component="h2">
           <span>Cette semaine: { dashboardWeek }</span>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
           <span>Cet mois: { dashboardMonth }</span>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
           <span>Cette annee: { dashboardYear }</span>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
    {/* <Typography gutterBottom variant="h5" component="h2">
           <span>Cette semaine: { dashboardWeek }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Cet mois: { dashboardMonth }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Cette annee: { dashboardYear }</span>
          </Typography> */}

    <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
         <h2>Chiffre d'affaire</h2>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Aujourd'hui: { chiffreAffaireDay }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Cette semaine: { chiffreAffaireWeek }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Cet mois: { chiffreAffaireMonth }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Cette annee: { chiffreAffaireYear }</span>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>

      <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
         <h2>Meilleur Restaurant</h2>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Aujourd'hui: { BestRestoDayName }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Nombre commande total: { BestRestoSomme }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Total : { BestRestoCommande }</span>
          </Typography>

          <Typography gutterBottom variant="h5" component="h2">
           <span>Cette semaine: { BestRestoWeekName }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Nombre commande total: { BestRestoWeekSomme }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Total : { BestRestoWeekCommande }</span>
          </Typography>

          <Typography gutterBottom variant="h5" component="h2">
           <span>Cette mois: { BestRestoMonthName }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Nombre commande total: { BestRestoMonthSomme }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Total : { BestRestoMonthCommande }</span>
          </Typography>

          <Typography gutterBottom variant="h5" component="h2">
           <span>Cette annee: { BestRestoYearName }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Nombre commande total: { BestRestoYearSomme }</span>
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
           <span>Total : { BestRestoYearCommande }</span>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card> 
    </>
  );
}

export default MediaCard
