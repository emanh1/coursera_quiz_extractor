function downloadCSV(filename, rows) {
  const processRow = (row) =>
    row
      .map((val) => `"${(val || "").replace(/"/g, '""')}"`)
      .join(",");

  const csvContent = [processRow(["Question", "Answer", "Image"]), ...rows.map(processRow)].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.click();
}
