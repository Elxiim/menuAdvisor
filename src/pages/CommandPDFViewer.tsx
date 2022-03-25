import {
  CircularProgress,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import { PictureAsPdf } from '@material-ui/icons';
import { PDFViewer } from '@react-pdf/renderer';
import React, { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/Admin/PageHeader';
import PDFCommand from '../components/Data/PDFCommand';
import Command from '../models/Command.model';
import { getCommandById } from '../services/commands';
import EventEmitter from '../services/EventEmitter';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  viewer: {
    border: 'none',
    minHeight: 600,
  },
}));

interface CommandPDFViewerProps {
  commandId: string;
}

const CommandPDFViewer: React.FC<CommandPDFViewerProps> = ({ commandId }) => {
  const classes = useStyles();

  const [loading, setLoading] = useState<boolean>(false);
  const [command, setCommand] = useState<Command>();

  const fetch = useCallback(() => {
    setLoading(true);
    getCommandById(commandId)
      .then((data) => setCommand(data))
      .finally(() => setLoading(false));
  }, [commandId]);

  useEffect(() => {
    const onRefresh = () => fetch();

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
      <PageHeader title="PDF" subTitle="PDF" icon={PictureAsPdf} />
      <Paper className={classes.root}>
        {loading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        ) : command ? (
          <PDFViewer className={classes.viewer} width="100%">
            <PDFCommand command={command} />
          </PDFViewer>
        ) : (
          <Typography variant="h5" align="center">
            Commande non trouvée
          </Typography>
        )}
      </Paper>
    </>
  );
};

export default CommandPDFViewer;
