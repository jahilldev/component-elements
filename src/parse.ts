import { h, ComponentFactory, Fragment } from 'preact';
import { ErrorTypes, CustomElement } from './model';

/* -----------------------------------
 *
 * parseJson
 *
 * -------------------------------- */

function parseJson(this: CustomElement, value: string): object {
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

function parseHtml(this: CustomElement): ComponentFactory<{}> {
  const dom = getXmlDocument(this.innerHTML);

  if (!dom) {
    return void 0;
  }

  const result = convertToVDom(dom) as JSX.Element;

  return () => result;
}

/* -----------------------------------
 *
 * getXmlDocument
 *
 * -------------------------------- */

function getXmlDocument(html: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<xml>${html}</xml>`;

  let nodes: Document;

  try {
    nodes = new DOMParser().parseFromString(xml, 'application/xml');
  } catch (error) {
    throw new Error(error);
  }

  if (!nodes) {
    return void 0;
  }

  const result = nodes.getElementsByTagName('xml')[0];

  return result;
}

/* -----------------------------------
 *
 * convertToVDom
 *
 * -------------------------------- */

function convertToVDom(node: Element) {
  if (node.nodeType === 3) {
    return node.textContent || '';
  }

  if (node.nodeType !== 1) {
    return null;
  }

  const nodeName = String(node.nodeName).toLowerCase();
  const children = () => [].map.call(node.childNodes, convertToVDom);

  if (nodeName === 'script') {
    return null;
  }

  if (nodeName === 'xml') {
    return h(Fragment, {}, children());
  }

  return h(nodeName, getAttributeProps(node.attributes), children());
}

/* -----------------------------------
 *
 * getAttributeProps
 *
 * -------------------------------- */

function getAttributeProps(attributes: NamedNodeMap, allowed?: string[]) {
  if (!attributes?.length) {
    return {};
  }

  let result = {};

  for (var i = attributes.length - 1; i >= 0; i--) {
    const item = attributes[i];

    if (allowed?.indexOf(item.name) === -1) {
      continue;
    }

    result[getPropKey(item.name)] = item.value;
  }

  return result;
}

/* -----------------------------------
 *
 * Attribute
 *
 * -------------------------------- */

function getPropKey(value: string) {
  return value.replace(/-([a-z])/g, (value) => value[1].toUpperCase());
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { parseJson, parseHtml, getPropKey, getAttributeProps };
