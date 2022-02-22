// import {  } from 'vue';

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
 * Export
 *
 * -------------------------------- */

export { IOptions };
