import { makeStyles, Paper, TableCell } from '@material-ui/core';
import { Category as CategoryIcon } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PageHeader from '../components/Admin/PageHeader';
import FormDialog from '../components/Common/FormDialog';
import CategoryForm, {
  CategoryFormType,
} from '../components/Forms/CategoryForm';
import TableImageCell from '../components/Table/TableImageCell';
import useDeleteSelection from '../hooks/useDeleteSelection';
import Category from '../models/Category.model';
import EventEmitter from '../services/EventEmitter';
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/categories';
import EditButton from '../components/Common/EditButton';
import DeleteButton from '../components/Common/DeleteButton';
import useDelete from '../hooks/useDelete';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import { Loading } from '../components/Common';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<Category>[] = [
  {
    id: 'name',
    label: 'Nom',
    disableSorting: true,
  },
  {
    id: 'imageURL',
    label: 'Image',
    disableSorting: true,
    alignment: 'center',
  },
];

const CategoryListPage: React.FC = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<Category[]>([]);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const modif = useRef<CategoryFormType>();

  const { enqueueSnackbar } = useSnackbar();
  const { handleDeleteSelection } = useDeleteSelection(
    deleteCategory,
    selected,
    {
      onDeleteRecord: (id) =>
        setRecords((v) => v.filter(({ _id }) => _id !== id)),
    },
  );
  const { handleDelete } = useDelete(deleteCategory);

  const fetch = useCallback(() => {
    setLoading(true);
    setRecords([]);
    getCategories()
      .then((data) => setRecords(data))
      .catch(() =>
        enqueueSnackbar('Erreur lors du chargement des données...', {
          variant: 'error',
        }),
      )
      .finally(() => setLoading(false));
  }, [enqueueSnackbar]);

  const saveData = useCallback(
    (data: CategoryFormType) => {
      setSaving(true);
      if (modif.current && data._id)
        updateCategory(data._id, data)
          .then(() => {
            enqueueSnackbar('Catégorie modifiée avec succès', {
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
        addCategory(data)
          .then(() => {
            enqueueSnackbar('Catégorie ajoutée avec succès', {
              variant: 'success',
            });
            setOpenForm(false);
            EventEmitter.emit('REFRESH');
          })
          .catch(() => {
            enqueueSnackbar("Erreur lors de l'ajout", {
              variant: 'error',
            });
          })
          .finally(() => {
            setSaving(false);
          });
    },
    [enqueueSnackbar],
  );

  const showModification = useCallback((category: Category) => {
    const {
      _id,
      priority,
      name: { fr: name },
      imageURL
    } = category;

    modif.current = {
      _id,
      priority,
      name,
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
        title="Catégories"
        subTitle="Liste des catégories de restaurant"
        icon={CategoryIcon}
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
          addButtonLabel="Ajouter une catégorie"
          onAddClick={() => setOpenForm(true)}
          loading={loading}
          emptyPlaceholder="Aucune catégorie"
          options={{
            orderBy: 'priority',
            enableDragAndDrop: true,
            hasActionsColumn: true,
            customResolvers: {
              name: (c) => c.name.fr,
            },
            filters: [
              {
                id: 'name',
                label: 'Nom',
                type: 'STRING',
                alwaysOn: true,
              },
            ],
            selectOnClick: false,
            onRowClick: (_, category) => showModification(category),
            onDragEnd: (source, destination) =>
              setRecords((records) => {
                const p1 = source.priority,
                  p2 = destination.priority;

                if (p1 === p2) return records;

                if (p1 > p2) {
                  // Queueing up
                  records
                    .filter(({ priority }) => priority >= p2 && priority < p1)
                    .forEach((v) => {
                      v.priority++;
                      updateCategory(v._id, { priority: v.priority });
                    });
                } else {
                  // Queueing down
                  records
                    .filter(({ priority }) => priority > p1 && priority <= p2)
                    .forEach((v) => {
                      v.priority--;
                      updateCategory(v._id, { priority: v.priority });
                    });
                }
                source.priority = p2;
                updateCategory(source._id, { priority: p2 });

                return [...records];
              }),
            customComparators: {
              name: (a, b) => b.name.fr.localeCompare(a.name.fr),
            },
          }}
        >
          {(category) => {
            const {
              _id,
              name: { fr: name },
              imageURL,
            } = category;

            return (
              <React.Fragment key={_id}>
                <TableCell>{name}</TableCell>
                <TableImageCell
                  height={50}
                  width={(50 * 16) / 9}
                  alt={name}
                  src={imageURL}
                  showOnClick
                />
                <TableCell>
                  <EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      showModification(category);
                    }}
                  />
                  <DeleteButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setUpdating(true);
                      handleDelete(_id)
                        .then(() =>
                          setRecords((v) =>
                            v.filter(({ _id: id }) => _id !== id),
                          ),
                        )
                        .finally(() => setUpdating(false));
                    }}
                  />
                </TableCell>
              </React.Fragment>
            );
          }}
        </TableContainer>
      </Paper>
      <FormDialog
        title={
          modif.current ? 'Modifier une catégorie' : 'Ajouter une catégorie'
        }
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          modif.current = undefined;
        }}
      >
        <CategoryForm
          initialValues={modif.current}
          saving={saving}
          onCancel={() => {
            setOpenForm(false);
            modif.current = undefined;
          }}
          onSave={saveData}
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

export default CategoryListPage;
