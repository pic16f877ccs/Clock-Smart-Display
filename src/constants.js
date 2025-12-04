/**
 * Shared constants for Clock Smart Display extension
 */

export const DATE_TIME_FORMATS = {
    "datetime": '%Y-%m-%d %H:%M',
    "date": '%Y-%m-%d',
    "time": '%H:%M',
    "iso": '%FT%T%Ez',
    "time 12": '%I:%M %p',
    "date us": '%m/%d/%Y',
    "date eu": '%d/%m/%Y',
    "rfc": '%a, %d %b %Y %H:%M:%S %z',
    "full": '%a, %d %b %Y %H:%M',
    "vtime": '%H\n%M',
    "two-line": '<small>' + '%Y-%m-%d\n %H:%M:%S' + '</small>'
};

export const UPDATE_INTERVAL_MS = 1000;
export const EXTENSION_UUID = 'clockSmartDisplay@pic16f877ccs.github.com';

