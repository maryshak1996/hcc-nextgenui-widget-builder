import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { FakeAppsDock } from '@app/FakeAppsDock/FakeAppsDock';
import { FakeBrowserChrome } from '@app/PcmDemo/FakeBrowserChrome';

/**
 * PCM “desktop”: one fake OS browser frame around **all** tab content — TechPulse article or the full HCC shell.
 */
const PcmDemoDesktopShell: React.FunctionComponent = () => (
  <>
    <div className="hcc-pcm-article-shell">
      <FakeBrowserChrome>
        <Outlet />
      </FakeBrowserChrome>
    </div>
    <FakeAppsDock />
  </>
);

export { PcmDemoDesktopShell };
