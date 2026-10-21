import dts from "@guchho/dts";
import banner from "@guchho/banner";


const sharedOutputOptions = {
  entry: "src/index.ts",
  target: "esnext",
  bundle: true,
  sourcemap: true,
  treeShaking: true,
  exports: "named"
}

export default [
  {
    build: {
      ...sharedOutputOptions,
      outfile: "dist/truehuman.esm.js",
      format: "esm",
      minify: false,
      define: { __DEV__: 'true' }
    },
    plugins: [
      banner({
        style: "long",
        packageJson: "./package.json",
      }),
      dts({
        entry: "src/index.ts",
        outfile: "dist/index.d.ts",
        respectExternal: true
      })
    ]
  },
  {
    build: {
      ...sharedOutputOptions,
      outfile: "dist/truehuman.cjs.js",
      format: "cjs",
      minify: false,
      define: { __DEV__: 'true' }
    },
    plugins: [
      banner({
        style: "long",
        packageJson: "./package.json",
      })
    ]
  },
  {
    build: {
      ...sharedOutputOptions,
      outfile: "dist/truehuman.js",
      name: "truehuman",
      format: "umd",
      minify: false,
      define: { __DEV__: 'true' }
    },
    plugins: [
      banner({
        style: "long",
        packageJson: "./package.json",
      })
    ]
  },
  {
    build: {
      ...sharedOutputOptions,
      outfile: "dist/truehuman.min.js",
      name: "truehuman",
      format: "umd",
      minify: true,
      define: { __DEV__: 'false' }
    },
    plugins: [
      banner({
        style: "short",
        packageJson: "./package.json",
      })
    ]
  }
];
