import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { DashboardDataProvider } from '@app/DashboardHub/DashboardDataContext';
import { PinnedDashboardsProvider } from '@app/DashboardHub/PinnedDashboardsContext';
import { FavoritedServicesProvider } from '@app/favoriteServices/FavoritedServicesContext';
import { PatternFlyThemeProvider } from '@app/theme/PatternFlyThemeProvider';
import { AppRoutes } from '@app/routes';
import '@app/app.css';

const routerBasename = process.env.ROUTER_BASENAME ?? '';

const App: React.FunctionComponent = () => (
  <Router basename={routerBasename}>
    <PatternFlyThemeProvider>
      <DashboardDataProvider>
        <PinnedDashboardsProvider>
          <FavoritedServicesProvider>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </FavoritedServicesProvider>
        </PinnedDashboardsProvider>
      </DashboardDataProvider>
    </PatternFlyThemeProvider>
  </Router>
);

export default App;