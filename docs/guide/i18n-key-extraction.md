# i18n Key Extraction

Scans `t()` / `$t()` calls in a package and syncs them with its locale files
(`src/locales/*`). Powered by [vue-i18n-extract](https://github.com/Spittal/vue-i18n-extract).

## Setup

This repo already has it: `vue-i18n-extract` is a root dev dependency and
[`tools/i18n.mjs`](https://github.com/eappflow/ui-shell/blob/main/tools/i18n.mjs)
is registered as `pnpm i18n`. To use it in another workspace, install the
extractor in the workspace root:

```bash
pnpm add -D -w vue-i18n-extract
```

then copy `tools/i18n.mjs` and register it in the root `package.json`:

```jsonc
"scripts": {
  "i18n": "node tools/i18n.mjs"
}
```

## Usage

```bash
pnpm i18n <package-dir>          # report missing & unused keys (no changes)
pnpm i18n <package-dir> --add    # write missing keys into locale files

# from inside a package — the package is detected automatically:
cd modules/diagnostics
pnpm -w i18n --add
```

Packages can also delegate to the shared script in their own `package.json`:

```jsonc
"scripts": {
  "i18n:check": "node ../../tools/i18n.mjs .",
  "i18n:add": "node ../../tools/i18n.mjs . --add"
}
```

## Using vue-i18n-extract directly

The script is just a thin wrapper - you can always call the extractor
yourself from any package directory:

```bash
pnpm exec vue-i18n-extract report \
  --vueFiles './src/**/*.?(vue|ts|js)' \
  --languageFiles './src/locales/*.?(json|yml|yaml|js)' \
  --add
```

## Notes

- Without `--add` the command is read-only - safe to run anytime.
- Only the key (first argument of `t()`) is extracted; inline fallbacks
  like `t('key', 'Orders', 'Zamówienia')` must be moved to JSON manually.
- The `--vueFiles` / `--languageFiles` globs assume the ui-shell module
  convention (`src/locales/*.json`) - adjust them if your layout differs.
