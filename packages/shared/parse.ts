import { CustomElement, ErrorTypes } from './model';

/* -----------------------------------
 *
 * parseJson
 *
 * -------------------------------- */

function parseJson(this: CustomElement, value: string) {
  const { tagName } = this;
  const { formatProps } = this.__options;

  let result = {};

  try {
    result = JSON.parse(value);
  } catch {
    console.error(ErrorTypes.Json, `: <${tagName.toLowerCase()}>`);
  }

  if (formatProps) {
    result = formatProps(result);
  }

  return result;
}

/* -----------------------------------
 *
 * getDocument
 *
 * -------------------------------- */

function getDocument(html: string) {
  const value = `<!DOCTYPE html>\n<html><body>${html}</body></html>`;

  let nodes: Document;

  try {
    nodes = new DOMParser().parseFromString(value, 'text/html');
  } catch {
    // no-op
  }

  if (!nodes) {
    return void 0;
  }

  return nodes.body;
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { parseJson, getDocument };
