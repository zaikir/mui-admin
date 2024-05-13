import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react';
import useKeypress from 'react-use-keypress';

export type ShowAlertProps = {
  title: string;
  text?: string;
  cancel?: string;
  accept?: string;
  width?: number;
};

export type ConfirmDialogElementRef = {
  show: (props: ShowAlertProps) => Promise<boolean>;
};

type Props = object;

const ConfirmDialog = forwardRef(
  (props: Props, ref: Ref<ConfirmDialogElementRef>) => {
    const [isOpened, setIsOpened] = useState(false);
    const [title, setTitle] = useState('');
    const [text, setText] = useState<string>();
    const [acceptButtonText, setAcceptButtonText] = useState<string>();
    const [cancelButtonText, setCancelButtonText] = useState<string>();
    const [allDialogProps, setAllDialogProps] = useState<ShowAlertProps>();

    const resolvePromiseRef = useRef<(result: boolean) => void>();

    useKeypress('Enter', () => {
      onAccept();
    });

    const handleClose = () => {
      setIsOpened(false);

      if (resolvePromiseRef.current) {
        resolvePromiseRef.current(false);
      }
    };

    const onAccept = () => {
      setIsOpened(false);

      if (resolvePromiseRef.current) {
        resolvePromiseRef.current(true);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        async show(dialogProps) {
          setTitle(dialogProps.title);
          setText(dialogProps.text);
          setAcceptButtonText(dialogProps.accept ?? '');
          setCancelButtonText(dialogProps.cancel);
          setAllDialogProps(dialogProps);
          setIsOpened(true);

          return new Promise<boolean>((resolve) => {
            resolvePromiseRef.current = resolve;
          });
        },
      }),
      [],
    );

    return (
      <Dialog
        open={isOpened}
        onClose={handleClose}
        maxWidth="sm"
        PaperProps={{
          sx: {
            minWidth: allDialogProps?.width ?? 350,
          },
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        {text && (
          <DialogContent sx={{ pb: 0 }}>
            <DialogContentText>{text}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          {cancelButtonText && (
            <Button
              onClick={handleClose}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleClose();
                }
              }}
            >
              {cancelButtonText}
            </Button>
          )}
          <Button onClick={onAccept}>{acceptButtonText}</Button>
        </DialogActions>
      </Dialog>
    );
  },
);

export default ConfirmDialog;
