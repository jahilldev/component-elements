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

function createElement<T>(component: ComponentFactory<T>): CustomElementConstructor {
  const element = Object.create(HTMLElement.prototype);

  element.prototype.connectedCallback = () => console.log('CONNECT!');
  element.prototype.disconnectedCallback = () => console.log('DISCONNECT!');

  return element;
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { define };
