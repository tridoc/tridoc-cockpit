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
