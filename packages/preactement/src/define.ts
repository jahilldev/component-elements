import { h, render, ComponentFactory, FunctionComponent } from 'preact';
import { parseJson, parseHtml, getPropKey, getAttributeProps } from './parse';
import {
  ComponentFunction,
  ComponentAsync,
  IProps,
  IOptions,
  CustomElement,
  ErrorTypes,
} from './model';

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
  options: IOptions = {}
): FunctionComponent<P> {
  const { wrapComponent } = options;
  const preRender = typeof window === 'undefined';
  const elementTag = getElementTag(tagName);

  if (!preRender) {
    customElements.define(elementTag, setupElement(child, options));

    return;
  }

  const content = child();

  if (isPromise(content)) {
    throw new Error(`${ErrorTypes.Promise} : <${tagName}>`);
  }

  let component = content;

  if (wrapComponent) {
    component = wrapComponent(content);
  }

  return (props: P) =>
    h(elementTag, { server: true }, [
      h('script', {
        type: 'application/json',
        dangerouslySetInnerHTML: { __html: JSON.stringify(props) },
      }),
      h(component, props),
    ]);
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
 * Setup
 *
 * -------------------------------- */

function setupElement<T>(component: ComponentFunction<T>, options: IOptions = {}): any {
  const { attributes = [] } = options;

  if (typeof Reflect !== 'undefined' && Reflect.construct) {
    const CustomElement = function () {
      const element = Reflect.construct(HTMLElement, [], CustomElement);

      element.__mounted = false;
      element.__component = component;
      element.__properties = {};
      element.__slots = {};
      element.__children = [];
      element.__options = options;

      return element;
    };

    CustomElement.observedAttributes = ['props', ...attributes];

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
    __properties = {};
    __slots = {};
    __children = [];
    __options = options;

    static observedAttributes = ['props', ...attributes];

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

function onConnected(this: CustomElement) {
  const attributes = getElementAttributes.call(this);
  const props = this.getAttribute('props');
  const json = this.querySelector('[type="application/json"]');
  const data = parseJson.call(this, props || json?.innerHTML || '{}');

  json?.remove();

  let children;

  if (!this.hasAttribute('server')) {
    children = h(parseHtml.call(this), {});
  }

  this.__properties = { ...this.__slots, ...data, ...attributes };
  this.__children = children || [];

  this.removeAttribute('server');
  this.innerHTML = '';

  const response = this.__component();
  const renderer = (result: ComponentFactory) => finaliseComponent.call(this, result);

  if (isPromise(response)) {
    getAsyncComponent(response, this.tagName).then(renderer);

    return;
  }

  renderer(response);
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

  updated = updated == null ? void 0 : updated;

  let props = this.__properties;

  if (name === 'props') {
    props = { ...props, ...parseJson.call(this, updated) };
  } else {
    props[getPropKey(name)] = updated;
  }

  this.__properties = props;

  render(h(this.__instance, { ...props, parent: this, children: this.__children }), this);
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
 * Finalise
 *
 * -------------------------------- */

function finaliseComponent(this: CustomElement, component: ComponentFactory<IProps>) {
  const { tagName } = this;
  const { wrapComponent } = this.__options;

  if (!component) {
    console.error(ErrorTypes.Missing, `: <${tagName.toLowerCase()}>`);

    return;
  }

  if (wrapComponent) {
    component = wrapComponent(component);
  }

  this.__instance = component;
  this.__mounted = true;

  const props = {
    ...this.__properties,
    parent: this,
    children: this.__children,
  };

  render(h(component, props), this);
}

/* -----------------------------------
 *
 * Component
 *
 * -------------------------------- */

function getAsyncComponent(
  component: ComponentAsync,
  tagName: string
): Promise<ComponentFactory> {
  let result: ComponentFactory;

  return component.then((response) => {
    if (typeof response === 'function') {
      return response;
    }

    if (typeof response === 'object') {
      result = response[getNameFromTag(tagName)] || void 0;
    }

    return result;
  });
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
