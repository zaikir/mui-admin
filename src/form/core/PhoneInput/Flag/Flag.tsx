import { Styled } from './Flag.styled';
import { PhoneFlags } from '../phones';

function Flag(props: any) {
  const { isoCode } = props;

  // @ts-ignore
  const svgFlag =
    isoCode && isoCode in PhoneFlags ? `"${PhoneFlags[isoCode]}"` : null;

  if (!svgFlag) {
    return null;
  }

  return (
    <Styled.Flag
      data-testid={isoCode}
      className="MuiTelInput-Flag"
      style={{
        backgroundImage: `url(${svgFlag})`,
      }}
    >
      {isoCode ? <Styled.Span>{isoCode}</Styled.Span> : null}
    </Styled.Flag>
  );
}

export default Flag;
