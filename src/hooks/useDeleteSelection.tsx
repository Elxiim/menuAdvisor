import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';

export default function useDeleteSelection(
  deleteRecord: (id: string) => Promise<void>,
  selected: string[],
  options?: {
    onDeleteRecord?: (id: string) => void;
    confirmationDialogTitle?: string;
    confirmationDialogText?: string;
  },
) {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();

  const handleDeleteSelection: () => Promise<void> = () =>
    confirm({
      title: options?.confirmationDialogTitle || 'Supprimer la sélection?',
      description:
        options?.confirmationDialogText ||
        'Êtes-vous sûr de vouloir supprimer la sélection?',
      confirmationText: 'Supprimer',
      cancellationText: 'Annuler',
    }).then(() =>
      Promise.all(
        selected.map((id) =>
          deleteRecord(id).then(() => options?.onDeleteRecord?.(id)),
        ),
      )
        .then((results) => {
          enqueueSnackbar(
            `${results.length} ligne${results.length > 1 ? 's' : ''} supprimée${
              results.length > 1 ? 's' : ''
            } avec succès`,
            { variant: 'success' },
          );
        })
        .catch((reasons) => {
          enqueueSnackbar(
            reasons.length < selected.length
              ? `Certaines lignes n'ont pas pu être supprimées`
              : 'Erreur lors des suppressions',
            { variant: 'error' },
          );
          return Promise.reject();
        }),
    );

  return { handleDeleteSelection };
}
