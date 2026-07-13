import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const args = process.argv.slice(2);
const add = args.includes("--add");
const help = args.includes("--help") || args.includes("-h");
const pkg =
  args.find((a) => !a.startsWith("-")) ??
  process.env.INIT_CWD?.replace(process.cwd() + "/", "");

if (help || !pkg || !existsSync(pkg)) {
  console.log(`
Usage: pnpm i18n <package-dir> [--add]

Scans t()/$t() calls in the package and compares them
with its locale files (src/locales/*).

  <package-dir>   path to the package, e.g. modules/diagnostics
  --add           write missing keys into locale files
                  (without this flag: report only, no changes)
  -h, --help      show this help

Examples:
  pnpm i18n modules/diagnostics          # report only
  pnpm i18n modules/diagnostics --add    # add missing keys
`);
  process.exit(help ? 0 : 1);
}
const command =
  `pnpm exec vue-i18n-extract report ` +
  `--vueFiles './src/**/*.?(vue|ts|js)' ` +
  `--languageFiles './src/locales/*.?(json|yml|yaml|js)'` +
  (add ? ` --add` : ``);

execSync(command, { cwd: pkg, stdio: "inherit" });
