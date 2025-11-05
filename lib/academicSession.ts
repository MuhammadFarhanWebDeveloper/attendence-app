export function getAcademicMonths(startYear: number) {
  const months = [
    { month: 8, label: "September" },
    { month: 9, label: "October" },
    { month: 10, label: "November" },
    { month: 11, label: "December" },
    { month: 0, label: "January" },
    { month: 1, label: "February" },
    { month: 2, label: "March" },
    { month: 3, label: "April" },
    { month: 4, label: "May" },
  ];

  return months.map((m) => ({
    ...m,
    year: m.month >= 8 ? startYear : startYear + 1,
  }));
}
