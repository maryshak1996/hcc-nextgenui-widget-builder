import * as React from 'react';
import {
  Button,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  type SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities
} from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';
import type { ShareDirectoryEntry } from '@app/DashboardHub/shareDashboardMockDirectory';
import { shareDirectoryEntryKey } from '@app/DashboardHub/shareDashboardMockDirectory';

const SHARE_TYPEAHEAD_NO_RESULTS = '__share_recipient_no_results__';

export type ShareRecipientTypeaheadProps = {
  directory: ShareDirectoryEntry[];
  /** Keys already on the share list (`kind:id`). */
  excludedKeys: ReadonlySet<string>;
  onAddRecipient: (entry: ShareDirectoryEntry) => void;
  fieldId: string;
  'aria-label': string;
};

const ShareRecipientTypeahead: React.FunctionComponent<ShareRecipientTypeaheadProps> = ({
  directory,
  excludedKeys,
  onAddRecipient,
  fieldId,
  'aria-label': ariaLabel
}) => {
  const optionList = React.useMemo<SelectOptionProps[]>(
    () =>
      directory.map((entry) => ({
        value: shareDirectoryEntryKey(entry),
        children: entry.displayName
      })),
    [directory]
  );

  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');
  const [selectOptions, setSelectOptions] = React.useState<SelectOptionProps[]>([]);
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number | null>(null);
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const textInputRef = React.useRef<HTMLInputElement>(null);

  const createItemId = React.useCallback(
    (value: string | number) => `${fieldId}-opt-${String(value).replace(/\s+/g, '-')}`,
    [fieldId]
  );

  React.useEffect(() => {
    let next = optionList.filter((opt) => !excludedKeys.has(String(opt.value)));
    if (filterValue) {
      next = next.filter((menuItem) => {
        const label = String(menuItem.children);
        return label.toLowerCase().includes(filterValue.toLowerCase());
      });
      if (!next.length) {
        next = [
          {
            isAriaDisabled: true,
            children: `No results found for "${filterValue}"`,
            value: SHARE_TYPEAHEAD_NO_RESULTS
          }
        ];
      }
      if (!isOpen) {
        setIsOpen(true);
      }
    }
    setSelectOptions(next);
  }, [excludedKeys, filterValue, isOpen, optionList]);

  const resetActiveAndFocusedItem = React.useCallback(() => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  }, []);

  const closeMenu = React.useCallback(() => {
    setIsOpen(false);
    resetActiveAndFocusedItem();
  }, [resetActiveAndFocusedItem]);

  const setActiveAndFocusedItem = React.useCallback(
    (itemIndex: number) => {
      setFocusedItemIndex(itemIndex);
      const focusedItem = selectOptions[itemIndex];
      if (focusedItem?.value !== undefined) {
        setActiveItemId(createItemId(focusedItem.value));
      }
    },
    [createItemId, selectOptions]
  );

  const onInputClick = React.useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      closeMenu();
    }
  }, [closeMenu, inputValue, isOpen]);

  const pickEntry = React.useCallback(
    (value: string | number) => {
      const key = String(value);
      const entry = directory.find((e) => shareDirectoryEntryKey(e) === key);
      if (!entry || excludedKeys.has(key)) {
        return;
      }
      onAddRecipient(entry);
      setInputValue('');
      setFilterValue('');
      closeMenu();
    },
    [closeMenu, directory, excludedKeys, onAddRecipient]
  );

  const onSelect = React.useCallback(
    (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
      if (value && value !== SHARE_TYPEAHEAD_NO_RESULTS) {
        pickEntry(value);
      }
    },
    [pickEntry]
  );

  const onTextInputChange = React.useCallback(
    (_event: React.FormEvent<HTMLInputElement>, value: string) => {
      setInputValue(value);
      setFilterValue(value);
      resetActiveAndFocusedItem();
    },
    [resetActiveAndFocusedItem]
  );

  const handleMenuArrowKeys = React.useCallback(
    (key: string) => {
      if (!selectOptions.length) {
        return;
      }
      let indexToFocus = 0;
      if (!isOpen) {
        setIsOpen(true);
      }
      if (selectOptions.every((option) => option.isDisabled)) {
        return;
      }
      if (key === 'ArrowUp') {
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = selectOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
        while (selectOptions[indexToFocus]?.isDisabled) {
          indexToFocus--;
          if (indexToFocus === -1) {
            indexToFocus = selectOptions.length - 1;
          }
        }
      }
      if (key === 'ArrowDown') {
        if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
        while (selectOptions[indexToFocus]?.isDisabled) {
          indexToFocus++;
          if (indexToFocus === selectOptions.length) {
            indexToFocus = 0;
          }
        }
      }
      setActiveAndFocusedItem(indexToFocus);
    },
    [focusedItemIndex, isOpen, selectOptions, setActiveAndFocusedItem]
  );

  const onInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const focusedItem = focusedItemIndex !== null ? selectOptions[focusedItemIndex] : null;
      switch (event.key) {
        case 'Enter':
          if (
            isOpen &&
            focusedItem &&
            focusedItem.value !== SHARE_TYPEAHEAD_NO_RESULTS &&
            !focusedItem.isAriaDisabled
          ) {
            pickEntry(focusedItem.value as string | number);
          }
          if (!isOpen) {
            setIsOpen(true);
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          event.preventDefault();
          handleMenuArrowKeys(event.key);
          break;
        default:
          break;
      }
    },
    [focusedItemIndex, handleMenuArrowKeys, isOpen, pickEntry, selectOptions]
  );

  const onToggleClick = React.useCallback(() => {
    setIsOpen((open) => !open);
    textInputRef.current?.focus();
  }, []);

  const onClearButtonClick = React.useCallback(() => {
    setInputValue('');
    setFilterValue('');
    resetActiveAndFocusedItem();
    textInputRef.current?.focus();
  }, [resetActiveAndFocusedItem]);

  const onSelectOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        setInputValue('');
        setFilterValue('');
        setIsOpen(false);
        resetActiveAndFocusedItem();
      }
    },
    [resetActiveAndFocusedItem]
  );

  const listboxId = `${fieldId}-listbox`;

  const toggle = React.useCallback(
    (toggleRef: React.Ref<MenuToggleElement>) => (
      <MenuToggle
        ref={toggleRef}
        variant="typeahead"
        aria-label={ariaLabel}
        onClick={onToggleClick}
        isExpanded={isOpen}
        isFullWidth
      >
        <TextInputGroup isPlain>
          <TextInputGroupMain
            icon={
              <SearchIcon
                style={{ color: 'var(--pf-t--global--icon--Color--200)' }}
                aria-hidden
              />
            }
            value={inputValue}
            onClick={onInputClick}
            onChange={onTextInputChange}
            onKeyDown={onInputKeyDown}
            id={`${fieldId}-input`}
            autoComplete="off"
            innerRef={textInputRef}
            placeholder="Find user or group by name ..."
            {...(activeItemId ? { 'aria-activedescendant': activeItemId } : {})}
            role="combobox"
            isExpanded={isOpen}
            aria-controls={listboxId}
          />
          <TextInputGroupUtilities {...(!inputValue ? { style: { display: 'none' } } : {})}>
            <Button variant="plain" onClick={onClearButtonClick} aria-label="Clear search" icon={<TimesIcon />} />
          </TextInputGroupUtilities>
        </TextInputGroup>
      </MenuToggle>
    ),
    [
      activeItemId,
      ariaLabel,
      fieldId,
      inputValue,
      isOpen,
      listboxId,
      onClearButtonClick,
      onInputClick,
      onInputKeyDown,
      onTextInputChange,
      onToggleClick
    ]
  );

  return (
    <Select
      id={fieldId}
      isOpen={isOpen}
      onSelect={onSelect}
      onOpenChange={onSelectOpenChange}
      toggle={toggle}
      variant="typeahead"
      shouldFocusFirstItemOnOpen={false}
      popperProps={{ appendTo: () => document.body }}
    >
      <SelectList id={listboxId}>
        {selectOptions.map((option, index) => (
          <SelectOption
            key={String(option.value ?? option.children)}
            isFocused={focusedItemIndex === index}
            id={createItemId(option.value as string | number)}
            {...option}
          />
        ))}
      </SelectList>
    </Select>
  );
};

export { ShareRecipientTypeahead };
