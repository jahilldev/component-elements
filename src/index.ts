import {
  h,
  render,
  ComponentFactory,
  FunctionComponent,
  ComponentType,
  ComponentChildren,
} from 'preact';
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
  __mounted: boolean;
  __component: ComponentFunction;
  __attributes: string[];
  __properties?: object;
  __instance?: ComponentType<any>;
  __children?: any[];
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
    const CustomElement = function () {
      const element = Reflect.construct(HTMLElement, [], CustomElement);

      element.__mounted = false;
      element.__component = component;
      element.__attributes = attributes;
      element.__properties = {};
      element.__children = [];

      return element;
    };

    CustomElement.observedAttributes = attributes;

    CustomElement.prototype = Object.create(HTMLElement.prototype);
    CustomElement.prototype.constructor = CustomElement;
    CustomElement.prototype.connectedCallback = onConnected;
    CustomElement.prototype.attributeChangedCallback = onAttributeChange;
    CustomElement.prototype.disconnectedCallback = onDisconnected;

    return CustomElement;
  }

  return class CustomElement extends HTMLElement {
    __mounted = false;
    __component = component;
    __attributes = attributes;
    __properties = {};
    __children = [];

    static observedAttributes = attributes;

    public connectedCallback() {
      onConnected.call(this);
    }

    public attributeChangedCallback(...args) {
      onAttributeChange.call(this, ...args);
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

  this.__properties = { ...data, ...attributes };
  this.__instance = component;
  this.__children = children || [];
  this.__mounted = true;

  this.removeAttribute('server');
  this.innerHTML = '';

  render(h(component, { ...data, ...attributes, children }), this);
}

/* -----------------------------------
 *
 * Attribute
 *
 * -------------------------------- */

function onAttributeChange(this: CustomElement, name: string, original: string, updated: string) {
  if (!this.__mounted) {
    return;
  }

  updated = updated == null ? undefined : updated;

  const props = this.__properties;

  props[getPropKey(name)] = updated;

  this.removeAttribute(name);

  render(h(this.__instance, { ...props, children: this.__children }), this);
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

    result[getPropKey(item.name)] = item.value;

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
 * Attribute
 *
 * -------------------------------- */

function getPropKey(value: string) {
  return value.replace(/-([a-z])/g, (value) => value[1].toUpperCase());
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
 * Export
 *
 * -------------------------------- */

export { define };
