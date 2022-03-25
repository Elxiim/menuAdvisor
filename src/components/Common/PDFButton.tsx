import React from 'react';
import { Button, ButtonProps, Tooltip } from '@material-ui/core';
import { PictureAsPdf as PDFIcon } from '@material-ui/icons';

const PDFButton: React.FC<ButtonProps> = (props) => {
  return (
    <Tooltip title="Exporter en PDF">
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
        <PDFIcon />
      </Button>
    </Tooltip>
  );
};

export default PDFButton;
