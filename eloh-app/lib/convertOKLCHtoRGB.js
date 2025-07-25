import * as culori from "culori";

/**
 * Converts all `oklch()` color values in inline and computed styles of a DOM subtree
 * to standard `rgb()` format so that libraries like `html2canvas` can render them properly.
 *
 * @param {HTMLElement} rootElement - The root DOM element to start scanning from.
 * All child elements will also be scanned.
 *
 * @example
 * // Usage
 * const container = document.getElementById('preview');
 * convertOKLCHtoRGB(container);
 */
export function convertOKLCHtoRGB(rootElement) {
  if (!rootElement) return;

  const allElements = [rootElement, ...rootElement.querySelectorAll("*")];

  allElements.forEach((el) => {
    const style = getComputedStyle(el);
    const colorProps = [
      "color",
      "background-color",
      "border-color",
      "outline-color",
    ];

    colorProps.forEach((prop) => {
      const value = style.getPropertyValue(prop);
      if (value && value.includes("oklch")) {
        try {
          const parsed = culori.parse(value.trim());
          if (!parsed) return;

          const rgb = culori.converter("rgb")(parsed);
          const rgbStr = `rgb(${Math.round(rgb.r * 255)}, ${Math.round(
            rgb.g * 255
          )}, ${Math.round(rgb.b * 255)})`;

          // Override with safe RGB color
          el.style.setProperty(prop, rgbStr);
        } catch (e) {
          console.warn(`Could not parse "${value}" from ${prop}`, e);
        }
      }
    });
  });
}
