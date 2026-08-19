import path from "path"
import { fileURLToPath } from "url"
import type { Configuration } from "webpack"
import webpack from "webpack"
import type { Configuration as DevServerConfiguration } from "webpack-dev-server"
import HtmlWebpackPlugin from "html-webpack-plugin"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const configurationFactory = (_env: unknown, { mode = "development" }: { mode: string }): Configuration => ({
  context: __dirname,
  entry: "./index.ts",
  mode: mode as Configuration["mode"],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    extensionAlias: {
      ".js": [".ts", ".js"],
      ".mjs": [".mts", ".mjs"],
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: path.resolve(__dirname, "tsconfig.json"),
          compilerOptions: {
            sourceMap: true,
          },
        },
      },
      {
        test: /\.(jpe?g|png|svg|ico)$/i,
        loader: "file-loader",
        options: {
          outputPath: "assets",
          name: "[name].[ext]?[contenthash]",
        },
      },
    ],
  },
  devtool: mode === "development" ? "inline-source-map" : "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true,
    filename: "[name].js?[contenthash]",
  },
  devServer: {
    host: "0.0.0.0",
    allowedHosts: "all",
  } satisfies DevServerConfiguration,
  plugins: [
    new webpack.DefinePlugin({ __DEV__: JSON.stringify(mode === "development") }),
    new HtmlWebpackPlugin({
      template: "./index.html",
      title: `TrueHuman ${mode === "development" ? "Playground" : "Demo"}`,
    }),
  ],
})

export default configurationFactory