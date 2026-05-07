import * as React from 'react';
import { Content } from '@patternfly/react-core';
import { OpenSupportCaseButton } from './OpenSupportCaseButton';
import { SupportBundlePage } from './SupportBundlePage';

const SupportCases: React.FunctionComponent = () => (
  <SupportBundlePage pageTitle="Support cases" actions={<OpenSupportCaseButton />}>
    <Content>
      <p>Placeholder for support cases. Replace with PCM integration content when ready.</p>
    </Content>
  </SupportBundlePage>
);

export { SupportCases };
