import React, { createElement, ComponentFactory, Fragment } from 'react';
import { CustomElement, parseHtml, selfClosingTags, getPropKey } from '@component-elements/shared';

/* -----------------------------------
 *
 * parseChildren
 *
 * -------------------------------- */

function parseChildren(this: CustomElement): ComponentFactory<{}, any> {
  const children = parseHtml(this.innerHTML);

  if (!children.length) {
    return void 0;
  }

  const result = convertToVDom.call(this, children);

  return () => result;
}

/* -----------------------------------
 *
 * convertToVDom
 *
 * -------------------------------- */

function convertToVDom(this: CustomElement, [nodeName, {slot, ...props}, children]: any) {
  if(typeof children === 'string') {
    return children.trim();
  }

  if(nodeName === void 0) {
    return null;
  }

  const childNodes = () => children.map((child) =>
    child.length ? convertToVDom.call(this, child) : void 0
  );

  if (nodeName === null) {
    return createElement(Fragment, {}, childNodes());
  }

  if (selfClosingTags.includes(nodeName)) {
    return createElement(nodeName, props);
  }

  if (slot) {
    this.__slots[getPropKey(slot)] = getSlotChildren(childNodes());

    return null;
  }

  return createElement(nodeName, props, childNodes());
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

export { parseChildren };
