import { makeStyles, useTheme } from '@material-ui/core';
import React, { createContext, useContext, useRef, useState } from 'react';
import Viewer from 'react-viewer';

type Image = {
  src: string;
  alt: string;
};

type ImageViewerContext = {
  show: (image: Image) => Promise<void>;
};

const imageViewerContext = createContext<ImageViewerContext>({
  show: async () => {},
});

const useStyles = makeStyles((theme) => ({
  viewer: {
    '& .react-viewer-navbar': {
      display: 'none !important',
    },
    '& [data-key="scaleX"]': {
      display: 'none !important',
    },
    '& [data-key="scaleY"]': {
      display: 'none !important',
    },
  },
}));

interface ImageViewerProviderProps {}

export const ImageViewerProvider: React.FC<ImageViewerProviderProps> = ({
  children,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const [visible, setVisible] = useState<boolean>(false);
  const [images, setImages] = useState<Image[]>();
  const resolveReject = useRef<
    [(value: void | PromiseLike<void>) => void, (reason?: any) => void]
  >();

  const show: (image: Image) => Promise<void> = (image) =>
    new Promise((resolve, reject) => {
      resolveReject.current = [resolve, reject];
      setImages([image]);
      setVisible(true);
    });

  return (
    <imageViewerContext.Provider
      value={{
        show,
      }}
    >
      {children}
      <Viewer
        visible={visible}
        images={images}
        zIndex={theme.zIndex.drawer + 10}
        className={classes.viewer}
        drag={false}
        changeable={false}
        noImgDetails
        rotatable={false}
        showTotal={false}
        onClose={() => {
          setVisible(false);
          resolveReject.current?.[0]();
        }}
      />
    </imageViewerContext.Provider>
  );
};

export const useImageViewer = () => useContext(imageViewerContext);
