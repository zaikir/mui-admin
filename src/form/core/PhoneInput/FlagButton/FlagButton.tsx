import IconButton, { IconButtonProps } from "@mui/material/IconButton";

import Flag from "../Flag/Flag";

export type FlagButtonProps = IconButtonProps & {
  isoCode: any | null;
  isFlagsMenuOpened: boolean;
  disableDropdown?: boolean;
};

function FlagButton(props: FlagButtonProps) {
  const { isoCode, isFlagsMenuOpened, disableDropdown, ...iconButtonProps } =
    props;

  if (disableDropdown) {
    return (
      <IconButton
        tabIndex={-1}
        className="MuiTelInput-IconButton"
        role=""
        disableRipple
        // @ts-ignore
        sx={{ pointerEvents: "none" }}
        component="span"
      >
        <Flag isoCode={isoCode} />
      </IconButton>
    );
  }

  return (
    <IconButton
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...iconButtonProps}
      aria-label="Select country"
      className="MuiTelInput-IconButton"
      aria-haspopup="listbox"
      aria-controls={isFlagsMenuOpened ? "select-country" : undefined}
      aria-expanded={isFlagsMenuOpened ? "true" : "false"}
      tabIndex={-1}
    >
      <Flag isoCode={isoCode} />
    </IconButton>
  );
}

FlagButton.defaultProps = {
  disableDropdown: false,
};

export default FlagButton;
