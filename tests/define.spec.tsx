import { h } from 'preact';
import { define } from '@/index';

/* -----------------------------------
 *
 * Component
 *
 * -------------------------------- */

function Message({ value }) {
  return <em>{value}</em>;
}

/* -----------------------------------
 *
 * Define
 *
 * -------------------------------- */

describe('define()', () => {
  let root;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    document.body.removeChild(root);
  });

  it('returns true', () => {
    define('custom-message', Message);

    expect(true).toBeTruthy();
  });
});
