import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@patternfly/react-core';

const NEW_SUPPORT_CASE_PATH = '/support/cases/new' as const;

const OpenSupportCaseButton: React.FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <Button variant="primary" onClick={() => navigate(NEW_SUPPORT_CASE_PATH)}>
      Open support case
    </Button>
  );
};

export { OpenSupportCaseButton, NEW_SUPPORT_CASE_PATH };
