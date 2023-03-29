# Zaptime iframe wrapper

This repo combines Vue3 package and wraps the packege inside an Zoid.js iframe.

To be able to use only one script inside the html file, we merge the `zaptime-init.js` and `zoid.js`

```
pnpm run merge-files
```

merges the files together (order of the files matters).

Build handles all the scripts together automatically.
