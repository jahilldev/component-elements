import { h, render, ComponentFactory } from 'preact';

/* -----------------------------------
 *
 * Element
 *
 * -------------------------------- */

interface CustomElement extends HTMLElement {
  component: ComponentFactory;
}

/* -----------------------------------
 *
 * Define
 *
 * -------------------------------- */

function define<T>(tagName: string, component: ComponentFactory<T>) {
  const preRender = typeof window === 'undefined';

  if (!preRender) {
    const element = setupElement(component);

    return customElements.define(tagName, element);
  }

  return (props: T) =>
    h(tagName, {}, [
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

function setupElement<T>(component: ComponentFactory<T>): any {
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

function onConnected(this: CustomElement) {
  const json = this.querySelector('[type="application/json"]');
  const data = JSON.parse(json?.innerHTML || '{}');

  json.remove();

  render(h(this.component, { ...data }), this);
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
