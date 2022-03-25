import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';

export default function useDelete(
  deleteRecord: (id: string) => Promise<void>,
  options?: {
    confirmationDialogTitle?: string;
    confirmationDialogText?: string;
  },
) {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();

  const handleDelete = (id: string) =>
    confirm({
      title: options?.confirmationDialogTitle || 'Supprimer la ligne?',
      description:
        options?.confirmationDialogText ||
        'Êtes-vous sûr de vouloir supprimer cette ligne?',
      confirmationText: 'Supprimer',
      cancellationText: 'Annuler',
    }).then(() =>
      deleteRecord(id)
        .then(() => {
          enqueueSnackbar('Ligne supprimée', { variant: 'success' });
        })
        .catch(() => {
          enqueueSnackbar('Erreur lors de la suppression', {
            variant: 'error',
          });
          return Promise.reject();
        }),
    );

  return { handleDelete };
}
