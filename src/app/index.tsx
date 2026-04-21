import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { DashboardDataProvider } from '@app/DashboardHub/DashboardDataContext';
import { AppRoutes } from '@app/routes';
import '@app/app.css';

const App: React.FunctionComponent = () => (
  <Router>
    <DashboardDataProvider>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </DashboardDataProvider>
  </Router>
);

export default App;