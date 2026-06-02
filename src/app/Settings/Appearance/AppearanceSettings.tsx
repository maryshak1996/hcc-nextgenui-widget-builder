import * as React from 'react';
import { Divider, PageSection, Title } from '@patternfly/react-core';
import { PatternFlyThemePreferencesPanel } from '@app/theme/PatternFlyThemePreferencesPanel';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const AppearanceSettings: React.FunctionComponent = () => {
  useDocumentTitle('Appearance');

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h1" size="lg">
          Appearance
        </Title>
      </PageSection>
      <PageSection hasBodyWrapper={false} isWidthLimited>
        <PatternFlyThemePreferencesPanel />
      </PageSection>
      <Divider component="div" />
    </>
  );
};

export { AppearanceSettings };
