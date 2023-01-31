import ClearIcon from '@mui/icons-material/Clear';
import {
  IconButton,
  InputAdornment,
  SxProps,
  useFormControl,
} from '@mui/material';

export type InputClearButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  sx?: SxProps;
};

export default function InputClearButton({
  onClick,
  sx,
}: InputClearButtonProps) {
  const { focused } = useFormControl() ?? {};

  return (
    <InputAdornment position="end" sx={sx}>
      <IconButton
        edge="end"
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        size="small"
        className="input-clear-button"
        sx={{ display: focused ? 'flex' : 'none' }}
        tabIndex={-1}
      >
        <ClearIcon sx={{ width: '20px', height: '20px' }} />
      </IconButton>
    </InputAdornment>
  );
}
