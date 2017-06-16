# Example of ReduceStore

<!--- TODO: add link to ReduceStore documentation --->
Example of `ReduceStore`.

## Getting started

```sh
npm run setup

npm run start
```

Built example will be available on `http://localhost:4040`.

## Brief

<!--- TODO: add link to actions an actions creators documentation --->
This example contains [`counter-store.ts`](./src/app/counter/counter-store.ts) that stores data gathered from the user interface. Data in a store is updated according `actions` from [`counter-actions.ts`](./src/app/counter/counter-actions.ts) and dispatched whenever `action creators` from [`counter-actions-creators.ts`](./src/app/counter/counter-actions-creators.ts) are invoked.

All controls for user interactions and latest store data is rendered in [`counter-container.tsx`](./src/app/counter/counter-container.tsx).

## Dependencies

This example uses:

- [`SimplrGulp`](https://github.com/QuatroCode/simplr-gulp) to build a project.
- [`SystemJS`](https://github.com/systemjs/systemjs) to load modules.

<!--- TODO: add link to SimplrFlux README --->
These dependencies are not necessary for `SimplrFlux`, it's just an example of it's capabilities in action.
