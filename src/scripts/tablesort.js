function sortTableByColumn(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
  
    const currentOrder = table.getAttribute(`data-sort-${columnIndex}`) || "asc";
    const newOrder = currentOrder === "asc" ? "desc" : "asc";
  
    rows.sort((rowA, rowB) => {
      const cellA = rowA.children[columnIndex].textContent.trim();
      const cellB = rowB.children[columnIndex].textContent.trim();
  
      const comparison = isNaN(cellA) || isNaN(cellB)
        ? cellA.localeCompare(cellB)
        : parseFloat(cellA) - parseFloat(cellB);
  
      return newOrder === "asc" ? comparison : -comparison;
    });
  
    table.setAttribute(`data-sort-${columnIndex}`, newOrder);
    rows.forEach(row => tbody.appendChild(row));
  }
  
  window.sortTableByColumn = sortTableByColumn;
  