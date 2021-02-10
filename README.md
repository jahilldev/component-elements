# preactement

Sometimes, it's useful to let the DOM render our components when needed. Custom Elements are great at this. They provide various methods that can inform you when an element is "connected" or "disconnected" from the DOM.

This package provides the ability to use an HTML custom element as the root for your components. It's intended to provide an easy way for you to integrate Preact into other server side frameworks that might render your HTML. The exported function can also be used for hydration from SSR in Node.

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

`preactement` exports one function, `define()`. This allows us to register a custom element via a provided key, and provide the component we'd like to render within. It can also generate a custom element with props ready for hydration if run on the server

# In the browser

In order to register and render a component, you'll need to call `define()` with your chosen component, e.g:

```tsx
import { define } from 'preactement';
import { HeroBanner } from './heroBanner';

/*[...]*/

define('hero-banner', () => HeroBanner);
```

This registers `<hero-banner>` as a custom element. When that element exists on the page, `preactement` will render our component. If the custom element isn't present immediately, e.g it's created dynamically at some point in the future, we can provide an async function:

```tsx
define('hero-banner', () => import('./heroBanner').then(({ HeroBanner }) => HeroBanner));
```

This allows us to reduce the overall code in our bundle, and load the required component on demand when needed.

You can either explicitly resolve the component from your async function, as seen above, _or_ `preactement` will try to infer the export key based on the provided tag name. For example:

```tsx
import { define } from 'preactement';

/*[...]*/

define('hero-banner', () => import('./heroBanner'));
```

As the `heroBanner.ts` file is exporting the component as a key, e.g `export { HeroBanner };`, and this matches the tag name in snake case, e.g `hero-banner`, the component will be correctly rendered.

## SSR

You can also use `define()` to generate a custom element container if you're rendering your page in Node. When wrapping your component, e.g:

```ts
define('hero-banner', HeroBanner);
```

A functional component is returned that you can include elsewhere in your app. For example:

```tsx
import { define } from 'preactement';

/*[...]*/

const Component = define('hero-banner', HeroBanner);

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

If you're not running `preactement` on the server, you have several ways of providing defining props for your component.

### 1. Nested block of JSON:

```html
<hero-banner>
  <script type="application/json">
    { "titleText": "Hero Banner Title" }
  </script>
</hero-banner>
```

### 2. A `props` attribute (this must be an encoded JSON string)

```html
<hero-banner props="{'titleText': 'Hero Banner Title'}"></hero-banner>
```

### 3. Custom attributes

```html
<hero-banner title-text="Hero Banner Title"></hero-banner>
```

You'll need to define your custom attributes up front when using `define()`, e.g:

```ts
define('hero-banner', () => HeroBanner, ['title-text']);
```

These will then be merged into your components props in camelCase, so `title-text` will become `titleText`.

# Use Cases

The following are a few situations where `preactement` might come in handy. I'm sure there are others, but these were useful to me.

## Integration with other frameworks

If you're using something other than Node to render your HTML pages, you might want an easy method of integrating Preact into your project. Preact is a great fit for controlling the more interactive elements on your site given it's small size. With `preactement` you can do the following:

Say we have a Preact component, `LoginForm`, first we'll render a custom element on our page:

```html
<login-form></login-form>
```

Now that we have a container, we need to include the Preact component in our code. In your "entry" file, or the source that produces the JS file to run on your page, we "define" a custom element using our Preact component:

```typescript
import { define } from 'preactement';
import { LoginForm } from './loginForm';

/*[...]*/

define('login-form', () => LoginForm);
```

When this runs, whenever the custom element is present in the DOM, `preactement` will render our component within.

# Acknowledgement

This function takes _heavy_ inspiration from the excellent [preact-custom-element](https://github.com/preactjs/preact-custom-element). That library served as a starting point for this package, and all of the Preact guys deserve a massive dose of gratitude. I had slightly different needs, so decided to build this as part solution, part learning excersize.
