import * as React from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { Button, Flex, FlexItem, SimpleList, SimpleListItem, Title } from '@patternfly/react-core';
import { StarFillIcon } from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import { useFavoritedServices } from '@app/favoriteServices/FavoritedServicesContext';
import {
  FAVORITE_SERVICES_CHANGED_EVENT,
  getFavoriteServicesForIds,
  readFavoritedServiceIds
} from '@app/favoriteServices/favoriteServicesCatalog';

function useEffectiveFavoritedIds(): Set<string> {
  const { favoritedIds: contextIds } = useFavoritedServices();
  const [storageRevision, setStorageRevision] = React.useState(0);

  React.useEffect(() => {
    const syncFromStorage = () => {
      setStorageRevision((revision) => revision + 1);
    };

    window.addEventListener(FAVORITE_SERVICES_CHANGED_EVENT, syncFromStorage);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener(FAVORITE_SERVICES_CHANGED_EVENT, syncFromStorage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  return React.useMemo(() => {
    void storageRevision;
    const storedIds = readFavoritedServiceIds();
    if (contextIds.size === 0 && storedIds.size > 0) {
      return storedIds;
    }
    if (contextIds.size > 0) {
      return contextIds;
    }
    return storedIds;
  }, [contextIds, storageRevision]);
}

export const FAVORITE_SERVICES_WIDGET_LINKS = {
  viewAll: '/all-services'
} as const;

export function FavoriteServicesWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="my-favorite-services"
      title={title}
      toolbar={toolbar}
      titleClassName="favorite-services-widget-header__title"
      inlineLink={
        <Button variant="link" isInline component="a" href={FAVORITE_SERVICES_WIDGET_LINKS.viewAll}>
          View all
        </Button>
      }
    />
  );
}

export function FavoriteServicesEmptyState({ onViewAllServices }: { onViewAllServices: () => void }) {
  return (
    <div className="favorite-services-empty-state">
      <div className="favorite-services-empty-state__title">
        <StarFillIcon className="favorite-services-empty-state__title-icon" aria-hidden />
        <Title headingLevel="h5" size="md">
          No favorited services
        </Title>
      </div>
      <p className="favorite-services-empty-state__description">
        Add a service to your favorites to get started here.
      </p>
      <Button variant="primary" size="sm" onClick={onViewAllServices}>
        View all services
      </Button>
    </div>
  );
}

export function FavoriteServicesWidgetBody({ navigate }: { navigate: NavigateFunction }) {
  const favoritedIds = useEffectiveFavoritedIds();
  const favorites = React.useMemo(
    () => getFavoriteServicesForIds(favoritedIds),
    [favoritedIds]
  );

  if (favoritedIds.size === 0) {
    return (
      <FavoriteServicesEmptyState
        onViewAllServices={() => {
          navigate('/all-services');
        }}
      />
    );
  }

  return (
    <SimpleList aria-label="Favorite services">
      {favorites.map(({ id, label, href, bundle, icon: Icon }) => (
        <SimpleListItem
          key={id}
          component="a"
          href={href}
          onClick={(event) => {
            event.preventDefault();
            navigate(href);
          }}
        >
          <Flex
            className="favorite-services-item"
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem className="favorite-services-item__icon" aria-hidden>
              <Icon />
            </FlexItem>
            <FlexItem className="favorite-services-item__text">
              <span className="favorite-services-item__label">{label}</span>
              {bundle ? <span className="favorite-services-item__bundle">{bundle}</span> : null}
            </FlexItem>
          </Flex>
        </SimpleListItem>
      ))}
    </SimpleList>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const FAVORITE_SERVICES_WIDGET_STYLES = `
  .favorite-services-widget-header__title {
    margin: 0;
  }

  .favorite-services-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-block: var(--pf-t--global--spacer--md);
    padding-inline: var(--pf-t--global--spacer--sm);
    color: var(--pf-t--global--text--color--subtle, var(--pf-v6-global--Color--200));
  }

  .favorite-services-empty-state__title {
    display: inline-flex;
    align-items: center;
    gap: var(--pf-t--global--spacer--sm);
    margin: 0 0 var(--pf-t--global--spacer--xs);
    color: var(--pf-t--global--text--color--regular, var(--pf-v6-global--Color--100));
  }

  .favorite-services-empty-state__title .pf-v6-c-title {
    margin: 0;
  }

  .favorite-services-empty-state__title-icon,
  .favorite-services-empty-state__title-icon svg {
    width: 1em;
    height: 1em;
    flex-shrink: 0;
    color: var(--pf-v6-c-button--m-favorited--hover__icon--Color, #f39200);
    fill: currentColor;
  }

  .favorite-services-empty-state__title-icon {
    font-size: var(--pf-t--global--font--size--heading--h5);
  }

  .favorite-services-empty-state__description {
    margin: 0 0 var(--pf-t--global--spacer--md);
    font-size: var(--pf-t--global--font--size--body--sm);
    line-height: var(--pf-t--global--font--line-height--body);
    color: var(--pf-t--global--text--color--regular, var(--pf-v6-global--Color--100));
  }

  .favorite-services-item {
    min-width: 0;
    width: 100%;
  }

  .favorite-services-item__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    color: var(--pf-t--global--icon--color--regular, var(--pf-v6-global--icon--Color--light));
  }

  .favorite-services-item__icon svg {
    width: 1rem;
    height: 1rem;
  }

  .favorite-services-item__text {
    display: flex;
    flex-direction: column;
    gap: var(--pf-t--global--spacer--xs);
    min-width: 0;
  }

  .favorite-services-item__bundle {
    font-size: var(--pf-t--global--font--size--body--sm);
    color: var(--pf-t--global--text--color--subtle);
  }
`;
