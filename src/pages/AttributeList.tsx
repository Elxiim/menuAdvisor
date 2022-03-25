import { makeStyles, Paper, TableCell } from '@material-ui/core';
import {
  Check,
  Close,
  EditAttributes as EditAttributesIcon,
} from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PageHeader from '../components/Admin/PageHeader';
import { Loading } from '../components/Common';
import DeleteButton from '../components/Common/DeleteButton';
import EditButton from '../components/Common/EditButton';
import FormDialog from '../components/Common/FormDialog';
import AttributeForm, {
  AttributeFormType,
} from '../components/Forms/AttributeForm';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import TableImageCell from '../components/Table/TableImageCell';
import useDelete from '../hooks/useDelete';
import useDeleteSelection from '../hooks/useDeleteSelection';
import FoodAttribute from '../models/FoodAttribute.model';
import { useAuth } from '../providers/authentication';
import EventEmitter from '../services/EventEmitter';
import {
  addFoodAttribute,
  deleteFoodAttribute,
  getFoodAttributes,
  updateFoodAttribute,
} from '../services/foodattributes';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<FoodAttribute>[] = [
  {
    id: 'locales',
    label: 'Nom',
  },
  {
    id: 'tag',
    label: 'Allergène',
  },
  {
    id: 'imageURL',
    label: 'Image',
    alignment: 'center',
    disableSorting: true,
  },
];

const AttributeListPage: React.FC = () => {
  const classes = useStyles();

  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<FoodAttribute[]>([]);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const modif = useRef<AttributeFormType>();

  const { enqueueSnackbar } = useSnackbar();
  const { handleDeleteSelection } = useDeleteSelection(
    deleteFoodAttribute,
    selected,
    {
      onDeleteRecord: (id) =>
        setRecords((v) => v.filter(({ _id }) => _id !== id)),
    },
  );
  const { handleDelete } = useDelete(deleteFoodAttribute);

  const fetch = useCallback(() => {
    setLoading(true);
    setRecords([]);
    getFoodAttributes()
      .then((data) => {
        setRecords(data);
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

  const saveData = useCallback(
    (data: AttributeFormType) => {
      setSaving(true);
      if (modif.current && data._id)
        updateFoodAttribute(data._id, data)
          .then(() => {
            enqueueSnackbar('Attribut modifié avec succès', {
              variant: 'success',
            });
            setOpenForm(false);
            EventEmitter.emit('REFRESH');
          })
          .catch(() => {
            enqueueSnackbar('Erreur lors de la modification', {
              variant: 'error',
            });
          })
          .finally(() => {
            modif.current = undefined;
            setSaving(false);
          });
      else
        addFoodAttribute(data)
          .then(() => {
            enqueueSnackbar('Attribut ajouté avec succès', {
              variant: 'success',
            });
            setOpenForm(false);
            EventEmitter.emit('REFRESH');
          })
          .catch(() => {
            enqueueSnackbar("Erreur lors de l'ajout", { variant: 'error' });
          })
          .finally(() => {
            setSaving(false);
          });
    },
    [enqueueSnackbar],
  );

  const showModification = useCallback((attribute: FoodAttribute) => {
    const {
      _id,
      tag,
      locales: { fr: name },
      imageURL
    } = attribute;

    modif.current = {
      _id,
      name,
      isAllergen: tag.startsWith('allergen'),
      imageURL
    };
    setOpenForm(true);
  }, []);

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
        title="Attributs"
        subTitle="Liste des attributs"
        icon={EditAttributesIcon}
      />
      <Paper className={classes.root}>
        <TableContainer
          headCells={headCells}
          records={records}
          selected={selected}
          onSelectedChange={setSelected}
          onDeleteClick={() => {
            setUpdating(true);
            handleDeleteSelection().finally(() => setUpdating(false));
          }}
          onAddClick={() => setOpenForm(true)}
          addButtonLabel="Ajouter un attribut"
          loading={loading}
          emptyPlaceholder="Aucune publication"
          options={{
            selectableRows: isAdmin,
            orderBy: '_id',
            hasActionsColumn: true,
            customComparators: {
              locales: (a, b) => b.locales.fr.localeCompare(a.locales.fr),
            },
            selectOnClick: false,
            onRowClick: (_, attribute) => showModification(attribute),
          }}
        >
          {(attribute) => {
            const {
              _id,
              locales: { fr: name },
              tag,
              imageURL,
            } = attribute;

            const isAllergen = tag.startsWith('allergen');

            return (
              <React.Fragment key={_id}>
                <TableCell>{name}</TableCell>
                <TableCell>
                  {isAllergen ? (
                    <Check htmlColor="green" />
                  ) : (
                    <Close htmlColor="red" />
                  )}
                </TableCell>
                <TableImageCell noHoverEffect alt={name} src={imageURL} />
                <TableCell>
                  <EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      showModification(attribute);
                    }}
                  />
                  {isAdmin && (
                    <DeleteButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(_id)
                          .then(() =>
                            setRecords((v) =>
                              v.filter(({ _id: id }) => id !== _id),
                            ),
                          )
                          .finally(() => setUpdating(false));
                      }}
                    />
                  )}
                </TableCell>
              </React.Fragment>
            );
          }}
        </TableContainer>
      </Paper>
      <FormDialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          modif.current = undefined;
        }}
        title={modif.current ? 'Modifier un attribut' : 'Ajouter un attribut'}
      >
        <AttributeForm
          modification={!!modif.current}
          initialValues={modif.current}
          onSave={saveData}
          onCancel={() => {
            setOpenForm(false);
            modif.current = undefined;
          }}
          saving={saving}
        />
      </FormDialog>

      <Loading
        open={updating}
        semiTransparent
        backgroundColor="rgba(0, 0, 0, .7)"
      />
    </>
  );
};

export default AttributeListPage;
