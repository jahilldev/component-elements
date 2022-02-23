import { ComponentFactory } from 'react';

/* -----------------------------------
 *
 * Types
 *
 * -------------------------------- */

type ComponentFunction<P = {}> = () => ComponentResult<P>;
type ComponentResult<P = {}> = ComponentFactory<P, any> | ComponentAsync<P>;
type ComponentAsync<P = {}> =
  | Promise<ComponentFactory<P, any>>
  | Promise<{ [index: string]: ComponentFactory<P, any> }>;

/* -----------------------------------
 *
 * IOptions
 *
 * -------------------------------- */

interface IOptions {
  attributes?: string[];
  formatProps?: <P = any>(props: P) => P;
  wrapComponent?: <P>(child: ComponentFactory<P, any>) => any;
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { IOptions, ComponentFunction, ComponentResult, ComponentAsync };
