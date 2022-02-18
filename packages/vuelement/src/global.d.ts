/* -----------------------------------
 *
 * Components
 *
 * -------------------------------- */

declare module '*.vue' {
  interface IComponent {
    [key: string]: any;
  }

  const component: IComponent;

  export default component;
}
