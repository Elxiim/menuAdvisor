import { createMuiTheme } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';

const defaultTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#dc143c',
      light: '#e2bcc4',
    },
    secondary: blue,
    background: {
      default: '#ffffff',
    },
  },
  mixins: {
    toolbar: {
      height: 64,
    },
  },
  typography: {
    fontFamily: 'Raleway',
    fontSize: 12,
  },
});

defaultTheme.typography.h5 = {
  ...defaultTheme.typography.h5,
  fontSize: 14,
};

export default defaultTheme;
