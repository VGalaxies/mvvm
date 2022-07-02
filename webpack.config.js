const path = require("path");

module.exports = {
  entry: "./src/main.ts",
  devtool: "inline-source-map",
  mode: "development",
  devServer: {
    static: 'dist'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
