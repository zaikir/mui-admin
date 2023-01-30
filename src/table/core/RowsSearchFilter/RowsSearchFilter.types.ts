import { SxProps, TextField } from "@mui/material";

type TextFieldProps = React.ComponentProps<typeof TextField>;

export type RowsSearchFilterProps = {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  debounce?: number;
  inputProps?: Omit<TextFieldProps, "value">;
  containerStyle?: SxProps;
  FiltersButton?: JSX.Element;
  minLength?: number;
  trim?: boolean;
  lowerCase?: boolean;
  slots?: {
    beforeSearch?: React.ReactNode;
    afterSearch?: React.ReactNode;
  };
};
