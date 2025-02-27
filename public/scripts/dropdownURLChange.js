document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("regionSelector");
  const url = new URL(window.location);
  const selectedRegion = url.searchParams.get("region") || "All";
  //Set the region selector to the selected region
  dropdown.value = selectedRegion;
  dropdown.addEventListener("change", () => {
    const newRegion = dropdown.value;
  
    if (selectedRegion === "All") {
      url.searchParams.delete("region");
    } else {
      url.searchParams.set("region", newRegion);
    }
    window.history.pushState({}, "", url);
    location.reload();
  });
});