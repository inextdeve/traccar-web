function filterDatesByDaysAgo(datesArray, daysAgo) {
  // Calculate the cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  // Use Array.filter to filter dates that are before the cutoff date
  const filteredDates = datesArray.filter(({time}) => {
    const date = new Date(time);
    return date < cutoffDate;
  });

  return filteredDates;
}

export {filterDatesByDaysAgo}