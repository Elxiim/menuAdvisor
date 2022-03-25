import React from 'react';
import { Button, ButtonProps, Tooltip } from '@material-ui/core';
import { Edit as EditIcon } from '@material-ui/icons';

const EditButton: React.FC<ButtonProps> = (props) => {
  return (
    <Tooltip title="Modifier">
      <Button
        color="secondary"
        variant="contained"
        style={{
          minWidth: 'fit-content',
          borderRadius: 4,
          padding: 6,
          margin: 4,
        }}
        {...props}
      >
        <EditIcon />
      </Button>
    </Tooltip>
  );
};

export default EditButton;
