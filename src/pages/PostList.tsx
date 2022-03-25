import { makeStyles, Paper, TableCell } from '@material-ui/core';
import { Book as BookIcon } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PageHeader from '../components/Admin/PageHeader';
import FormDialog from '../components/Common/FormDialog';
import TableImageCell from '../components/Table/TableImageCell';
import useDeleteSelection from '../hooks/useDeleteSelection';
import Post from '../models/Post.model';
import EventEmitter from '../services/EventEmitter';
import { addPost, deletePost, getPosts, updatePost } from '../services/post';
import PostForm, { PostFormType } from '../components/Forms/PostForm';
import useDelete from '../hooks/useDelete';
import EditButton from '../components/Common/EditButton';
import DeleteButton from '../components/Common/DeleteButton';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import { Loading } from '../components/Common';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const headCells: HeadCell<Post>[] = [
  {
    id: 'title',
    label: 'Titre',
  },
  {
    id: 'description',
    label: 'Description',
  },
  {
    id: 'imageURL',
    label: 'Image mobile',
    alignment: 'center',
    disableSorting: true,
  },
  {
    id: 'imageWebURL',
    label: 'Image web',
    alignment: 'center',
    disableSorting: true,
  },
];

const PostListPage: React.FC = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<Post[]>([]);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const modif = useRef<PostFormType>();

  const { enqueueSnackbar } = useSnackbar();
  const { handleDeleteSelection } = useDeleteSelection(deletePost, selected, {
    onDeleteRecord: (id) =>
      setRecords((v) => v.filter(({ _id }) => _id !== id)),
  });
  const { handleDelete } = useDelete(deletePost);

  const fetch = useCallback(() => {
    setLoading(true);
    setRecords([]);
    getPosts()
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
    (data: PostFormType) => {
      setSaving(true);
      if (modif.current && data._id)
        updatePost(data._id, data)
          .then(() => {
            enqueueSnackbar('Publication modifiée avec succès', {
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
            setSaving(false);
            modif.current = undefined;
          });
      else
        addPost(data)
          .then(() => {
            enqueueSnackbar('Publication ajoutée avec succès', {
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

  const showModification = useCallback((post: Post) => {
    const { _id, title, description, url, imageURL, imageWebURL, priority } = post;

    modif.current = {
      _id,
      title,
      description,
      url,
      imageURL,
      imageWebURL,
      priority
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
        title="Blog"
        subTitle="Liste des publications"
        icon={BookIcon}
      />
      <Paper className={classes.root}>
        <TableContainer
          headCells={headCells}
          records={records}
          selected={selected}
          onSelectedChange={setSelected}
          onAddClick={() => setOpenForm(true)}
          onDeleteClick={() => {
            setUpdating(true);
            handleDeleteSelection().finally(() => setUpdating(false));
          }}
          addButtonLabel="Ajouter une publication"
          loading={loading}
          emptyPlaceholder="Aucune publication"
          options={{
            orderBy: 'priority',
            hasActionsColumn: true,
            selectOnClick: false,
            enableDragAndDrop: true,
            onRowClick: (_, post) => showModification(post),
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
                      updatePost(v._id, { priority: v.priority });
                    });
                } else {
                  // Queueing down
                  records
                    .filter(({ priority }) => priority > p1 && priority <= p2)
                    .forEach((v) => {
                      v.priority--;
                      updatePost(v._id, { priority: v.priority });
                    });
                }
                source.priority = p2;
                updatePost(source._id, { priority: p2 });

                return [...records];
              }),
              // customComparators: {
              //   title: (a, b) => b.title.localeCompare(a.title),
              // },
          }}
        >
          {(post) => {
            const { _id, title, description, imageURL, imageWebURL } = post;

            return (
              <React.Fragment key={_id}>
                <TableCell>{title}</TableCell>
                <TableCell>{description}</TableCell>
                <TableImageCell height={80} alt={title} src={imageURL} />
                <TableImageCell height={80} alt={title} src={imageWebURL} />
                <TableCell>
                  <EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      showModification(post);
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
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          modif.current = undefined;
        }}
        title={
          modif.current ? 'Modifier une publication' : 'Ajouter une publication'
        }
      >
        <PostForm
          initialValues={modif.current}
          saving={saving}
          onSave={saveData}
          onCancel={() => {
            setOpenForm(false);
            modif.current = undefined;
          }}
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

export default PostListPage;
