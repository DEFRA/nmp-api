const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  mode: "production", 
  entry: "./server.js", // Entry point for your project
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"), // Output directory
  },
  target: "node", // Target environment
  externals: [nodeExternals()], // Ignore node_modules in the bundle
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "./package.json", to: "." }, // Copy package.json to dist
        { from: "./web.config", to: "." }, // Copy .env to dist
        //{ from: "./deploy.bat", to: "." }, // Copy .env to dist
        //{ from: "./.deployment", to: "." }, // Copy .env to dist
      ],
    }),
  ],
  devtool: "source-map", // Enable source maps
};
