export const getTimeZone = () => {
  const timeZoneOffset = -new Date().getTimezoneOffset();
  return {
    local: {
      timeZoneOffset: timeZoneOffset / 60,
      utcString: `(UTC${timeZoneOffset > 0 ? "+" : "-"}${timeZoneOffset / 60})`,
    },
    moscow: {
      timeZoneOffset: 3,
      utcString: "(UTC+3)",
    },
  };
};
