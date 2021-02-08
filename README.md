# preactify-element

Sometimes, it's useful to let the DOM render our components when needed. Custom Elements are great at this. They provide various methods that can inform you when an element is "connected" or "disconnected" from the DOM.

This package provides the ability to use an HTML custom element as the root for your components. It's intended to provide an easy way for you to integrate Preact into other server side frameworks that might render your HTML. The exported function can also be used for hydration from SSR in Node.

# Getting Started

Install with Yarn:

```bash
$ yarn add preactify-element
```

Install with NPM:

```bash
$ npm i preactify-element
```

# Use Cases

The following are a few situations where `preactify-element` might come in handy. I'm sure there are others, but these were useful to me.

TBD

# Acknowledgement

This function takes _heavy_ inspiration from the excellent [preact-custom-element](https://github.com/preactjs/preact-custom-element). That library served as a starting point for this package, and all of the Preact guys deserve a massive dose of gratitude. I had slightly different needs, so decided to build this as part solution, part learning excersize.
