const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
entry: "./index.web.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".web.js", ".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "react-native$": "react-native-web"
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env","@babel/preset-react","@babel/preset-typescript"]
          }
        }
      }
    ]
  },
  devServer: {
    port: 3000,
    hot: true
  },
 plugins: [
  new HtmlWebpackPlugin({
    template: "./public/index.html"
  })
],

}
