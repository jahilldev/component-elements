import { h, ComponentFactory, Fragment } from 'preact';
import { ErrorTypes, CustomElement, IProps } from './model';

/* -----------------------------------
 *
 * IParsed
 *
 * -------------------------------- */

interface IParsed {
  [index: string]: any;
  slots?: { [index: string]: JSX.Element };
  result?: () => JSX.Element;
}

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

function parseHtml(this: CustomElement): IParsed {
  const dom = getXmlDocument(this.innerHTML);

  if (!dom) {
    return {};
  }

  const result = convertToVDom.call(this, dom);

  return {
    slots: this.__slots,
    result: () => result as JSX.Element,
  };
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

  return nodes.getElementsByTagName('xml')[0];
}

/* -----------------------------------
 *
 * convertToVDom
 *
 * -------------------------------- */

function convertToVDom(this: CustomElement, node: Element) {
  if (node.nodeType === 3) {
    return node.textContent || '';
  }

  if (node.nodeType !== 1) {
    return null;
  }

  const nodeName = String(node.nodeName).toLowerCase();
  const childNodes = Array.from(node.childNodes);
  const children = () => childNodes.map((child) => convertToVDom.call(this, child));
  const { slot, ...props } = getAttributeProps(node.attributes);

  if (nodeName === 'script') {
    return null;
  }

  if (nodeName === 'xml') {
    return h(Fragment, {}, children());
  }

  if (slot) {
    this.__slots[slot] = h(Fragment, {}, children());

    return null;
  }

  return h(nodeName, props, children());
}

/* -----------------------------------
 *
 * getAttributeProps
 *
 * -------------------------------- */

function getAttributeProps(attributes: NamedNodeMap, allowed?: string[]): IProps {
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
