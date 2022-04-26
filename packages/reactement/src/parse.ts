import React, { createElement, ComponentFactory, Fragment } from 'react';
import {
  CustomElement,
  getDocument,
  getAttributeObject,
  selfClosingTags,
  getPropKey
} from '@component-elements/shared';

/* -----------------------------------
 *
 * parseHtml
 *
 * -------------------------------- */

function parseHtml(this: CustomElement): ComponentFactory<{}, any> {
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
    return createElement(Fragment, {}, children());
  }

  if (selfClosingTags.includes(nodeName)) {
    return createElement(nodeName, props);
  }

  if (slot) {
    this.__slots[getPropKey(slot)] = getSlotChildren(children());

    return null;
  }

  return createElement(nodeName, { ...props, key: Math.random() }, children());
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

  return createElement(Fragment, {}, children);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { parseHtml };
