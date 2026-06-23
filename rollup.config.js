import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

import esbuild from "rollup-plugin-esbuild"
import resolve from "@rollup/plugin-node-resolve"
import dts from "rollup-plugin-dts"


function removeComment() {
  return {
    name: 'remove-sourcemap-comment',
    writeBundle(outputOptions, bundle) {
      for (const fileName in bundle) {
        if (fileName.endsWith('.js')) {
          const filePath = path.join(
            outputOptions.dir || path.dirname(outputOptions.file),
            fileName
          );

          let code = fs.readFileSync(filePath, 'utf-8');
          code = code.replace(/\/\/# sourceMappingURL=.*$/gm, '');
          fs.writeFileSync(filePath, code);
        }
      }
    },
  };
}


const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8"),
)

const short_banner = `/*! ${pkg.name} v${pkg.version} | * (c) ${new Date().getFullYear()} ${pkg.author} and contributors | ${pkg.license} License*/`;

const banner = `/*!
* ${pkg.name} v${pkg.version}
* (c) ${new Date().getFullYear()} ${pkg.author} and other contributors
*
* Released under the ${pkg.license} License
* Date: ${new Date().toISOString().split('T')[0]}
*/`;

function addBanner(text) {
  return {
    name: 'add-banner',

    writeBundle(outputOptions, bundle) {
      for (const fileName in bundle) {
        if (!fileName.endsWith('.js')) continue;

        const filePath = path.join(
          outputOptions.dir || path.dirname(outputOptions.file),
          fileName
        );

        const code = fs.readFileSync(filePath, 'utf8');

        fs.writeFileSync(
          filePath,
          `${text}\n${code}`
        );
      }
    },
  };
}

const resolveOptions = {
  browser: true,
  extensions: [".mjs", ".js", ".ts", ".json"],
}

const sharedEsbuildOptions = {
  target: "es2020",
  // legalComments: "inline",
}

const sharedOutputOptions = {
  sourcemap: true,
  exports: "named",
  generatedCode: "es2015"
}

const plugins = [
  resolve(resolveOptions),
  esbuild({...sharedEsbuildOptions, define: { __DEV__: "true" }}),
  removeComment(),
  addBanner(banner)
]

export default [
  {
    input: "src/index.ts",
    output: {
      ...sharedOutputOptions,
      file: "dist/truehuman.esm.js",
      format: "esm",
    },
    plugins,
    treeshake: { moduleSideEffects: false },
  },
  {
    input: "src/index.ts",
    output: {
      ...sharedOutputOptions,
      file: "dist/truehuman.cjs.js",
      format: "cjs",
    },
    plugins,
    treeshake: { moduleSideEffects: false },
  },
  {
    input: "src/index.ts",
    output: {
      ...sharedOutputOptions,
      file: "dist/truehuman.js",
      format: "umd",
      name: "truehuman",
    },
    plugins,
    treeshake: { moduleSideEffects: false },
  },
  {
    input: "src/index.ts",
    output: {
      ...sharedOutputOptions,
      file: "dist/truehuman.min.js",
      format: "umd",
      name: "truehuman",
      compact: true,
    },
    plugins: [
      resolve(resolveOptions),
      esbuild({ ...sharedEsbuildOptions, minify: true, define: { __DEV__: "false" } }),
      removeComment(),
      addBanner(short_banner)

    ],
    treeshake: { moduleSideEffects: false },
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
      banner: "",
    },
    plugins: [dts({ respectExternal: true })],
    treeshake: { moduleSideEffects: false },
  }
]
