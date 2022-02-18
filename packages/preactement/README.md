# preactement

Sometimes it's useful to let the DOM render our components when needed. Custom Elements are great at this. They provide various methods that can inform you when an element is "connected" or "disconnected" from the DOM.

This package (only **2KB** GZipped) provides the ability to use an HTML custom element as the root for your components. In addition, it allows the use of async code resolution if your custom element isn't immediately used, which is a great strategy for reducing code weight. The exported function can also be used for hydration from SSR in Node.

It's also a great way for you to integrate Preact into other server side frameworks that might render your HTML.

# Getting Started

Install with Yarn:

```bash
$ yarn add preactement
```

Install with NPM:

```bash
$ npm i preactement
```

# Using define()

`preactement` exports one function, `define()`. This allows us to register a custom element via a provided key, and provide the component we'd like to render within. It can also generate a custom element with props ready for hydration if run on the server.

The first argument **must be a valid custom element string**, e.g hyphenated. If you do not provide this, a prefix of `component-` will be applied to your element name.

## In the browser

In order to register and render a component, you'll need to call `define()` with your chosen component, e.g:

```tsx
import { define } from 'preactement';
import { HeroBanner } from './heroBanner';

/*[...]*/

define('hero-banner', () => HeroBanner);
```

This registers `<hero-banner>` as a custom element. When that element exists on the page, `preactement` will render our component.

If the custom element isn't present immediately, e.g it's created dynamically at some point in the future, we can provide an async function that explicitly resolves your component:

```tsx
define('hero-banner', () => Promise.resolve(HeroBanner));
```

This allows us to reduce the overall code in our bundle, and load the required component on demand when needed.

You can either resolve the component from your async function, as seen above, _or_ `preactement` will try to infer the export key based on the provided tag name. For example:

```tsx
import { define } from 'preactement';

/*[...]*/

define('hero-banner', () => import('./heroBanner'));
```

As the `heroBanner.ts` file is exporting the component as a key, e.g `export { HeroBanner };`, and this matches the tag name in snake case, e.g `hero-banner`, the component will be correctly rendered.

## On the server (SSR)

You can also use `define()` to generate a custom element container if you're rendering your page in Node. When wrapping your component, e.g:

```ts
define('hero-banner', () => HeroBanner);
```

A functional component is returned that you can include elsewhere in your app. For example:

```tsx
import { define } from 'preactement';

/*[...]*/

const Component = define('hero-banner', () => HeroBanner);

/*[...]*/

function HomePage() {
  return (
    <main>
      <Component />
    </main>
  );
}
```

## Properties

If you're not running `preactement` on the server, you have several ways of defining props for your component.

#### 1. Nested block of JSON:

```html
<hero-banner>
  <script type="application/json">
    { "titleText": "Hero Banner Title" }
  </script>
</hero-banner>
```

#### 2. A `props` attribute (this must be an encoded JSON string)

```html
<hero-banner props="{'titleText': 'Hero Banner Title'}"></hero-banner>
```

#### 3. Custom attributes

```html
<hero-banner title-text="Hero Banner Title"></hero-banner>
```

You'll need to define your custom attributes up front when using `define()`, e.g:

```ts
define('hero-banner', () => HeroBanner, { attributes: ['title-text'] });
```

These will then be merged into your components props in camelCase, so `title-text` will become `titleText`.

## HTML

You can also provide nested HTML to your components `children` property. For example:

```html
<hero-banner>
  <h2>Banner Title</h2>
</hero-banner>
```

This will correctly convert the `<h2>` into virtual DOM nodes for use in your component, e.g:

```tsx
/*[...]*/

function HeroBanner({ children }) {
  return <section>{children}</section>;
}
```

### Important

Any HTML provided to the custom element **must be valid**; As we're using the DOM's native parser which is quite lax, any html passed that is not properly sanitised or structured might result in unusual bugs. For example:

This will result in a Preact error:

```jsx
<p Hello
```

This will result in an H1 tag:

```jsx
<h1>Hello
<h1>Hello</h3>
```

### Slots

`preactement` now supports the use of `<* slot="{key}" />` elements, to assign string values or full blocks of HTML to your component props. This is useful if your server defines layout rules that are outside of the scope of your component. For example, given the custom element below:

```html
<login-form>
  <h2>Please Login</h2>
  <div slot="successMessage">
    <p>You have successfully logged in, congrats!</p>
    <a href="/account">Continue</a>
  </div>
</login-form>
```

All elements that have a `slot` attribute will be segmented into your components props, using the provided `slot="{value}"` as the key, e.g:

```tsx
function LoginForm({ successMessage }) {
  const [isLoggedIn, setLoggedIn] = useState(false);

  return (
    <Fragment>
      {isLoggedIn && successMessage}
      <form onSubmit={() => setLoggedIn(true)}>{/*[...]*/}</form>
    </Fragment>
  );
}
```

Slots values can be either primitive strings, or full HTML structures, as seen above.

## Options

`define` has a third argument, "options". For example:

```javascript
define('hero-banner', () => HeroBanner, {
  /*[options]*/
});
```

### attributes

If you require custom attributes to be passed down to your component, you'll need to specify them in this array. For example:

```javascript
define('hero-banner', () => HeroBanner, { attributes: ['banner-title'] });
```

And the custom element will look like the following:

```html
<hero-banner banner-title="Welcome"></hero-banner>
```

### formatProps

This allows you to provide a function to process or format your props prior to the component being rendered. One use case is changing property casings. If the data provided by your server uses Pascal, but your components make use of the standard camelCase, this function will allow you to consolidate them.

### wrapComponent

If you need to wrap your component prior to render with a higher order function, you can provide it here. For example, if you asynchronously resolve your component, but also make use of Redux, you'll need to provide a `wrapComponent` function to apply the Provider HOC etc. It can also be useful for themeing, or other use cases.

## Useful things

By default, all components will be provided with a `parent` prop. This is a reference to the root element that the component has been rendered within. This can be useful when working with Web Components, or you wish to apply changes to the custom element. This will **only be defined when run on the client**.

## ES5 Support

To support ES5 or older browsers, like IE11, you'll need to install the official Web Component [Custom Element polyfill](https://www.npmjs.com/package/@webcomponents/custom-elements). Once installed, you'll need to import the following at the very top of your entry files:

```javascript
import '@webcomponents/custom-elements';
import '@webcomponents/custom-elements/src/native-shim';
```

# Acknowledgement

This function takes _heavy_ inspiration from the excellent [preact-custom-element](https://github.com/preactjs/preact-custom-element). That library served as a starting point for this package, and all of the Preact guys deserve a massive dose of gratitude. I had slightly different needs, so decided to build this as part solution, part learning excersize.
