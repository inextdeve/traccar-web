export class MapButton {
  constructor(icon, callback) {
    this.callback = callback;
    this.icon = icon;
  }

  onAdd() {
    const div = document.createElement("div");
    div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    div.innerHTML = `<button style="padding: 4px">${this.icon}</button>`;
    div.addEventListener("contextmenu", (e) => e.preventDefault());
    div.addEventListener("click", () => {
      if (this.callback) {
        this.callback();
      }
    });

    return div;
  }
}
export default MapButton;
