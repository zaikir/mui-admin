import AddIcon from '@mui/icons-material/Add';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import {
  forwardRef,
  Ref,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { ConfigurationContext } from 'contexts/ConfigurationContext';
import { useNavigate } from 'shared/hooks/useNavigate';
import { default as DataTable } from 'table/DataTable';
import { type DataTableRef } from 'table/DataTable.types';

import { DataTableExProps, DataTableExRef } from './DataTableEx.types';
import { FormDialog } from '../FormDialog';

const getTableSize = (rowsCount: number) => rowsCount * 52 + 48 + 53 + 5;

const DataTableEx = forwardRef(
  (
    {
      title,
      addButton,
      source,
      editPageUrl,
      automaticallyOpenEditPage,
      children,
      formDialogProps,
      inline,
      inlineHeight,
      components,
      formTitle,
      ...rest
    }: DataTableExProps,
    ref: Ref<DataTableExRef>,
  ) => {
    const navigate = useNavigate();
    const { translations } = useContext(ConfigurationContext);
    const [isEditItemModalOpened, setIsEditItemModalOpened] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const tableRef = useRef<DataTableRef>(null);

    useImperativeHandle(
      ref,
      () => ({
        async reload() {
          await tableRef.current?.reload();
        },
        openFormDialog(entity: any) {
          setSelectedItem(entity ?? null);
          setIsEditItemModalOpened(true);
        },
      }),
      [],
    );

    const FormDialogComponent = components?.FormDialog || FormDialog;

    return (
      <>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {(title || addButton) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: addButton ?? true ? 1 : 1,
                height: '40px',
              }}
            >
              {title && <Typography variant="subtitle1">{title}</Typography>}
              {(addButton ?? true) && (
                <Tooltip title={translations.addNew}>
                  <IconButton
                    {...addButton}
                    sx={{ ml: 1 }}
                    onClick={() => {
                      setSelectedItem(null);
                      setIsEditItemModalOpened(true);
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}

          <Box
            sx={{
              ...(inline && !rest.autoHeight
                ? {
                    height: inlineHeight ?? getTableSize(3),
                  }
                : {
                    flex: 1,
                  }),
            }}
          >
            <DataTable
              {...rest}
              ref={tableRef}
              mode="hasura"
              source={source}
              deletable={rest.deletable ?? true}
              components={components}
              {...(inline && {
                rowsPerPageOptions: rest.rowsPerPageOptions ?? [3, 10, 25, 50],
                autoPageSize: rest.autoPageSize ?? !rest.autoHeight,
                persistScrollBar: rest.persistScrollBar ?? false,
              })}
              editable={(() => {
                if (rest.editable === false) {
                  return false;
                }

                if (editPageUrl || rest.editable?.link) {
                  return {
                    link:
                      rest.editable?.link ??
                      ((row) =>
                        typeof editPageUrl === 'function'
                          ? editPageUrl(row)
                          : `${editPageUrl}/${row.id}`),
                    onEdit: rest.editable?.onEdit,
                  };
                }

                if (!rest.editable?.onEdit) {
                  return {
                    onEdit: (row) => {
                      setSelectedItem(row);
                      setIsEditItemModalOpened(true);
                    },
                  };
                }

                return {
                  onEdit: rest.editable?.onEdit,
                };
              })()}
            />
          </Box>
        </Box>
        <FormDialogComponent
          source={source}
          {...(selectedItem && { entityId: selectedItem.id })}
          {...formDialogProps}
          maxWidth={formDialogProps?.maxWidth ?? 'sm'}
          open={isEditItemModalOpened}
          onClose={() => {
            setIsEditItemModalOpened(false);

            if (typeof formDialogProps?.onClose === 'function') {
              formDialogProps.onClose();
            }
          }}
          {...(formTitle && {
            title: formTitle(!selectedItem),
          })}
          onSubmit={(item) => {
            tableRef.current?.reload();

            if (typeof formDialogProps?.onSubmit === 'function') {
              formDialogProps.onSubmit(item);
            }

            if (editPageUrl && (automaticallyOpenEditPage ?? true)) {
              navigate(
                typeof editPageUrl === 'function'
                  ? editPageUrl(item)
                  : `${editPageUrl}/${item.id}`,
              );
            }
          }}
        >
          {children}
        </FormDialogComponent>
      </>
    );
  },
);

export default DataTableEx;
