import React from 'react';
import { Button, ButtonProps, Tooltip } from '@material-ui/core';
import { Visibility as VisibilityIcon } from '@material-ui/icons';

const ShowButton: React.FC<ButtonProps> = (props) => {
  return (
    <Tooltip title="Afficher">
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
        <VisibilityIcon />
      </Button>
    </Tooltip>
  );
};

export default ShowButton;
