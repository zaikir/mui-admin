export function formatPhone(phone: string, sign = '+') {
  const clearedPhone = sign + phone.replace(/[ \-+]/, '').trim();
  if (clearedPhone.startsWith('+7') && clearedPhone.length === 12) {
    return `+7 (${clearedPhone.substr(2, 3)}) ${clearedPhone.substr(
      5,
      3,
    )}-${clearedPhone.substr(8, 2)}-${clearedPhone.substr(10, 3)}`;
  }

  return clearedPhone;
}
