import { h, render, ComponentFactory } from 'preact';
import Markup from 'preact-markup';

/* -----------------------------------
 *
 * Types
 *
 * -------------------------------- */

type ComponentType<T = {}> = () => ComponentFactory<T> | Promise<ComponentFactory<T>>;

/* -----------------------------------
 *
 * Element
 *
 * -------------------------------- */

interface CustomElement extends HTMLElement {
  component: ComponentType;
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

function define<T>(tagName: string, component: ComponentType<T>) {
  const preRender = typeof window === 'undefined';

  if (!preRender) {
    const element = setupElement(component);

    return customElements.define(tagName, element);
  }

  const content = component();

  if (isPromise(content)) {
    throw new Error('Error: Promises cannot be used for SSR');
  }

  return (props: T) =>
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

function setupElement<T>(component: ComponentType<T>): any {
  function CustomElement() {
    const element = Reflect.construct(HTMLElement, [], CustomElement);

    element.component = component;

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
  const props = this.getAttribute('props');
  const json = this.querySelector('[type="application/json"]');
  const data = JSON.parse(props || json?.innerHTML || '{}');

  this.removeAttribute('props');

  json?.remove();

  let component = this.component();

  if (isPromise(component)) {
    component = await component;
  }

  let children;

  if (!this.hasAttribute('server')) {
    children = h(Markup, { markup: this.innerHTML, wrap: false });
  }

  this.removeAttribute('server');
  this.innerHTML = '';

  render(h(component, { ...data, children }), this);
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
 * Export
 *
 * -------------------------------- */

export { define };
