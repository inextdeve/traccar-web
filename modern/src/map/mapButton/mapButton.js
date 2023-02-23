import React from "react";

export class MapButton {
  constructor(icon, callback) {
    this.callback = callback;
    this.icon = icon;

    this.div = document.createElement("div");
  }

  onAdd() {

    this.div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    this.div.innerHTML = `<button style="padding: 4px">${this.icon}</button>`;
    this.div.addEventListener("contextmenu", (e) => e.preventDefault());
    this.div.addEventListener("click", () => {
      if (this.callback) {
        this.callback();
      }
    });

    return this.div;
  }

  onRemove() {
    this.div.remove();
  }
}

export class HTMLMapButton extends MapButton {
  constructor(html) {
    super();
  }
  onAdd() {
    const div = document.createElement("div");
  }
}

export default MapButton;
