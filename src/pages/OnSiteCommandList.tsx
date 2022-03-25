import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles, Paper, TableCell } from '@material-ui/core';
import {
  Check,
  Close,
  LocationOn as LocationOnIcon,
  Remove,
} from '@material-ui/icons';
import PageHeader from '../components/Admin/PageHeader';
import Command from '../models/Command.model';
import {
  deleteCommand,
  validateCommand,
} from '../services/commands';
import { useSnackbar } from 'notistack';
import EventEmitter from '../services/EventEmitter';
import useDeleteSelection from '../hooks/useDeleteSelection';
import NumberFormatter from '../utils/NumberFormatter';
import DateFormatter from '../utils/DateFormatter';
import moment from 'moment';
import { useAuth } from '../providers/authentication';
import PDFButton from '../components/Common/PDFButton';
import { useHistory } from 'react-router';
import CommandDetailsDialog from '../components/Common/CommandDetailsDialog';
import ShowButton from '../components/Common/ShowButton';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import { Loading } from '../components/Common';
import { useDispatch } from 'react-redux';
import { useSelector } from '../utils/redux';
import { getAllCommands } from '../actions/commandes.action';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<Command>[] = [
  {
    id: 'code',
    label: 'Numéro de commande',
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
  },
  {
    id: 'createdAt',
    label: 'Date de la commande',
  },
  {
    id: 'validated',
    label: 'Validation',
  },
];

const OnSiteCommandList: React.FC = () => {
  const classes = useStyles();
  const { isRestaurantAdmin, restaurant } = useAuth();

  const dispatch = useDispatch();

  const { data, isLoaded }: any = useSelector(({ commands }: any) => ({
    data: commands.onSite,
    isLoaded: commands.isLoaded
  }));

  const [records, setRecords] = useState<Command[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCommand, setSelectedCommand] = useState<Command>();
  const [selected, setSelected] = useState<string[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();
  const { handleDeleteSelection } = useDeleteSelection(
    deleteCommand,
    selected,
    {
      onDeleteRecord: (id) =>
        setRecords((v) => v.filter(({ _id }) => _id !== id)),
    },
  );

  useEffect(
    () => {
      setRecords(data);
    },
    [data]
  );

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(getAllCommands(isRestaurantAdmin ? restaurant?._id || '' : undefined));
    } catch (e) {
      console.log(e)
      enqueueSnackbar('Erreur lors du chargement...', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, isRestaurantAdmin, restaurant, dispatch]);

  const history = useHistory();

  const downloadPDF = useCallback(
    (id: string) => {
      history.push(`/pdf-command/${id}`);
    },
    [history],
  );

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
    if (!isLoaded) {
      fetch();
    }
  }, [fetch, isLoaded]);

  return (
    <>
      <PageHeader
        icon={LocationOnIcon}
        title="Commandes"
        subTitle="Liste des commandes sur place"
      />
      <Paper className={classes.root}>
        <TableContainer
          headCells={headCells}
          records={records}
          selected={selected}
          onSelectedChange={setSelected}
          showAddButton={false}
          onDeleteClick={() => {
            setUpdating(true);
            handleDeleteSelection().finally(() => {
              EventEmitter.emit('REFRESH_NAVIGATION_BAR');
              setUpdating(false);
            });
          }}
          loading={loading}
          emptyPlaceholder="Aucune commande"
          options={{
            orderBy: 'code',
            hasActionsColumn: true,
            filters: [
              {
                id: 'code',
                label: 'Numero de commande',
                type: 'NUMBER',
              },
              {
                id: 'restaurant',
                label: 'Restaurant',
                type: 'RESTAURANT',
                alwaysOn: isRestaurantAdmin ? false : true,
              },
              {
                id: 'createdAt',
                label: 'Date',
                type: 'DATE',
                alwaysOn: true,
              },
              {
                id: 'validated',
                label: 'Validé',
                type: 'BOOLEAN',
              },
              {
                id: 'commandType',
                label: 'Type',
                type: 'COMMAND_TYPE',
              },
            ],
            selectOnClick: false,
            onRowClick: (_, command) => setSelectedCommand(command),
            customComparators: {
              restaurant: (a, b) =>
                b.restaurant.name.localeCompare(a.restaurant.name),
              createdAt: (a, b) =>
                moment(a.createdAt).diff(b.createdAt, 'days'),
              payed: (a, b) =>
                b.payed.status > a.payed.status
                  ? 1
                  : b.payed.status === a.payed.status
                    ? 0
                    : -1,
            },
          }}
        >
          {(command) => {
            const { _id, code, restaurant, createdAt, validated, revoked } =
              command;

            return (
              <>
                <TableCell
                  style={{
                    fontWeight: !validated && !revoked ? 'bold' : undefined,
                  }}
                >
                  {NumberFormatter.format(code, { minimumIntegerDigits: 5 })}
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: !validated && !revoked ? 'bold' : undefined,
                  }}
                >
                  {restaurant?.name}
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: !validated && !revoked ? 'bold' : undefined,
                  }}
                >
                  {DateFormatter.format(createdAt)}
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: !validated && !revoked ? 'bold' : undefined,
                  }}
                >
                  {validated ? (
                    <Check htmlColor="green" />
                  ) : revoked ? (
                    <Close htmlColor="red" />
                  ) : (
                    <Remove />
                  )}
                </TableCell>
                <TableCell>
                  <ShowButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!validated) {
                        validateCommand(_id).then(() => {
                          EventEmitter.emit('REFRESH_NAVIGATION_BAR');
                          setRecords((records) => {
                            command.validated = true;
                            return [...records];
                          });
                        });
                      }
                      setSelectedCommand(command);
                    }}
                  />
                  <PDFButton
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPDF(_id);
                    }}
                  />
                </TableCell>
              </>
            );
          }}
        </TableContainer>
      </Paper>

      <CommandDetailsDialog
        open={!!selectedCommand}
        command={selectedCommand}
        onClose={() => setSelectedCommand(undefined)}
      />

      <Loading
        open={updating}
        semiTransparent
        backgroundColor="rgba(0, 0, 0, .7)"
      />
    </>
  );
};

export default OnSiteCommandList;
