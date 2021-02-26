import { h, render, ComponentFactory, FunctionComponent, ComponentType } from 'preact';
import Markup from 'preact-markup';

/* -----------------------------------
 *
 * Types
 *
 * -------------------------------- */

type ComponentFunction<P = {}> = () => ComponentResult<P>;
type ComponentResult<P = {}> = ComponentFactory<P> | ComponentAsync<P>;
type ComponentAsync<P = {}> =
  | Promise<ComponentFactory<P>>
  | Promise<{ [index: string]: ComponentFactory<P> }>;

/* -----------------------------------
 *
 * Errors
 *
 * -------------------------------- */

enum ErrorTypes {
  Promise = 'Error: Promises cannot be used for preactement SSR',
  Missing = 'Error: Cannot find component in provided function',
}

/* -----------------------------------
 *
 * Element
 *
 * -------------------------------- */

interface CustomElement extends HTMLElement {
  __component: ComponentFunction;
  __attributes: string[];
}

/* -----------------------------------
 *
 * Guards
 *
 * -------------------------------- */

const isPromise = (input: any): input is Promise<any> => {
  return input && typeof input.then === 'function';
};

/* -----------------------------------
 *
 * Define
 *
 * -------------------------------- */

function define<P = {}>(
  tagName: string,
  child: ComponentFunction<P>,
  attributes: string[] = []
): FunctionComponent<P> {
  const preRender = typeof window === 'undefined';

  if (!preRender) {
    customElements.define(tagName, setupElement(child, attributes));

    return;
  }

  const content = child();

  if (isPromise(content)) {
    throw new Error(ErrorTypes.Promise);
  }

  return (props: P) =>
    h(tagName, { server: true }, [
      h('script', {
        type: 'application/json',
        dangerouslySetInnerHTML: { __html: JSON.stringify(props) },
      }),
      h(content, props),
    ]);
}

/* -----------------------------------
 *
 * Element
 *
 * -------------------------------- */

function setupElement<T>(component: ComponentFunction<T>, attributes: string[]): any {
  if (typeof Reflect !== 'undefined' && Reflect.construct) {
    function CustomElement() {
      const element = Reflect.construct(HTMLElement, [], CustomElement);

      element.__component = component;
      element.__attributes = attributes;

      return element;
    }

    CustomElement.prototype = Object.create(HTMLElement.prototype);
    CustomElement.prototype.constructor = CustomElement;
    CustomElement.prototype.connectedCallback = onConnected;
    CustomElement.prototype.disconnectedCallback = onDisconnected;

    return CustomElement;
  }

  return class CustomElement extends HTMLElement {
    __component = component;
    __attributes = attributes;

    public connectedCallback() {
      onConnected.call(this);
    }

    public disconnectedCallback() {
      onDisconnected.call(this);
    }
  };
}

/* -----------------------------------
 *
 * Connected
 *
 * -------------------------------- */

async function onConnected(this: CustomElement) {
  const attributes = getElementAttributes(this);
  const props = this.getAttribute('props');
  const json = this.querySelector('[type="application/json"]');
  const data = JSON.parse(props || json?.innerHTML || '{}');

  this.removeAttribute('props');

  json?.remove();

  let response = this.__component();
  let component: ComponentType;

  if (isPromise(response)) {
    component = await getAsyncComponent(response, this.tagName);
  } else {
    component = response;
  }

  if (!component) {
    console.error(ErrorTypes.Missing);

    return;
  }

  let children;

  if (!this.hasAttribute('server')) {
    children = h(Markup, { markup: this.innerHTML, wrap: false });
  }

  this.removeAttribute('server');
  this.innerHTML = '';

  render(h(component, { ...data, ...attributes, children }), this);
}

/* -----------------------------------
 *
 * Disconnected
 *
 * -------------------------------- */

function onDisconnected(this: CustomElement) {
  render(null, this);
}

/* -----------------------------------
 *
 * Attributes
 *
 * -------------------------------- */

function getElementAttributes(element: CustomElement) {
  const result = {};

  if (!element.hasAttributes()) {
    return result;
  }

  for (var i = element.attributes.length - 1; i >= 0; i--) {
    const item = element.attributes[i];

    if (element.__attributes.indexOf(item.name) === -1) {
      continue;
    }

    const key = item.name.replace(/-([a-z])/g, (value) => value[1].toUpperCase());

    result[key] = item.value;

    element.removeAttribute(item.name);
  }

  return result;
}

/* -----------------------------------
 *
 * Component
 *
 * -------------------------------- */

async function getAsyncComponent(component: ComponentResult, tagName: string) {
  let result: ComponentFactory;

  const response = await component;

  if (typeof response === 'function') {
    return response;
  }

  if (typeof response === 'object') {
    result = response[getNameFromTag(tagName)] || void 0;
  }

  return result;
}

/* -----------------------------------
 *
 * Classname
 *
 * -------------------------------- */

function getNameFromTag(value: string) {
  value = value.toLowerCase();

  return value.replace(/(^\w|-\w)/g, (item) => item.replace(/-/, '').toUpperCase());
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { define };
