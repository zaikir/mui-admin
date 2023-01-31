import type { AddCustomFilterButtonProps } from '../AddCustomFilterButton';
import type { RowsCustomFilterDef } from '../RowsCustomFilterForm';
import type { RowsSearchFilterProps } from '../RowsSearchFilter';
import type {
  DataTableTabFilter,
  RowsTabsFilterProps,
} from '../RowsTabsFilter';

export type RowsFilterState = {
  tab: string;
  search: string;
  filters: Record<string, any>;
};

export type RowsFilterProps<
  TabFilter extends DataTableTabFilter = DataTableTabFilter,
  SearchFilter extends RowsSearchFilterProps = RowsSearchFilterProps,
  CustomFilter extends RowsCustomFilterDef = RowsCustomFilterDef,
> = {
  initialState: RowsFilterState;
  onChange: (state: RowsFilterState) => void;
  slots?: {
    beforeSearch?: React.ReactNode;
    afterSearch?: React.ReactNode;
  };
  tabsFilter?: Omit<RowsTabsFilterProps<TabFilter>, 'value' | 'onChange'>;
  searchFilter?: Omit<SearchFilter, 'value' | 'onChange' | 'FiltersButton'> & {
    onChange?: SearchFilter['onChange'];
    position?: 'full' | 'tabs';
  };
  customFilter?: Omit<
    AddCustomFilterButtonProps<CustomFilter>,
    'onSelect' | 'buttonProps'
  > & {
    addFilterButtonProps?: AddCustomFilterButtonProps['buttonProps'];
  };
};
