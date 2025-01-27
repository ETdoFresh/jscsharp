const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    index: './src/index.ts',
    astViewer: './src/ast-viewer.ts',
    settings: './src/settings.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'singletonStyleTag',
              attributes: {
                'data-hot': true
              }
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
        template: 'index.html',
        filename: 'index.html',
        chunks: ['index']
    }),
    new HtmlWebpackPlugin({
        template: 'ast-viewer.html',
        filename: 'ast-viewer.html',
        chunks: ['astViewer']
    }),
    new HtmlWebpackPlugin({
        template: 'settings.html',
        filename: 'settings.html',
        chunks: ['settings']
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    hot: true,
    watchFiles: ['index.html', 'ast-viewer.html', 'settings.html', 'src/**/*.css'],
    port: 8080
  },
  mode: 'development'
};