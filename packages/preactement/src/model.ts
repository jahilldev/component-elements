import { ComponentFactory, ComponentType } from 'preact';

/* -----------------------------------
 *
 * Types
 *
 * -------------------------------- */

type ComponentFunction<P = {}> = () => ComponentResult<P>;
type ComponentResult<P = {}> = ComponentFactory<P> | ComponentAsync<P>;
type ComponentAsync<P = {}> =
  | Promise<ComponentFactory<P>>
  | Promise<{ [index: string]: ComponentFactory<P> }>;

/* -----------------------------------
 *
 * Options
 *
 * -------------------------------- */

interface IOptions {
  attributes?: string[];
  formatProps?: (props: any) => any;
  wrapComponent?: <P>(child: ComponentFactory<P>) => ComponentFactory<P>;
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
  __component: ComponentFunction;
  __properties?: object;
  __slots?: { [index: string]: JSX.Element | string };
  __instance?: ComponentType<any>;
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

export {
  ComponentFunction,
  ComponentResult,
  ComponentAsync,
  IOptions,
  CustomElement,
  ErrorTypes,
  IProps,
};
