import { getAttributeProps } from './parse';
import { CustomElement } from './model';

/* -----------------------------------
 *
 * Async
 *
 * -------------------------------- */

function getAsyncComponent(component: any, tagName: string): Promise<any> {
  return component.then((response) => getComponentResult(response, tagName));
}

/* -----------------------------------
 *
 * Result
 *
 * -------------------------------- */

function getComponentResult(response: Function | object, tagName: string) {
  if (typeof response === 'function') {
    return response;
  }

  if (typeof response === 'object') {
    return response[getNameFromTag(tagName)] || void 0;
  }

  return void 0;
}

/* -----------------------------------
 *
 * Element
 *
 * -------------------------------- */

function getElementTag(tagName: string) {
  let result = tagName.toLowerCase();

  if (result.indexOf('-') < 0) {
    result = 'component-' + result;
  }

  return result;
}

/* -----------------------------------
 *
 * Tag
 *
 * -------------------------------- */

function getNameFromTag(value: string) {
  value = value.toLowerCase();

  return value.replace(/(^\w|-\w)/g, (item) => item.replace(/-/, '').toUpperCase());
}

/* -----------------------------------
 *
 * Attributes
 *
 * -------------------------------- */

function getElementAttributes(this: CustomElement) {
  const { attributes = [] } = this.__options;

  const result = {};

  if (!this.hasAttributes()) {
    return result;
  }

  return getAttributeProps(this.attributes, attributes);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { getElementTag, getElementAttributes, getAsyncComponent };
