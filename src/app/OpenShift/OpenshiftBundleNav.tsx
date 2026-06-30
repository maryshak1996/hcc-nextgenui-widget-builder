import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Divider, NavExpandable, NavItem } from '@patternfly/react-core';
import {
  isOpenshiftNavGroupActive,
  OPENSHIFT_BUNDLE_NAV,
  type OpenshiftNavGroup,
  type OpenshiftNavNode
} from '@app/OpenShift/openshiftBundleNavigation';

export type OpenshiftBundleNavProps = {
  pathname: string;
  deferOverviewToPinned: boolean;
  pinnedNavItems: React.ReactNode;
};

function renderOpenshiftNavNode(
  node: OpenshiftNavNode,
  pathname: string,
  deferOverviewToPinned: boolean,
  keyPrefix: string
): React.ReactNode {
  if (node.type === 'group') {
    return (
      <NavExpandable
        key={keyPrefix}
        id={keyPrefix}
        title={node.label}
        isExpanded={node.defaultExpanded}
        isActive={isOpenshiftNavGroupActive(node, pathname)}
      >
        {node.children.map((child, index) =>
          renderOpenshiftNavNode(child, pathname, deferOverviewToPinned, `${keyPrefix}-${index}`)
        )}
      </NavExpandable>
    );
  }

  const isOverview = node.path === '/openshift/overview';
  return (
    <NavItem
      key={keyPrefix}
      id={keyPrefix}
      isActive={pathname === node.path && !(isOverview && deferOverviewToPinned)}
    >
      <NavLink to={node.path}>{node.label}</NavLink>
    </NavItem>
  );
}

export const OpenshiftBundleNav: React.FunctionComponent<OpenshiftBundleNavProps> = ({
  pathname,
  deferOverviewToPinned,
  pinnedNavItems
}) => (
  <>
    <div className="hcc-bundle-sidebar-header">OpenShift</div>
    <Divider component="div" className="hcc-bundle-sidebar-header__divider" />
    {OPENSHIFT_BUNDLE_NAV.map((node, index) =>
      renderOpenshiftNavNode(node, pathname, deferOverviewToPinned, `openshift-nav-${index}`)
    )}
    {pinnedNavItems}
  </>
);
