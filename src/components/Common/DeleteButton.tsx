import React from 'react';
import { Button, ButtonProps, Tooltip } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';

const DeleteButton: React.FC<ButtonProps> = (props) => {
  return (
    <Tooltip title="Supprimer">
      <Button
        color="primary"
        variant="contained"
        style={{
          minWidth: 'fit-content',
          borderRadius: 4,
          padding: 6,
          margin: 4,
        }}
        {...props}
      >
        <DeleteIcon />
      </Button>
    </Tooltip>
  );
};

export default DeleteButton;
