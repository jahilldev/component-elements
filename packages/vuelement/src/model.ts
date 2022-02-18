/* -----------------------------------
 *
 * Options
 *
 * -------------------------------- */

interface IOptions {
  attributes?: string[];
  formatProps?: (props: any) => any;
}

/* -----------------------------------
 *
 * Errors
 *
 * -------------------------------- */

enum ErrorTypes {
  Promise = 'Error: Promises cannot be used for preactement SSR',
  Missing = 'Error: Cannot find component in provided function',
  Json = 'Error: Invalid JSON string passed to component',
}

/* -----------------------------------
 *
 * Element
 *
 * -------------------------------- */

interface CustomElement extends HTMLElement {
  __mounted: boolean;
  __component: any;
  __properties?: object;
  __slots?: { [index: string]: any | string };
  __instance?: any;
  __children?: any[];
  __options: IOptions;
}

/* -----------------------------------
 *
 * IProps
 *
 * -------------------------------- */

interface IProps {
  [index: string]: any;
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { IOptions, IProps, ErrorTypes, CustomElement };
