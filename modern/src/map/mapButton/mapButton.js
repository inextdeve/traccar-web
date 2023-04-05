import React from "react";

const svg = "<svg class=\"mapboxgl-ctrl-geocoder--icon mapboxgl-ctrl-geocoder--icon-search maplibregl-ctrl-geocoder--icon maplibregl-ctrl-geocoder--icon-search\" viewBox=\"0 0 24 24\" xml:space=\"preserve\" width=\"18\" height=\"18\"><path d=\"M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z\"></path></svg>";

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

export class SearchButton extends MapButton {
  constructor(callback) {
    super();
    this.callback = callback;
    this.div.className =
      "mapboxgl-ctrl-geocoder mapboxgl-ctrl maplibregl-ctrl-geocoder maplibregl-ctrl mapboxgl-ctrl-geocoder--collapsed maplibregl-ctrl-geocoder--collapsed";
    this.div.innerHTML = `${svg}`;

    this.searchInput = document.createElement("input");

    this.searchInput.setAttribute("type", "text");
    this.searchInput.setAttribute(
      "class",
      "mapboxgl-ctrl-geocoder--input maplibregl-ctrl-geocoder--input",
    );
    this.div.appendChild(this.searchInput);
  }

  onAdd() {
    this.div.addEventListener("mouseenter", () => {
      this.div.className =
        "mapboxgl-ctrl-geocoder mapboxgl-ctrl maplibregl-ctrl-geocoder maplibregl-ctrl";
    });

    this.div.addEventListener("mouseleave", () => {
      if (this.searchInput !== document.activeElement) {
        this.div.className +=
          "mapboxgl-ctrl-geocoder--collapsed maplibregl-ctrl-geocoder--collapsed";
      }
    });

    this.searchInput.addEventListener("blur", () => {
      this.div.className +=
        "mapboxgl-ctrl-geocoder--collapsed maplibregl-ctrl-geocoder--collapsed";
    });
    this.searchInput.addEventListener("keyup", (e) => {
      this.callback(e.target.value);
    });
    this.div.addEventListener("contextmenu", (e) => e.preventDefault());

    return this.div;
  }

  onRemove() {
    this.div.remove();
  }
}

export default MapButton;
