import { h, ComponentFactory, Fragment } from 'preact';
import { CustomElement, parseHtml, selfClosingTags, getPropKey } from '@component-elements/shared';

/* -----------------------------------
 *
 * parseChildren
 *
 * -------------------------------- */

function parseChildren(this: CustomElement): ComponentFactory<{}> {
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

  if(nodeName === 'script') {
    return null;
  }

  const childNodes = () => children.map((child) => convertToVDom.call(this, child));

  if (nodeName === 'body') {
    return h(Fragment, {}, childNodes());
  }

  if (selfClosingTags.includes(nodeName)) {
    return h(nodeName, props);
  }

  if (slot) {
    this.__slots[getPropKey(slot)] = getSlotChildren(childNodes());

    return null;
  }

  return h(nodeName, props, childNodes());
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

export { parseChildren };
