import { IProps, CustomElement, ErrorTypes, selfClosingTags } from './model';

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
 * parseHtml
 *
 * -------------------------------- */

function parseHtml(htmlString: string) {
  const dom = getDocument(htmlString);

  if (!dom) {
    return void 0;
  }

  return domToArray(dom);
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
 * domToArray
 *
 * -------------------------------- */

function domToArray(node: Element) {
  if(node.nodeType === 3) {
    return [null, {}, node.textContent?.trim() || ''];
  }

  const nodeName = String(node.nodeName).toLowerCase();
  const childNodes = Array.from(node.childNodes);

  if (nodeName === 'script' || node.nodeType !== 1) {
    return [];
  }

  const children = () => childNodes.map((child: Element) => domToArray(child));
  const props = getAttributeObject(node.attributes);

  if (nodeName === 'script') {
    return [];
  }

  if (nodeName === 'body') {
    return [null, {}, children()];
  }

  if (selfClosingTags.includes(nodeName)) {
    return [nodeName, props, []];
  }

  return [nodeName, props, children()];
}

/* -----------------------------------
 *
 * getAttributeObject
 *
 * -------------------------------- */

function getAttributeObject(attributes: NamedNodeMap): IProps {
  const result = {};

  if (!attributes?.length) {
    return result;
  }

  for (let i = attributes.length - 1; i >= 0; i--) {
    const item = attributes[i];

    result[item.name] = item.value;
  }

  return result;
}

/* -----------------------------------
 *
 * getAttributeProps
 *
 * -------------------------------- */

function getAttributeProps(attributes: NamedNodeMap, allowed?: string[]): IProps {
  const values = getAttributeObject(attributes);

  let result = {};

  for (const key of Object.keys(values)) {
    if (allowed?.indexOf(key) === -1) {
      continue;
    }

    result[getPropKey(key)] = values[key];
  }

  return result;
}

/* -----------------------------------
 *
 * Attribute
 *
 * -------------------------------- */

function getPropKey(value: string) {
  const sanitised = value.trim().replace(/[\s_]/g, '-');

  return (
    sanitised.charAt(0).toLowerCase() +
    sanitised.slice(1).replace(/-([a-z])/g, ({ 1: value }) => value.toUpperCase())
  );
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { parseJson, parseHtml, getDocument, getPropKey, getAttributeObject, getAttributeProps };
