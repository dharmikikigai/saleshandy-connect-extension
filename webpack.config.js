const webpack = require('webpack');
const path = require('path');
const fileSystem = require('fs-extra');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const env = require('./utils/env');

const ASSET_PATH = process.env.ASSET_PATH || '/';

const alias = {
  'react-dom': '@hot-loader/react-dom',
};

// load the secrets
const secretsPath = path.join(__dirname, `secrets.${env.NODE_ENV}.js`);

const fileExtensions = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'eot',
  'otf',
  'ttf',
  'woff',
  'woff2',
  'scss',
];

if (fileSystem.existsSync(secretsPath)) {
  alias.secrets = secretsPath;
}

const options = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    pageWorld: '@inboxsdk/core/pageWorld.js',
    index: path.join(__dirname, 'src', 'components', 'index.js'),
    worker_wrapper: ['./src/background-files/email-tracking/background.js'],
    app: './src/components/app.js',
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'build'),
    clean: true,
    publicPath: ASSET_PATH,
  },
  module: {
    rules: [
      {
        // look for .css or .scss files
        test: /\.(css|scss)$/,
        // in the `src` directory
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      },
      {
        // test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        test: /\.(jpg|jpeg|png|gif|eot|otf|ttf|woff|woff2)$/i,
        type: 'asset/resource',
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
      // {
      //   test: /\.html$/,
      //   loader: 'html-loader',
      //   exclude: /node_modules/,
      // },
      { test: /\.(ts|tsx)$/, loader: 'ts-loader', exclude: /node_modules/ },
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'source-map-loader',
          },
          {
            loader: 'babel-loader',
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias,
    extensions: fileExtensions
      .map((extension) => `.${extension}`)
      .concat(['.js', '.jsx', '.ts', '.tsx', '.css', '.scss']),
  },
  plugins: [
    new CleanWebpackPlugin({ verbose: false }),
    new webpack.ProgressPlugin(),
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: path.join(__dirname, 'build'),
          force: true,
          transform(content) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              }),
            );
          },
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'assets/**/**',
          to: path.join(__dirname, 'build'),
          force: true,
          context: 'src',
        },
      ],
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'background-files/**/**',
          to: path.join(__dirname, 'build'),
          force: true,
          context: 'src',
        },
      ],
    }),

    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'index.html'),
      filename: 'index.html',
      chunks: ['index'],
      cache: false,
    }),
  ],
  infrastructureLogging: {
    level: 'info',
  },
};

options.optimization = {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      extractComments: false,
    }),
  ],
};

// options.externals = {
//   react: 'React',
// };

module.exports = options;
