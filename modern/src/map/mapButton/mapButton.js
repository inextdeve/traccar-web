export class MapButton {
  constructor(icon, callback, id) {
    this.callback = callback;
    this.icon = icon;
    this.id = id;
  }

  onAdd() {
    const div = document.createElement("div");
    div.setAttribute("id", this.id);
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
  onRemove() {
    document.getElementById(this.id)?.remove();
  }
}
export default MapButton;
