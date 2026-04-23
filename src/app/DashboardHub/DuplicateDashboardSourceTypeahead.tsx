import * as React from 'react';
import {
  Button,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  type SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  type MenuToggleElement
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import type { HubRow } from '@app/DashboardHub/dashboardHubMockData';

const DUPLICATE_SOURCE_TYPEAHEAD_NO_RESULTS = '__duplicate_source_no_results__';

export type DuplicateDashboardSourceTypeaheadProps = {
  rows: HubRow[];
  selectedId: string;
  onSelectedIdChange: (id: string) => void;
  fieldId: string;
  'aria-label': string;
};

/** PatternFly typeahead single-select (Select + MenuToggle + TextInputGroup), per PF Select typeahead example. */
const DuplicateDashboardSourceTypeahead: React.FunctionComponent<DuplicateDashboardSourceTypeaheadProps> = ({
  rows,
  selectedId,
  onSelectedIdChange,
  fieldId,
  'aria-label': ariaLabel
}) => {
  const optionList = React.useMemo<SelectOptionProps[]>(
    () => rows.map((row) => ({ value: row.id, children: row.name })),
    [rows]
  );

  const skipNextEmptySelectedIdSyncRef = React.useRef(false);

  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedRowId, setSelectedRowId] = React.useState(selectedId);
  const [inputValue, setInputValue] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');
  const [selectOptions, setSelectOptions] = React.useState<SelectOptionProps[]>(optionList);
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number | null>(null);
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const textInputRef = React.useRef<HTMLInputElement>(null);

  const createItemId = React.useCallback(
    (value: string | number) => `${fieldId}-opt-${String(value).replace(/\s+/g, '-')}`,
    [fieldId]
  );

  React.useEffect(() => {
    setSelectedRowId(selectedId);
    if (selectedId) {
      const row = rows.find((r) => r.id === selectedId);
      setInputValue(row ? row.name : '');
      setFilterValue('');
      setIsOpen(false);
      setFocusedItemIndex(null);
      setActiveItemId(null);
      return;
    }
    if (skipNextEmptySelectedIdSyncRef.current) {
      skipNextEmptySelectedIdSyncRef.current = false;
      return;
    }
    setInputValue('');
    setFilterValue('');
    setIsOpen(false);
    setFocusedItemIndex(null);
    setActiveItemId(null);
  }, [selectedId, rows]);

  React.useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = [...optionList];
    if (filterValue) {
      newSelectOptions = optionList.filter((menuItem) =>
        String(menuItem.children).toLowerCase().includes(filterValue.toLowerCase())
      );
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            isAriaDisabled: true,
            children: `No results found for "${filterValue}"`,
            value: DUPLICATE_SOURCE_TYPEAHEAD_NO_RESULTS
          }
        ];
      }
      if (!isOpen) {
        setIsOpen(true);
      }
    }
    setSelectOptions(newSelectOptions);
  }, [filterValue, optionList, isOpen]);

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

  const selectOption = React.useCallback(
    (value: string | number, content: string | number) => {
      setInputValue(String(content));
      setFilterValue('');
      setSelectedRowId(String(value));
      onSelectedIdChange(String(value));
      closeMenu();
    },
    [closeMenu, onSelectedIdChange]
  );

  const onSelect = React.useCallback(
    (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
      if (value && value !== DUPLICATE_SOURCE_TYPEAHEAD_NO_RESULTS) {
        const optionText = selectOptions.find((option) => option.value === value)?.children;
        selectOption(value, optionText as string);
      }
    },
    [selectOption, selectOptions]
  );

  const onTextInputChange = React.useCallback(
    (_event: React.FormEvent<HTMLInputElement>, value: string) => {
      setInputValue(value);
      setFilterValue(value);
      resetActiveAndFocusedItem();
      const row = selectedRowId ? rows.find((r) => r.id === selectedRowId) : undefined;
      const committedLabel = row?.name ?? '';
      if (value !== committedLabel && selectedRowId) {
        setSelectedRowId('');
        skipNextEmptySelectedIdSyncRef.current = true;
        onSelectedIdChange('');
      }
    },
    [onSelectedIdChange, resetActiveAndFocusedItem, rows, selectedRowId]
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
            focusedItem.value !== DUPLICATE_SOURCE_TYPEAHEAD_NO_RESULTS &&
            !focusedItem.isAriaDisabled
          ) {
            selectOption(focusedItem.value as string | number, focusedItem.children as string);
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
    [focusedItemIndex, handleMenuArrowKeys, isOpen, selectOption, selectOptions]
  );

  const onToggleClick = React.useCallback(() => {
    setIsOpen((open) => !open);
    textInputRef.current?.focus();
  }, []);

  const onClearButtonClick = React.useCallback(() => {
    setSelectedRowId('');
    setInputValue('');
    setFilterValue('');
    resetActiveAndFocusedItem();
    onSelectedIdChange('');
    textInputRef.current?.focus();
  }, [onSelectedIdChange, resetActiveAndFocusedItem]);

  const onSelectOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        const row = selectedRowId ? rows.find((r) => r.id === selectedRowId) : undefined;
        setInputValue(row ? row.name : '');
        setFilterValue('');
        setIsOpen(false);
        resetActiveAndFocusedItem();
      }
    },
    [resetActiveAndFocusedItem, rows, selectedRowId]
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
            value={inputValue}
            onClick={onInputClick}
            onChange={onTextInputChange}
            onKeyDown={onInputKeyDown}
            id={`${fieldId}-input`}
            autoComplete="off"
            innerRef={textInputRef}
            placeholder="Select an existing dashboard"
            {...(activeItemId ? { 'aria-activedescendant': activeItemId } : {})}
            role="combobox"
            isExpanded={isOpen}
            aria-controls={listboxId}
          />
          <TextInputGroupUtilities {...(!inputValue ? { style: { display: 'none' } } : {})}>
            <Button variant="plain" onClick={onClearButtonClick} aria-label="Clear input value" icon={<TimesIcon />} />
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
      selected={selectedRowId}
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

export { DuplicateDashboardSourceTypeahead };
