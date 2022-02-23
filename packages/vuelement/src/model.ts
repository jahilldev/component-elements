import { App } from 'vue';
import { CustomElement as SharedElement } from '@component-elements/shared';

/* -----------------------------------
 *
 * IOptions
 *
 * -------------------------------- */

interface IOptions {
  attributes?: string[];
  formatProps?: <P>(props: P) => any;
  wrapComponent?: (child: any) => any;
}

/* -----------------------------------
 *
 * Element
 *
 * -------------------------------- */

interface CustomElement extends SharedElement {
  __properties: any;
  __application?: App;
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { IOptions, CustomElement };
