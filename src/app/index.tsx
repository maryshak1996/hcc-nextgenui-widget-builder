import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { DashboardDataProvider } from '@app/DashboardHub/DashboardDataContext';
import { PatternFlyThemeProvider } from '@app/theme/PatternFlyThemeProvider';
import { AppRoutes } from '@app/routes';
import '@app/app.css';

const routerBasename = process.env.ROUTER_BASENAME ?? '';

const App: React.FunctionComponent = () => (
  <Router basename={routerBasename}>
    <PatternFlyThemeProvider>
      <DashboardDataProvider>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </DashboardDataProvider>
    </PatternFlyThemeProvider>
  </Router>
);

export default App;