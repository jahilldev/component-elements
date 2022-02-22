/* -----------------------------------
 *
 * Options
 *
 * -------------------------------- */

interface IOptions<F = any, W = any> {
  attributes?: string[];
  formatProps?: (props: any) => F;
  wrapComponent?: (child: any) => W;
}

/* -----------------------------------
 *
 * Errors
 *
 * -------------------------------- */

enum ErrorTypes {
  Promise = 'Error: Promises cannot be used for SSR',
  Missing = 'Error: Cannot find component in provided function',
  Json = 'Error: Invalid JSON string passed to component',
}

/* -----------------------------------
 *
 * Element
 *
 * -------------------------------- */

interface CustomElement<C = any, I = any> extends HTMLElement {
  __mounted: boolean;
  __component: C;
  __properties?: object;
  __slots?: { [index: string]: any };
  __instance?: I;
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
 * Guards
 *
 * -------------------------------- */

const isPromise = (input: any): input is Promise<any> => {
  return input && typeof input.then === 'function';
};

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { ErrorTypes, IOptions, IProps, CustomElement, isPromise };
