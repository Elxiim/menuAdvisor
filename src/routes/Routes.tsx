import React, { lazy, Suspense, useState } from 'react';
import { CircularProgress, CssBaseline, makeStyles } from '@material-ui/core';
import { Redirect, Route, Switch } from 'react-router-dom';
import NavigationDrawer from '../components/Admin/NavigationDrawer';
import { AdminRoute, ProtectedRoute } from '../components/Route';
import LoginPage from '../pages/Login';
import ForgotPasswordPage from '../pages/ForgotPassword';
import NotFoundPage from '../pages/NotFound';
import NavigationBar from '../components/Admin/NavigationBar';
import { grey } from '@material-ui/core/colors';
import CustomScrollbar from 'react-custom-scrollbars';
import { useAuth } from '../providers/authentication';
import AdminMessage from '../components/Data/AdminMessage';
import { useSelector } from '../utils/redux';

const RestaurantListPage = lazy(() => import('../pages/RestaurantList'));
const FoodListPage = lazy(() => import('../pages/FoodList'));
const MenuListPage = lazy(() => import('../pages/MenuList'));
const CategoryListPage = lazy(() => import('../pages/CategoryList'));
const FoodTypeListPage = lazy(() => import('../pages/FoodTypeList'));
const AttributeListPage = lazy(() => import('../pages/AttributeList'));
const AccompanimentListPage = lazy(() => import('../pages/AccompanimentList'));
const UserListPage = lazy(() => import('../pages/UserList'));
const PostListPage = lazy(() => import('../pages/PostList'));
const MessageListPage = lazy(() => import('../pages/MessageList'));
const QRCodePage = lazy(() => import('../pages/QrCode'));
const PlatRecommanderList = lazy(() => import('../pages/PlatRecommanderList'))
const DashboardListPage = lazy(() => import('../pages/DashboardList'))

const DeliveryCommandListPage = lazy(
  () => import('../pages/DeliveryCommandList'),
);
const TakeawayCommandListPage = lazy(
  () => import('../pages/TakeawayCommandList'),
);
const OnSiteCommandListPage = lazy(() => import('../pages/OnSiteCommandList'));
const CommandPDFViewerPage = lazy(() => import('../pages/CommandPDFViewer'));
const CommandList = lazy(() => import('../pages/CommandList'));
const AdminMessageList = lazy(() => import('../pages/AdminMessageList'));
const RestoRecommanderListPage = lazy(() => import('../pages/RestoRecommanderList'));


const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  main: {
    flexGrow: 1,
  },
  content: {
    backgroundColor: grey[300],
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: `${theme.shadows[10]} inset`,
    minHeight: `calc(100vh - ${(theme.mixins.toolbar.height as number) + theme.spacing(2)
      }px)`,
    '&>:first-child': {
      padding: theme.spacing(2),
    },
  },
}));

const AdminRoutes: React.FC = () => {
  const classes = useStyles();

  const { restaurant, isRestaurantAdmin } = useAuth();
  const {loged}: any = useSelector(({event}: any) => ({loged: event.loged}));

  const [openMobileDrawer, setOpenMobileDrawer] = useState(false);

  return (
    <>
      <div className={classes.root}>
        <CssBaseline />
        <NavigationDrawer
          mobileOpen={openMobileDrawer}
          onClose={() => setOpenMobileDrawer(false)}
        />
        <main className={classes.main}>
          <NavigationBar
            handleDrawerToggle={() => setOpenMobileDrawer((v) => !v)}
          />
          {loged && isRestaurantAdmin && <AdminMessage />}
          <CustomScrollbar
            style={{
              height: 'auto',
              width: 'auto',
            }}
            autoHide
            className={classes.content}
          >
            <Suspense
              fallback={
                <div
                  style={{
                    minHeight: 200,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <CircularProgress color="primary" />
                </div>
              }
            >
              <Switch>
              <AdminRoute
                  exact
                  path="/dashboard"
                  component={DashboardListPage}
                />
                <Route
                  exact
                  path="/"
                  render={() =>
                    restaurant ? (
                      <Redirect to="/delivery-commands" />
                    ) : (
                      <Redirect to="/commands" />
                    )
                  }
                />
                <Route
                  exact
                  path="/restaurants"
                  component={RestaurantListPage}
                />
                <Route exact path="/foods" component={FoodListPage} />
                <Route exact path="/menus" component={MenuListPage} />
                <AdminRoute
                  exact
                  path="/categories"
                  component={CategoryListPage}
                />
                <Route exact path="/types" component={FoodTypeListPage} />
                <AdminRoute
                  exact
                  path="/attributes"
                  component={AttributeListPage}
                />
                <Route
                  exact
                  path="/accompaniments"
                  component={AccompanimentListPage}
                />
                <AdminRoute exact path="/users" component={UserListPage} />
                <AdminRoute exact path="/blogs" component={PostListPage} />
                <AdminRoute exact path="/restoRecommander" component={RestoRecommanderListPage} />
                <Route exact path="/messages" component={MessageListPage} />
                <Route exact path="/qrcode" component={QRCodePage} />
                <Route
                  exact
                  path="/commands"
                  component={CommandList}
                />
                <Route
                  exact
                  path="/delivery-commands"
                  component={DeliveryCommandListPage}
                />
                <Route
                  exact
                  path="/takeaway-commands"
                  component={TakeawayCommandListPage}
                />
                <Route
                  exact
                  path="/onsite-commands"
                  component={OnSiteCommandListPage}
                />
                <Route
                  exact
                  path="/pdf-command/:id"
                  render={({
                    match: {
                      params: { id },
                    },
                  }) => <CommandPDFViewerPage commandId={id} />}
                />
                <Route
                  exact
                  path="/adminMessage"
                  component={AdminMessageList}
                />
                  <AdminRoute
                  exact
                  path="/platRecommander"
                  component={PlatRecommanderList}
                />
                <Route path="**" component={NotFoundPage} />
                
              </Switch>
            </Suspense>
          </CustomScrollbar>
        </main>
      </div>
    </>
  );
};

const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/login" component={LoginPage} />
      <Route exact path="/forgotPassword" component={ForgotPasswordPage} />
      <ProtectedRoute path="/" component={AdminRoutes} />
    </Switch>
  );
};

export default Routes;
