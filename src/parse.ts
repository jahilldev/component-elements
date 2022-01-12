import { h, ComponentFactory, Fragment } from 'preact';
import { ErrorTypes, CustomElement, IProps } from './model';

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

function parseHtml(this: CustomElement): ComponentFactory<{}> {
  const dom = getDocument(this.innerHTML);

  if (!dom) {
    return void 0;
  }

  const result = convertToVDom.call(this, dom);

  return () => result;
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
  const { slot, ...props } = getAttributeObject(node.attributes);

  if (nodeName === 'script') {
    return null;
  }

  if (nodeName === 'body') {
    return h(Fragment, {}, children());
  }

  if (slot) {
    this.__slots[slot] = getSlotChildren(children());

    return null;
  }

  return h(nodeName, props, children());
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
  return value.replace(/-([a-z])/g, (value) => value[1].toUpperCase());
}

/* -----------------------------------
 *
 * getSlotChildren
 *
 * -------------------------------- */

function getSlotChildren(children: JSX.Element[]) {
  const isString = (item) => typeof item === 'string';

  if (children.every(isString)) {
    return children.join(' ');
  }

  return h(Fragment, {}, children);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { parseJson, parseHtml, getPropKey, getAttributeProps };
