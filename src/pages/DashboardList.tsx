import React, { useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { Dashboard as DashboardIcon } from '@material-ui/icons';
import PageHeader from '../components/Admin/PageHeader';
import { useSnackbar } from 'notistack';
import EventEmitter from '../services/EventEmitter';
import MediaCard from '../components/Common/Card'
import {  getDashboard } from '../services/dashboard';

const useStyles = makeStyles((theme) => ({
    root: {
      padding: theme.spacing(2),
    },
  }));

const DashboardListPage = () => {
    const classes = useStyles();

    const [loading, setLoading] = useState<boolean>(false);
    const [dashboard, setDashboard] = useState<any>([]);
    const { enqueueSnackbar } = useSnackbar();

    const fetch = useCallback(() => {
        setLoading(true);
        setDashboard([])
        getDashboard()
          .then((data) => {
            setDashboard(data);
            console.log("DAAAATAAAAA HEREEEEEE......",data)
            console.log("RESTO DAY.....>>>", data.best_resto_day[0]?.resto)
          })
          .catch(() => {
            enqueueSnackbar('Erreur lors du chargement des données...', {
              variant: 'error',
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }, [enqueueSnackbar]);

      useEffect(() => {
        const onRefresh = () => {
          fetch();
        };
    
        EventEmitter.on('REFRESH', onRefresh);
    
        return () => {
          EventEmitter.removeListener('REFRESH', onRefresh);
        };
      }, [fetch]);
    
      useEffect(() => {
        fetch();
      }, [fetch]);
    
      return (
        <>
            <PageHeader
                title="Dashboard"
                subTitle="Commande | Chiffre d'affaire"
                icon={DashboardIcon}
            />
          {dashboard.best_resto_day && <MediaCard dashboardDay = {dashboard.dashboard_day}
                     dashboardWeek = {dashboard.dashboard_week}
                     dashboardMonth = {dashboard.dashboard_month}
                     dashboardYear = {dashboard.dashboard_year} 
                     chiffreAffaireDay = {dashboard.chiffre_affaire_day}
                     chiffreAffaireWeek = {dashboard.chiffre_affaire_week}
                     chiffreAffaireMonth = {dashboard.chiffre_affaire_month}
                     chiffreAffaireYear = {dashboard.chiffre_affaire_year}
                     BestRestoDayName = {dashboard.best_resto_day[0]?.resto}
                     BestRestoCommande = {dashboard.best_resto_day[0]?.nombre_commande}
                     BestRestoSomme = {dashboard.best_resto_day[1]?.price}
                     BestRestoWeekName = {dashboard.best_resto_week[0]?.resto}
                     BestRestoWeekSomme = {dashboard.best_resto_week.length > 1 ? dashboard.best_resto_week[2]?.price : dashboard.best_resto_week[1]?.price}
                    BestRestoWeekCommande = {dashboard.best_resto_week[0]?.nombre_commande}
                    BestRestoMonthName = {dashboard.best_resto_month[0]?.resto}
                    BestRestoMonthSomme = { dashboard.best_resto_month[1]?.price }
                    BestRestoMonthCommande = {dashboard.best_resto_month[0]?.nombre_commande}
                    BestRestoYearName = {dashboard.best_resto_year[0]?.resto}
                    BestRestoYearSomme = { dashboard.best_resto_year[1]?.price }
                    BestRestoYearCommande = {dashboard.best_resto_year[0]?.nombre_commande}
         /> }
          {/* <h1>Nombre de commande</h1> 
          <h2>Aujourd'hui: <span>{dashboard.dashboard_day}</span></h2> 
          <h2>Cette Semaine: <span>{dashboard.dashboard_week}</span></h2> 
          <h2>Ce mois: <span>{dashboard.dashboard_month}</span></h2> 
          <h2>Cette annee: <span>{dashboard.dashboard_year}</span></h2> 
          <h1>Chiffre d'affaire</h1>  
          <h2>Aujourd'hui: <span>{dashboard.chiffre_affaire_day}</span></h2> 
          <h2>Ce mois: <span>{dashboard.chiffre_affaire_month}</span></h2> 
          <h2>Cette annee: <span>{dashboard.chiffre_affaire_year}</span></h2> 
          <h1>Meilleur Restaurant: </h1>
          <h2>Aujourd'hui: <span>{dashboard.best_resto_day[0]?.resto}</span> </h2>
          <h2>somme total : <span>{dashboard.best_resto_day[1]?.price}</span></h2>
          <h2>Nombre Total commande: <span>{dashboard.best_resto_day[0]?.nombre_commande}</span></h2> 
          <h2>Cette semaine: <span>{dashboard.best_resto_week[0]?.resto}</span> </h2>
          <h2>somme total : <span>{dashboard.best_resto_week.length > 1 ? dashboard.best_resto_week[2]?.price : dashboard.best_resto_week[1]?.price}</span></h2>
          <h2>Nombre Total commande: <span>{dashboard.best_resto_week[0]?.nombre_commande}</span></h2> 
          <h2>Cet mois: <span>{dashboard.best_resto_month[0]?.resto}</span> </h2>
          <h2>somme total : <span>{dashboard.best_resto_month[1]?.price}</span></h2>
          <h2>Nombre Total commande: <span>{dashboard.best_resto_month[0]?.nombre_commande}</span></h2> 
          <h2>Cette annee: <span>{dashboard.best_resto_month[0]?.resto}</span> </h2>
          <h2>somme total : <span>{dashboard.best_resto_month[1]?.price}</span></h2>
          <h2>Nombre Total commande: <span>{dashboard.best_resto_month[0]?.nombre_commande}</span></h2>  */}
        </>
      )
}

export default DashboardListPage