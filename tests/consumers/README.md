# Packed consumer checks

`pnpm test:packages` creates isolated temporary installs from all six actual tarballs. Core, Vue and React fixtures check dependency declarations with `skipLibCheck: false`, including the browser integration's public exports. Vue and React builds also resolve their public CSS paths.

The Next fixture follows Next's recommended `skipLibCheck: true` for its own dependency declarations, plus `ESNext`, `DOM` and `DOM.Iterable` libraries. Its purpose is the production App Router build and client-boundary integration; Zaptime's declarations are checked strictly in the other consumers. This avoids hiding a package declaration failure behind Next's dependency defaults.

Guide code fences are extracted into the matching consumer and typechecked. The lifecycle fragment receives only declarations for the host functions and instance referenced by its prose. Installs and builds never run example booking calls.
