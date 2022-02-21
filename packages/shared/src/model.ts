/* -----------------------------------
 *
 * Options
 *
 * -------------------------------- */

interface IOptions {
  attributes?: string[];
  formatProps?: (props: any) => any;
  wrapComponent?: (child: any) => any;
}

/* -----------------------------------
 *
 * Errors
 *
 * -------------------------------- */

enum ErrorTypes {
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
  __slots?: { [index: string]: any };
  __instance?: any;
  __children?: any[];
  __options: IOptions;
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { ErrorTypes, IOptions, CustomElement };
