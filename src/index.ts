import { h, render, ComponentFactory } from 'preact';

/* -----------------------------------
 *
 * Define
 *
 * -------------------------------- */

function define<T>(tagName: string, component: ComponentFactory<T>) {
  const preRender = typeof window === 'undefined';

  if (!preRender) {
    const element = createElement(component);

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

function createElement<T>(component: ComponentFactory<T>): any {
  function CustomElement() {
    return Reflect.construct(HTMLElement, [], CustomElement);
  }

  CustomElement.prototype = Object.create(HTMLElement.prototype);
  CustomElement.prototype.constructor = CustomElement;
  CustomElement.prototype.connectedCallback = () => console.log('CONNECT!');
  // CustomElement.prototype.attributeChangedCallback = attributeChangedCallback;
  CustomElement.prototype.disconnectedCallback = () => console.log('DISCONNECT!');

  return CustomElement;
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { define };
