/* eslint-disable */
 
// ----------------------------------------------
// Get locations from HTML
// ----------------------------------------------
 
 
// ----------------------------------------------
// Create the map and attach it to the #map
// ----------------------------------------------

export const displayMap = (locations)=>{
  const map = L.map('map', { zoomControl: false });
 
// ----------------------------------------------
// Add a tile layer to add to our map
// ----------------------------------------------
 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
 
// ----------------------------------------------
// Create icon using the image provided by Jonas
// ----------------------------------------------
 
var greenIcon = L.icon({
  iconUrl: '/img/pin.png',
  iconSize: [30, 40], // size of the icon
  iconAnchor: [16, 45], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -50], // point from which the popup should open relative to the iconAnchor
});
 
// ----------------------------------------------
// Add locations to the map
// ----------------------------------------------
 
const points = [];
locations.forEach(loc => {
  // Create points
  points.push([loc.coordinates[1], loc.coordinates[0]]);
 
  // Add markers
  L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: greenIcon })
    .addTo(map)
    // Add popup
    .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
      autoClose: false,
      className: 'mapPopup',
    })
    .openPopup();
});
 
// ----------------------------------------------
// Set map bounds to include current location
// ----------------------------------------------
 
const bounds = L.latLngBounds(points,{
  padding:{
top:200 ,
bottom:200,
left:100,
right:100
  }
}).pad(0.5);
map.fitBounds(bounds);
 
// Disable scroll on map
map.scrollWheelZoom.disable();

}
 
