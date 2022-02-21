import { h, ComponentFactory, Fragment } from 'preact';
import { getDocument, getAttributeObject } from '@component-elements/shared';
import { CustomElement } from './model';

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
 * convertToVDom
 *
 * -------------------------------- */

function convertToVDom(this: CustomElement, node: Element) {
  if (node.nodeType === 3) {
    return node.textContent?.trim() || '';
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

export { parseHtml };
