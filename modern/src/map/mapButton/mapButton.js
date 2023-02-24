import React from "react";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="500.000000pt" height="500.000000pt" viewBox="0 0 500.000000 500.000000" preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,500.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
<path d="M1036 4658 c-13 -19 -16 -58 -16 -230 l0 -208 -321 0 c-317 0 -351 -3 -371 -34 -4 -6 -8 -96 -8 -201 0 -104 4 -195 8 -201 22 -34 32 -34 1787 -34 l1736 0 24 25 c25 24 25 26 25 210 0 184 0 186 -25 210 l-24 25 -326 0 -325 0 0 208 c0 172 -3 211 -16 230 l-15 22 -1059 0 -1059 0 -15 -22z m2014 -336 c0 -172 3 -211 16 -230 15 -22 15 -22 350 -22 l334 0 0 -85 0 -85 -1640 0 -1640 0 0 85 0 85 335 0 334 0 16 30 c12 23 15 69 15 230 l0 200 940 0 940 0 0 -208z"/>
<path d="M730 3570 c-20 -20 -20 -33 -20 -1380 l0 -1361 25 -24 24 -25 1351 0 1351 0 24 25 c29 28 32 70 9 103 l-15 22 -1310 0 -1309 0 0 1255 0 1255 1250 0 1250 0 0 -274 c0 -261 1 -274 21 -300 26 -33 79 -36 109 -6 19 19 20 33 20 355 0 322 -1 336 -20 355 -20 20 -33 20 -1380 20 -1347 0 -1360 0 -1380 -20z"/>
<path d="M1430 3100 c-20 -20 -20 -33 -20 -913 0 -872 0 -894 19 -911 29 -26 91 -24 113 4 17 21 18 72 18 911 0 876 0 889 -20 909 -12 12 -33 20 -55 20 -22 0 -43 -8 -55 -20z"/>
<path d="M2055 3095 l-25 -24 0 -313 c0 -172 3 -323 6 -335 3 -12 21 -29 40 -38 30 -14 37 -14 69 -1 l35 15 0 345 0 345 -22 15 c-33 23 -75 20 -103 -9z"/>
<path d="M2680 3100 c-16 -16 -20 -33 -20 -90 0 -62 3 -74 25 -95 30 -30 64 -32 99 -4 24 19 26 26 26 95 0 88 -17 114 -75 114 -22 0 -43 -8 -55 -20z"/>
<path d="M2820 2749 c-267 -69 -476 -269 -560 -534 -34 -108 -39 -285 -11 -395 39 -154 132 -315 234 -405 209 -184 510 -248 761 -164 71 24 170 73 212 105 17 13 36 24 42 24 6 0 36 -23 66 -51 l56 -51 -40 -44 c-25 -27 -40 -53 -40 -69 0 -32 33 -68 467 -501 328 -328 346 -344 381 -344 34 0 47 10 165 128 116 117 127 130 127 164 0 35 -17 54 -344 381 -433 434 -469 467 -501 467 -16 0 -42 -15 -69 -40 l-44 -40 -51 56 c-28 30 -51 60 -51 66 0 6 11 25 24 42 39 52 95 171 118 253 29 104 31 287 3 383 -56 198 -159 346 -314 452 -145 99 -272 138 -445 137 -76 0 -134 -6 -186 -20z m303 -140 c218 -32 424 -223 493 -454 22 -74 24 -227 5 -305 -57 -224 -234 -405 -455 -466 -257 -70 -546 47 -690 279 -81 131 -108 266 -86 427 18 131 69 231 172 337 69 71 98 92 174 129 123 60 237 76 387 53z m1051 -1668 l329 -329 -57 -58 -58 -57 -331 331 -332 332 55 55 c30 30 57 55 60 55 3 0 153 -148 334 -329z"/>
<path d="M2055 1585 c-24 -23 -25 -29 -25 -155 0 -126 1 -132 25 -155 28 -29 70 -32 103 -9 21 14 22 22 22 164 0 142 -1 150 -22 164 -33 23 -75 20 -103 -9z"/>
</g>
</svg>`;
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
  constructor() {
    super();
  }
  onAdd() {
    this.div.className =
      "mapboxgl-ctrl-geocoder mapboxgl-ctrl maplibregl-ctrl-geocoder maplibregl-ctrl mapboxgl-ctrl-geocoder--collapsed maplibregl-ctrl-geocoder--collapsed";
    this.div.innerHTML = `<svg class="mapboxgl-ctrl-geocoder--icon mapboxgl-ctrl-geocoder--icon-search maplibregl-ctrl-geocoder--icon maplibregl-ctrl-geocoder--icon-search" viewBox="0 0 18 18" xml:space="preserve" width="18" height="18"><path d="M7.4 2.5c-2.7 0-4.9 2.2-4.9 4.9s2.2 4.9 4.9 4.9c1 0 1.8-.2 2.5-.8l3.7 3.7c.2.2.4.3.8.3.7 0 1.1-.4 1.1-1.1 0-.3-.1-.5-.3-.8L11.4 10c.4-.8.8-1.6.8-2.5.1-2.8-2.1-5-4.8-5zm0 1.6c1.8 0 3.2 1.4 3.2 3.2s-1.4 3.2-3.2 3.2-3.3-1.3-3.3-3.1 1.4-3.3 3.3-3.3z"></path></svg><input type="text" class="mapboxgl-ctrl-geocoder--input maplibregl-ctrl-geocoder--input" placeholder="Search" aria-label="Search" kl_vkbd_parsed="true"><div class="suggestions-wrapper"><ul class="suggestions" style="display: none;"></ul></div><div class="mapboxgl-ctrl-geocoder--pin-right maplibregl-ctrl-geocoder--pin-right"><button aria-label="Clear" class="mapboxgl-ctrl-geocoder--button maplibregl-ctrl-geocoder--button"><svg class="mapboxgl-ctrl-geocoder--icon mapboxgl-ctrl-geocoder--icon-close maplibregl-ctrl-geocoder--icon maplibregl-ctrl-geocoder--icon-close" viewBox="0 0 18 18" xml:space="preserve" width="18" height="18"><path d="M3.8 2.5c-.6 0-1.3.7-1.3 1.3 0 .3.2.7.5.8L7.2 9 3 13.2c-.3.3-.5.7-.5 1 0 .6.7 1.3 1.3 1.3.3 0 .7-.2 1-.5L9 10.8l4.2 4.2c.2.3.7.3 1 .3.6 0 1.3-.7 1.3-1.3 0-.3-.2-.7-.3-1l-4.4-4L15 4.6c.3-.2.5-.5.5-.8 0-.7-.7-1.3-1.3-1.3-.3 0-.7.2-1 .3L9 7.1 4.8 2.8c-.3-.1-.7-.3-1-.3z"></path></svg></button><svg class="mapboxgl-ctrl-geocoder--icon mapboxgl-ctrl-geocoder--icon-loading maplibregl-ctrl-geocoder--icon maplibregl-ctrl-geocoder--icon-loading" viewBox="0 0 18 18" xml:space="preserve" width="18" height="18"><path fill="#333" d="M4.4 4.4l.8.8c2.1-2.1 5.5-2.1 7.6 0l.8-.8c-2.5-2.5-6.7-2.5-9.2 0z"></path><path opacity=".1" d="M12.8 12.9c-2.1 2.1-5.5 2.1-7.6 0-2.1-2.1-2.1-5.5 0-7.7l-.8-.8c-2.5 2.5-2.5 6.7 0 9.2s6.6 2.5 9.2 0 2.5-6.6 0-9.2l-.8.8c2.2 2.1 2.2 5.6 0 7.7z"></path></svg></div>`;
    this.div.addEventListener("mouseenter", () => {
      this.div.className =
        "mapboxgl-ctrl-geocoder mapboxgl-ctrl maplibregl-ctrl-geocoder maplibregl-ctrl";
    });
    this.div.addEventListener("mouseleave", () => {
      this.div.className +=
        "mapboxgl-ctrl-geocoder--collapsed maplibregl-ctrl-geocoder--collapsed";
    });
    this.div.addEventListener("contextmenu", (e) => e.preventDefault());

    return this.div;
  }
  onRemove() {
    this.div.remove();
  }
}

export default MapButton;
