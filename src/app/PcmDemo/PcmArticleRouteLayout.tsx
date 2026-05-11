import * as React from 'react';
import { Outlet } from 'react-router-dom';

/** `/pcm/*` pages only — article body scroll lock; no nested fake browser (chrome comes from `PcmDemoDesktopShell`). */
const PcmArticleRouteLayout: React.FunctionComponent = () => {
  React.useEffect(() => {
    document.body.classList.add('hcc-pcm-article-route');
    return () => document.body.classList.remove('hcc-pcm-article-route');
  }, []);

  return <Outlet />;
};

export { PcmArticleRouteLayout };
