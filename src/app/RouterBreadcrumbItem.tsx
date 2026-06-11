import * as React from 'react';
import { Link } from 'react-router-dom';
import { BreadcrumbItem, type BreadcrumbItemProps } from '@patternfly/react-core';

type RouterBreadcrumbItemProps = Omit<BreadcrumbItemProps, 'to' | 'render'> & {
  to: string;
};

/**
 * Breadcrumb crumb that navigates via React Router (respects `Router basename` on GitHub Pages subpaths).
 * PatternFly `BreadcrumbItem` with `to` renders `<a href>` and ignores basename.
 */
export function RouterBreadcrumbItem({ to, children, ...rest }: RouterBreadcrumbItemProps) {
  return (
    <BreadcrumbItem
      {...rest}
      render={({ className, ariaCurrent }) => (
        <Link to={to} className={className} aria-current={ariaCurrent}>
          {children}
        </Link>
      )}
    />
  );
}
