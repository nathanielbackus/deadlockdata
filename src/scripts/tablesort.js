function sortTableByColumn(table, columnNumber, asc = true) {
    const dirMondifier = asc ? 1 = -1;
    const tBody = table.tBodies[0];
    const row = Array.from(tBody.querySelectorAll("tr"));

    // Sort each row
    const sortedRows = rows.sort((a,b) => {
        console.log(a);
        console.log(b);
    });
}

sortTableByColumn(document.querySelector("table"), 1);