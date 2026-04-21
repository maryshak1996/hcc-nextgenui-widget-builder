import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  PageSection,
  Title,
  Tooltip
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import {
  EllipsisVIcon,
  ExternalLinkAltIcon,
  OutlinedCloneIcon,
  OutlinedWindowRestoreIcon,
  PlusCircleIcon
} from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@app/DashboardHub/DashboardDataContext';

const DashboardHub: React.FunctionComponent = () => {
  const { rows } = useDashboardData();
  const [openActionsRowId, setOpenActionsRowId] = React.useState<string | null>(null);
  const [isCreateDashboardMenuOpen, setIsCreateDashboardMenuOpen] = React.useState(false);

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Breadcrumb>
          <BreadcrumbItem to="/overview">Settings</BreadcrumbItem>
          <BreadcrumbItem isActive>Dashboard Hub</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      <PageSection hasBodyWrapper={false}>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsMd' }}
        >
          <FlexItem flex={{ default: 'flex_1' }}>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <div className="pf-m-align-self-center" style={{ minWidth: '40px' }}>
                  <OutlinedWindowRestoreIcon style={{ fontSize: '32px', color: '#0066cc' }} aria-label="page-header-icon" />
                </div>
              </FlexItem>
              <FlexItem alignSelf={{ default: 'alignSelfStretch' }}>
                <div style={{ borderLeft: '1px solid #d2d2d2', height: '100%', marginRight: '16px' }} />
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }}>
                <div>
                  <Title headingLevel="h1" size="2xl">
                    Dashboard Hub
                  </Title>
                  <Content>
                    <p style={{ margin: 0, color: '#6a6e73' }}>
                      Browse and open your dashboards. Create, organize, and share views tailored to your teams and workflows.
                    </p>
                    <div style={{ marginTop: '12px' }}>
                      <Button
                        variant="link"
                        isInline
                        icon={<ExternalLinkAltIcon />}
                        iconPosition="end"
                        component="a"
                        href="https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn more
                      </Button>
                    </div>
                  </Content>
                </div>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Dropdown
              isOpen={isCreateDashboardMenuOpen}
              onSelect={() => setIsCreateDashboardMenuOpen(false)}
              onOpenChange={(isOpen: boolean) => setIsCreateDashboardMenuOpen(isOpen)}
              popperProps={{ position: 'end' }}
              toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  variant="primary"
                  icon={<PlusCircleIcon />}
                  isExpanded={isCreateDashboardMenuOpen}
                  type="button"
                  onClick={() => {
                    setIsCreateDashboardMenuOpen((open) => !open);
                    setOpenActionsRowId(null);
                  }}
                >
                  Create dashboard
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <DropdownList>
                <DropdownItem key="create-blank">Create from blank</DropdownItem>
                <DropdownItem key="import-config">Import from config string</DropdownItem>
                <DropdownItem key="duplicate">Duplicate existing</DropdownItem>
              </DropdownList>
            </Dropdown>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection>
        <Table aria-label="Dashboard hub" gridBreakPoint="">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Last modified</Th>
              <Th modifier="fitContent" screenReaderText="Actions" />
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td dataLabel="Name">
                  <Link
                    to={`/dashboard-hub/${row.id}`}
                    className="pf-v6-c-button pf-m-link pf-m-inline"
                    style={{ padding: 0, fontSize: 'inherit' }}
                  >
                    {row.name}
                  </Link>
                </Td>
                <Td dataLabel="Description">{row.description}</Td>
                <Td dataLabel="Last modified">{row.lastModified}</Td>
                <Td dataLabel="Actions" modifier="fitContent">
                  <div
                    style={{
                      display: 'inline-flex',
                      flexDirection: 'row',
                      flexWrap: 'nowrap',
                      alignItems: 'center',
                      columnGap: 'var(--pf-t--global--spacer--sm)',
                    }}
                  >
                    <Tooltip content="Duplicate dashboard">
                      <Button
                        variant="plain"
                        type="button"
                        aria-label="Duplicate dashboard"
                        icon={<OutlinedCloneIcon />}
                      />
                    </Tooltip>
                    <Dropdown
                      isOpen={openActionsRowId === row.id}
                      onSelect={() => setOpenActionsRowId(null)}
                      onOpenChange={(isOpen: boolean) => setOpenActionsRowId(isOpen ? row.id : null)}
                      popperProps={{ position: 'end' }}
                      toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          variant="plain"
                          aria-label={`Actions for ${row.name}`}
                          isExpanded={openActionsRowId === row.id}
                          onClick={() => {
                            setOpenActionsRowId((current) => (current === row.id ? null : row.id));
                            setIsCreateDashboardMenuOpen(false);
                          }}
                        >
                          <EllipsisVIcon />
                        </MenuToggle>
                      )}
                      shouldFocusToggleOnSelect
                    >
                      <DropdownList>
                        <DropdownItem key="edit">Edit dashboard</DropdownItem>
                        <DropdownItem key="homepage">Set as homepage</DropdownItem>
                        <DropdownItem key="copy">Copy configuration string</DropdownItem>
                        <DropdownItem key="share">Share dashboard</DropdownItem>
                        <DropdownItem key="delete">Delete dashboard</DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PageSection>
    </>
  );
};

export { DashboardHub };
