import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/chatbot/dist/css/main.css';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { DashboardDataProvider } from '@app/DashboardHub/DashboardDataContext';
import { CveCopyFailArticlePage } from '@app/PcmDemo/CveCopyFailArticlePage';
import { PcmArticleRouteLayout } from '@app/PcmDemo/PcmArticleRouteLayout';
import { PcmDemoDesktopShell } from '@app/PcmDemo/PcmDemoDesktopShell';
import { PcmBrowserProvider } from '@app/PcmDemo/PcmBrowserContext';
import { AppRoutes } from '@app/routes';
import { SupportCaseChatContinuationProvider } from '@app/Support/SupportCaseChatContinuationContext';
import { CveTroubleshootDemoProvider } from '@app/RhelVulnerability/CveTroubleshootDemoContext';
import '@app/app.css';

/**
 * PCM demo: pathless layout wraps the fake OS browser once; tab content is either `/pcm/*` (article) or full `AppLayout`.
 */
const routerBasename = process.env.ROUTER_BASENAME ?? '';

const App: React.FunctionComponent = () => (
  <Router basename={routerBasename}>
    <SupportCaseChatContinuationProvider>
    <CveTroubleshootDemoProvider>
    <PcmBrowserProvider>
      <DashboardDataProvider>
        <Routes>
          <Route path="/cve-copy-fail-article" element={<Navigate to="/pcm/article" replace />} />
          <Route path="/pcm" element={<Navigate to="/pcm/article" replace />} />
          <Route element={<PcmDemoDesktopShell />}>
            <Route path="/pcm/*" element={<Outlet />}>
              <Route element={<PcmArticleRouteLayout />}>
                <Route index element={<Navigate to="article" replace />} />
                <Route path="article" element={<CveCopyFailArticlePage />} />
              </Route>
            </Route>
            <Route
              path="*"
              element={
                <AppLayout>
                  <AppRoutes />
                </AppLayout>
              }
            />
          </Route>
        </Routes>
      </DashboardDataProvider>
    </PcmBrowserProvider>
    </CveTroubleshootDemoProvider>
    </SupportCaseChatContinuationProvider>
  </Router>
);

export default App;