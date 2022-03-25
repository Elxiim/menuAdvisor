import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  CircularProgress,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { DropResult, ResponderProvided } from 'react-beautiful-dnd';
import TableToolbar, {
  Filters,
  FilterValue,
  FilterValues,
} from './TableToolbar';
import { useAuth } from '../../providers/authentication';
import DroppableTableBody from './DroppableTableBody';
import DraggableRow from './DraggableRow';
import CustomScrollbar from 'react-custom-scrollbars';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
  table: {
    marginTop: theme.spacing(3),
    '& thead th': {
      fontWeight: '600',
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.light,
    },
    '& thead th:not(.MuiTableCell-paddingCheckbox)': {
      minWidth: 90,
    },
    '& tbody td': {
      fontWeight: '300',
    },
    '& tbody tr:nth-child(2n + 1)': {
      backgroundColor: 'white',
    },
    '& tbody tr:not(.empty):hover': {
      backgroundColor: '#fffbf2',
      cursor: 'pointer',
    },
    '& tbody tr.empty td': {
      textAlign: 'center',
      fontWeight: 600,
    },
    '& tbody tr:not(.empty):not(.Mui-selected):nth-child(2n)': {
      backgroundColor: grey[50],
    },
  },
}));

export interface HeadCell<T> {
  id: keyof T;
  label: string;
  disableSorting?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
  hideOnAdmin?: boolean;
  hideOnRestaurantAdmin?: boolean;
}

type RowPerPageOption = number | { value: number; label: string };

const pages: RowPerPageOption[] = [5, 10, 25, { value: -1, label: 'Tous' }];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

type CustomComparators<T extends { [key: string]: any }> = {
  [key in keyof T]?: (a: T, b: T) => number;
};

type CustomResolvers<T extends { [key: string]: any }> = {
  [key in keyof T]?: (a: T) => any;
};

function applyFilters<T extends { [key: string]: any }>(
  array: T[],
  filters: FilterValues<T>,
  customResolvers?: CustomResolvers<T>,
) {
  return array.filter((value) => {
    return Object.keys(filters).reduce<boolean>((p, k) => {
      if (!p) return false;

      const filter = filters[k],
        customResolver = customResolvers?.[k],
        valueToBeCompared = customResolver ? customResolver(value) : value[k];
      if (filter) {
        if (typeof filter.value === 'string')
          return p && new RegExp(filter.value, 'i').test(valueToBeCompared);
        else if (
          typeof filter.value === 'boolean' ||
          typeof filter.value === 'number'
        ) 
          return p && valueToBeCompared === filter.value;
        else if (typeof filter.min === 'number')
          return (
            p &&
            valueToBeCompared >= filter.min &&
            (!filter.max || valueToBeCompared < filter.max)
          );
        else if (filter.startDate && filter.endDate)
          return (
            p &&
            moment(valueToBeCompared).diff(filter.startDate) >= 0 &&
            moment(valueToBeCompared).diff(filter.endDate, 'days') <= 0
          );
        else if (Object.keys(filter).includes('category')) {
          const newComparedValue = valueToBeCompared.map((k: any) => k.name.fr)
          return p && new RegExp(filter.category || '', 'i').test(newComparedValue);
        }
        else if (Object.keys(filter).includes('restaurant')) {
          return p && new RegExp(filter.restaurant || '', 'i').test(valueToBeCompared.name);
        }
        else if (Object.keys(filter).includes('attributes')) {
          const newComparedValue = valueToBeCompared.map((k: any) => k.tag)
          return p && new RegExp(filter.attributes || '', 'i').test(newComparedValue);
        }
      }

      return true;
    }, true);
  });
}

function getComparator<T extends { [key: string]: any }>(
  order: Order,
  orderBy: keyof T,
  customComparators?: CustomComparators<T>,
): (a: T, b: T) => number {
  if (customComparators && customComparators[orderBy])
    return order === 'desc'
      ? (a, b) => (customComparators[orderBy] as (a: T, b: T) => number)(a, b)
      : (a, b) => -(customComparators[orderBy] as (a: T, b: T) => number)(a, b);

  return order === 'desc'
    ? (a, b) => descendingComparator<T>(a, b, orderBy)
    : (a, b) => -descendingComparator<T>(a, b, orderBy);
}

function stableSort<T>(
  array: T[],
  comparator: (a: T, b: T) => number,
): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    resolve(stabilizedThis.map((el) => el[0]));
  });
}

type TableOptions<T> = {
  order?: Order;
  orderBy: keyof T;
  customComparators?: CustomComparators<T>;
  customResolvers?: CustomResolvers<T>;
  hasActionsColumn?: boolean;
  selectableRows?: boolean;
  enableDragAndDrop?: boolean;
  onDragEnd?: (source: T, destination: T) => void;
  selectOnClick?: boolean;
  onRowClick?: (event: React.MouseEvent<unknown>, row: T) => void;
  filters?: Filters<T>;
};

interface TableContainerProps<T> {
  records: T[];
  options: TableOptions<T>;
  headCells: HeadCell<T>[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  children: (row: T, index: number) => React.ReactNode;
  onOrderByChange?: (orderBy: keyof T) => void;
  addButtonLabel?: string;
  showAddButton?: boolean;
  onAddClick?: React.MouseEventHandler<HTMLButtonElement>;
  onDeleteClick?: React.MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
  emptyPlaceholder?: string;
}

export default function TableContainer<T extends { _id: string }>(
  props: TableContainerProps<T>,
) {
  const {
    children,
    records,
    loading,
    emptyPlaceholder,
    addButtonLabel,
    showAddButton,
    onAddClick,
    onDeleteClick,
    options,
    headCells,
    selected,
    onSelectedChange,
    onOrderByChange,
  } = props;

  const classes = useStyles();
  const { isAdmin, isRestaurantAdmin } = useAuth();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(pages[1] as number);
  const [order, setOrder] = useState<Order>(options.order || 'asc');
  const [orderBy, setOrderBy] = useState<keyof T>(options.orderBy);
  const [activatedFilters, setActivatedFilters] = useState<string[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues<T>>({});
  const [rows, setRows] = useState<T[]>([]);
  const numSelected = useMemo(() => selected.length, [selected]);

  useEffect(() => {
    stableSort<T>(
      applyFilters<T>(records, filterValues, options.customResolvers),
      getComparator<T>(order, orderBy, options.customComparators),
    ).then((data) => {
      setRows(data);
    });
  }, [
    filterValues,
    options.customComparators,
    options.customResolvers,
    order,
    orderBy,
    records,
  ]);

  useEffect(() => {
    if (rowsPerPage !== -1 && page * rowsPerPage >= rows.length)
      setPage(Math.floor(rows.length / rowsPerPage));
  }, [rows, rowsPerPage, page]);

  const size = useMemo(
      () => (rowsPerPage > 0 ? rowsPerPage : (pages[0] as number)),
      [rowsPerPage],
    ),
    emptyRows = useMemo(
      () => size - Math.min(size, rows.length - page * size),
      [page, rows, size],
    );

  options.selectableRows =
    options.selectableRows !== undefined ? options.selectableRows : true;

  options.selectOnClick = options.selectOnClick ?? true;

  const handleSelectAllClick: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void = useCallback(
    (_, checked) => {
      if (checked) {
        const newSelecteds = records.map((n) => n._id);
        return onSelectedChange(newSelecteds);
      }
      onSelectedChange([]);
    },
    [onSelectedChange, records],
  );

  const handleClick: (id: string) => void = useCallback(
    (id) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected: string[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }

      onSelectedChange(newSelected);
    },
    [onSelectedChange, selected],
  );

  const isSelected: (id: string) => boolean = useCallback(
    (id) => selected.indexOf(id) !== -1,
    [selected],
  );

  const onFilterValuesChange: (id: string, value: FilterValue) => void = (
    id,
    value,
  ) => {
    console.log(filterValues)
      setFilterValues((v) => ({ ...v, [id]: value }));
  };

  const onDragEnd = useCallback<
    (result: DropResult, provided: ResponderProvided) => void
  >(
    (result, provided) => {
      if (!result.destination) return;

      const r1 = rows[result.source.index],
        r2 = rows[result.destination.index];

      options.onDragEnd?.(r1, r2);
    },
    [options, rows],
  );

  const tableHead: React.ReactNode = useMemo(() => {
    const handleSortRequest = (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id as keyof T);
      onOrderByChange?.(id as keyof T);
    };

    const rowCount = records.length;

    return (
      <TableHead>
        <TableRow>
          {options.selectableRows && (
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={handleSelectAllClick}
                inputProps={{ 'aria-label': 'select all' }}
              />
            </TableCell>
          )}
          {headCells.map(
            ({
              id,
              label,
              disableSorting,
              alignment,
              hideOnAdmin,
              hideOnRestaurantAdmin,
            }) =>
              (!hideOnAdmin || isRestaurantAdmin) &&
              (!hideOnRestaurantAdmin || isAdmin) && (
                <TableCell align={alignment || 'left'} key={id as string}>
                  {disableSorting ? (
                    label
                  ) : (
                    <TableSortLabel
                      active={orderBy === id}
                      direction={orderBy === id ? order : 'asc'}
                      onClick={() => handleSortRequest(id as string)}
                    >
                      {label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ),
          )}
          {options.hasActionsColumn && <TableCell>Actions</TableCell>}
        </TableRow>
      </TableHead>
    );
  }, [
    handleSelectAllClick,
    headCells,
    isAdmin,
    isRestaurantAdmin,
    numSelected,
    onOrderByChange,
    options.hasActionsColumn,
    options.selectableRows,
    order,
    orderBy,
    records,
  ]);

  const tablePagination: React.ReactNode = useMemo(
    () => (
      <TablePagination
        component="div"
        rowsPerPageOptions={pages}
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={(_, newPage) => setPage(newPage)}
        onChangeRowsPerPage={(e) => setRowsPerPage(Number(e.target.value))}
        labelRowsPerPage={'Lignes par page'}
        labelDisplayedRows={({ from, to, count }) =>
          count
            ? `${from}-${to === -1 ? count : to} de ${count}`
            : 'Aucune donnée'
        }
        nextIconButtonText="Page suivante"
        backIconButtonText="Page précédente"
      />
    ),
    [page, rows, rowsPerPage],
  );

  const emptyRow =
    emptyRows > 0 ? (
      <TableRow
        className="empty"
        style={{
          height: !rows.length ? 265 : 53 * emptyRows,
        }}
      >
        <TableCell
          colSpan={
            (options.selectableRows ? 1 : 0) +
            headCells.length +
            (options.hasActionsColumn ? 1 : 0)
          }
        >
          {loading ? (
            <CircularProgress />
          ) : (
            !rows.length && (emptyPlaceholder || 'Aucune donnée')
          )}
        </TableCell>
      </TableRow>
    ) : null;

  return (
    <>
      <TableToolbar
        numSelected={selected.length}
        addButtonLabel={addButtonLabel}
        showAddButton={showAddButton}
        onAddClick={onAddClick}
        onDeleteClick={onDeleteClick}
        filters={options.filters}
        filterValues={filterValues}
        onFilterValuesChange={onFilterValuesChange}
        activatedFilters={activatedFilters}
        onActivateFilter={(id, type) => {
          setActivatedFilters((old) => [...old, id]);
          setFilterValues((values) => ({
            ...values,
            [id]:
              type === 'STRING'
                ? { value: '' }
                : type === 'CATEGORY'
                ? { category: '' }
                : type === 'BOOLEAN'
                ? { value: false }
                : type === 'NUMBER'
                ? { min: 0, max: 0 }
                : type === 'DATE'
                ? {
                    startDate: moment({
                      hour: 0,
                      minute: 0,
                      seconds: 0,
                    }).toDate(),
                    endDate: moment({ hour: 23, minute: 59, seconds: 59 }),
                  }
                : type === 'COMMAND_TYPE'
                ? { value: '' }
                : undefined,
          }));
        }}
        onDeactivateFilter={(id) => {
          setActivatedFilters((old) => old.filter((d) => d !== id));
          setFilterValues((values) => ({ ...values, [id]: undefined }));
        }}
      />
      <CustomScrollbar
        autoHeight
        autoHide
        style={{ maxHeight: 'none' }}
        renderView={(props) => (
          <div
            {...props}
            style={{ ...props.style, maxHeight: 'none', overflowY: 'hidden' }}
          />
        )}
      >
        <Table className={classes.table}>
          {tableHead}
          <TableBody
            component={
              options.enableDragAndDrop
                ? DroppableTableBody(onDragEnd)
                : 'tbody'
            }
          >
            {(rowsPerPage === -1
              ? rows
              : rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
            ).map((row, i) => {
              const isItemSelected = isSelected(row._id);
              const labelId = `item-checkbox-${row._id}`;

              return (
                <TableRow
                  component={
                    options.enableDragAndDrop ? DraggableRow(row._id, i) : 'tr'
                  }
                  hover
                  key={row._id}
                  onClick={(event: React.MouseEvent<unknown>) => {
                    options.onRowClick?.(event, row);
                    options.selectOnClick && handleClick(row._id);
                  }}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  selected={isItemSelected}
                >
                  {options.selectableRows && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': labelId }}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e, c) => handleClick(row._id)}
                      />
                    </TableCell>
                  )}
                  {children(row, i)}
                </TableRow>
              );
            })}
            {emptyRow}
          </TableBody>
        </Table>
      </CustomScrollbar>
      {tablePagination}
    </>
  );
}
