import { h, render, ComponentFactory, FunctionComponent } from 'preact';
import Markup from 'preact-markup';

/* -----------------------------------
 *
 * Types
 *
 * -------------------------------- */

type ComponentType<P = {}> = () => ComponentFactory<P> | Promise<ComponentFactory<P>>;

/* -----------------------------------
 *
 * Element
 *
 * -------------------------------- */

interface CustomElement extends HTMLElement {
  __component: ComponentType;
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
  child: ComponentType<P>,
  attributes: string[] = []
): FunctionComponent<P> {
  const preRender = typeof window === 'undefined';

  if (!preRender) {
    customElements.define(tagName, setupElement(child, attributes));

    return;
  }

  const content = child();

  if (isPromise(content)) {
    throw new Error('Error: Promises cannot be used for preactement SSR');
  }

  return (props: P) =>
    h(tagName, { server: true }, [
      h('script', {
        type: 'application/json',
        dangerouslySetInnerHTML: { __html: JSON.stringify(props) },
      }),
      h(content, { ...props, attributes: {} }),
    ]);
}

/* -----------------------------------
 *
 * Element
 *
 * -------------------------------- */

function setupElement<T>(component: ComponentType<T>, attributes: string[]): any {
  function CustomElement() {
    const element = Reflect.construct(HTMLElement, [], CustomElement);

    element.__component = component;
    element.__attributes = attributes;

    return element;
  }

  CustomElement.prototype = Object.create(HTMLElement.prototype);
  CustomElement.prototype.constructor = CustomElement;
  CustomElement.prototype.connectedCallback = onConnected;
  // CustomElement.prototype.attributeChangedCallback = attributeChangedCallback;
  CustomElement.prototype.disconnectedCallback = onDisconnected;

  return CustomElement;
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
  const data = JSON.parse(props || json.innerHTML || '{}');

  this.removeAttribute('props');

  json?.remove();

  let component = this.__component();

  if (isPromise(component)) {
    component = await component;
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

    if (element.__attributes.indexOf(item.name) > -1) {
      const key = item.name.replace(/-([a-z])/g, (value) => value[1].toUpperCase());

      result[key] = item.value;

      element.removeAttribute(item.name);
    }
  }

  return result;
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { define };
