import { mdiPlus } from "https://esm.sh/@mdi/js";

export function e(
  name: string,
  contents: (string | Node)[] | string = [],
  options?: { [key: string]: (string | undefined) },
) {
  const el = document.createElement(name);
  if (options) {
    for (const property in options) {
      if (
        options[property] !== undefined &&
        Object.prototype.hasOwnProperty.call(options, property)
      ) {
        el.setAttribute(property, options[property]!);
      }
    }
  }
  if (typeof contents === "string") contents = [contents];
  if (contents.length > 0) el.append(...contents);
  return el;
}

const ICONS = {
  mdiPlus,
};

export function icon(name: keyof typeof ICONS) {
  const svgns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgns, "svg");
  const path = document.createElementNS(svgns, "path");
  svg.setAttributeNS(null, "viewport", "0 0 24 24");
  path.setAttributeNS(null, "fill", "currentColor");
  path.setAttributeNS(null, "d", ICONS[name]);
  svg.append(path);
  return svg;
}
