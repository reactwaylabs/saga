# Example of DataStore

Example of [`DataStore`](../../README.md#datastore).

## Getting started

```sh
npm run setup

npm run start
```

Built example will be available on `http://localhost:4040`.

## Brief

This example contains [`ContactDataStore`](./src/app/contact-data/contact-data-store.ts) that loads and stores contacts data from two separate `JSON` files: [`address.json`](./src/app/contact-data/assets/address.json) and [`personal-data.json`](./src/app/contact-data/assets/personal-data.json).

Data is displayed in two separate containers [`address-container.tsx`](./src/app/contact-data/address/address-container.tsx) and [`personal-data-container.tsx`](./src/app/contact-data/personal-data/personal-data-container.tsx).

Final result is rendered in [`contact-data-view.tsx`](./src/app/contact-data/contact-data-view.tsx).

## Dependencies

This example uses:

- [`SimplrGulp`](https://github.com/QuatroCode/simplr-gulp) to build a project.
- [`SystemJS`](https://github.com/systemjs/systemjs) to load modules.
- [`systemjs/plugin-json`](https://github.com/systemjs/plugin-json) to load `JSON` files.
- [`path`](https://nodejs.org/api/path.html) polyfill that is supplied by [`JSPM`](http://jspm.io/) to handle paths to `JSON` files.

These dependencies are not necessary for [`SimplrFlux`](../../README.md), it's just an example of its capabilities in action.
