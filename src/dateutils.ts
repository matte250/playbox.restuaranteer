// TODO: Add config for timeoffsets.

export const newAppLocaleDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60 * 2)
    return now;
}

export const toLocaleDatetimeString = (date: Date) => {
    const isoString = date.toISOString();
    return isoString.substring(0, (isoString.indexOf("T") | 0) + 6 | 0)
}

export const newAppLocaleDateTimeString = () => toLocaleDatetimeString(newAppLocaleDateTime());


