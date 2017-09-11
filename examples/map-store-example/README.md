# Example of MapStore

Example of [`MapStore`](../../README.md#mapstore).

## Getting started

```sh
npm run setup

npm run start
```

Built example will be available on `http://localhost:4040`.

## Brief

This example contains a [`posts-store.ts`](./src/app/posts/posts-store.ts) that fetches posts from an `API` and stores them. Post is fetched with a change of [`post-container.tsx`](./src/app/posts/post-container.tsx) `props` in a method `calculateState` using `MapStore's` method `get`. Every post is fetched once. Whenever [`post-container.tsx`](./src/app/posts/post-container.tsx) receives an `id` of the post that was previously fetched, it returns a value from a `PostsStore`.

## Dependencies

This example uses:

- [`SimplrGulp`](https://github.com/QuatroCode/simplr-gulp) to build a project.
- [`SystemJS`](https://github.com/systemjs/systemjs) to load modules.
- [`systemjs/plugin-css`](https://github.com/systemjs/plugin-css) to load `CSS` files.
- [`whatwg-fetch`](https://github.com/github/fetch) `window.fetch` polyfill to make requests.
- [`JSONPlaceholder`](https://jsonplaceholder.typicode.com/) fake `API` as a `MapStore` data source.

These dependencies are not necessary for [`SimplrFlux`](../../README.md), it's just an example of its capabilities in action.
