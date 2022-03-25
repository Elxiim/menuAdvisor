import React from 'react';
import Image from 'material-ui-image';
import {
  CircularProgress,
  makeStyles,
  TableCell,
  Theme,
} from '@material-ui/core';
import { useImageViewer } from '../Common/ImageViewer';

const useStyles = makeStyles<Theme, { noHoverEffect?: boolean }>((theme) => ({
  container: {
    padding: theme.spacing(1),
    cursor: 'pointer',
    '&>div': {
      overflow: 'hidden',
    },
    '& img': {
      transition: `${theme.transitions.create(
        ['transform', 'filterBrightness', 'filterSaturate', 'opacity'],
        {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        },
      )} !important`,
    },
    '&:hover img': ({ noHoverEffect }) =>
      noHoverEffect
        ? {
            transform: 'scale(1.2)',
          }
        : undefined,
  },
}));

interface TableImageCellProps {
  alt: string;
  src: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
  noHoverEffect?: boolean;
  showOnClick?: boolean;
}

const TableImageCell: React.FC<TableImageCellProps> = ({
  alt,
  src,
  width,
  height = 30,
  style = {},
  imageStyle = {},
  noHoverEffect,
  showOnClick,
}) => {
  const classes = useStyles({ noHoverEffect });
  const { show } = useImageViewer();

  return (
    <TableCell className={classes.container}>
      {src && (
        <Image
          alt={alt}
          src={src}
          style={{
            ...style,
            paddingTop: 0,
            width: width || 'fit-content',
            height,
            backgroundColor: 'transparent',
            margin: 'auto',
          }}
          imageStyle={{
            ...imageStyle,
            width: width || 'auto',
            height,
            position: 'relative',
          }}
          cover
          loading={<CircularProgress size={20} />}
          onClick={(e) => {
            if (showOnClick) {
              e.stopPropagation();
              show({ src, alt });
            }
          }}
        />
      )}
    </TableCell>
  );
};

export default TableImageCell;
