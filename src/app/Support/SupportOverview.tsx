import * as React from 'react';
import { CubesIcon } from '@patternfly/react-icons';
import {
  Button,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { OpenSupportCaseButton } from './OpenSupportCaseButton';
import { SupportBundlePage } from './SupportBundlePage';

/** Support bundle landing (Overview). */
const SupportOverview: React.FunctionComponent = () => (
  <SupportBundlePage pageTitle="Overview" actions={<OpenSupportCaseButton />}>
    <EmptyState variant={EmptyStateVariant.lg} titleText="Nothing here yet" icon={CubesIcon}>
      <EmptyStateBody>
        <Content>
          <Content component="p">
            Placeholder for the Support bundle overview. Replace with PCM integration content when ready.
          </Content>
          <Content component={ContentVariants.small}>
            Use the left navigation to open Support cases, Partnerships, RBAC, and Learning resources.
          </Content>
        </Content>
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button variant="primary">Primary action</Button>
        <EmptyStateActions>
          <Button variant="link">Secondary</Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  </SupportBundlePage>
);

export { SupportOverview };
