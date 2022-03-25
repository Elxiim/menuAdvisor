import { hot } from 'react-hot-loader';
import { MuiThemeProvider } from '@material-ui/core';
import { defaultTheme } from './theme';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './routes/Routes';
import { SnackbarProvider } from 'notistack';
import { AuthConsumer, AuthProvider } from './providers/authentication';
import Loading from './components/Common/Loading';
import { ConfirmProvider } from 'material-ui-confirm';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { ImageViewerProvider } from './components/Common/ImageViewer';

function App() {
  return (
    <MuiThemeProvider theme={defaultTheme}>
      <SnackbarProvider maxSnack={3}>
        <ConfirmProvider>
          <ImageViewerProvider>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <Router>
                <AuthProvider>
                  <AuthConsumer>
                    {({ initialized }) => (
                      <>
                        <Loading open={!initialized} />
                        <Routes />
                      </>
                    )}
                  </AuthConsumer>
                </AuthProvider>
              </Router>
            </MuiPickersUtilsProvider>
          </ImageViewerProvider>
        </ConfirmProvider>
      </SnackbarProvider>
    </MuiThemeProvider>
  );
}

export default hot(module)(App);
