# Example of ReduceStore

Example of [`ReduceStore`](../../README.md#reducestore).

## Getting started

```sh
npm run setup

npm run start
```

Built example will be available on `http://localhost:4040`.

## Brief

This example contains [`counter-store.ts`](./src/app/counter/counter-store.ts) that stores data gathered from the user interface. Data in a store is updated according [`actions`](../../README.md#actions) from [`counter-actions.ts`](./src/app/counter/counter-actions.ts) and dispatched whenever [`action creators`](../../README.md#action-creators) from [`counter-actions-creators.ts`](./src/app/counter/counter-actions-creators.ts) are invoked.

All controls for user interactions and latest store data is rendered in [`counter-container.tsx`](./src/app/counter/counter-container.tsx).

## Dependencies

This example uses:

- [`SimplrGulp`](https://github.com/QuatroCode/simplr-gulp) to build a project.
- [`SystemJS`](https://github.com/systemjs/systemjs) to load modules.

These dependencies are not necessary for [`SimplrFlux`](../../README.md), it's just an example of its capabilities in action.
