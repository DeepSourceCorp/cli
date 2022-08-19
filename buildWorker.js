const webpack = require('webpack')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const baseConfig = require('./tsconfig.json')

const config = {
  entry: './worker/data.worker.ts',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'static', 'worker'),
    filename: 'data.worker.js'
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: Object.assign({}, baseConfig.compilerOptions, { noEmit: false })
        }
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader'
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '~': path.resolve(__dirname)
    },
    extensions: ['.ts', '.js']
  },
  plugins: [new CleanWebpackPlugin()]
}

const compiler = webpack(config)
compiler.run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(err, stats.compilation.errors)
    process.exit(1)
  }

  console.log(`Worker build complete in ${(stats.endTime - stats.startTime) / 1000}s`)
})
