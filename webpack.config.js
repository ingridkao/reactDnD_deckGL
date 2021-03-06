const resolve = require('path').resolve;
const webpack = require('webpack');

module.exports = {
  //entry point
  entry: './src/index.js',
  //打包
  output: {
    path: __dirname + './',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use : [
          {
              // Adds CSS to the DOM by injecting a `<style>` tag.
              loader: "style-loader"
          },
          {
              // Interprets `@import` and `url()` like `import/require()` and will resolve them.
              loader: "css-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        MapboxAccessToken: JSON.stringify(
          process.env.MapboxAccessToken || process.env.MAPBOX_TOKEN
        )
      }
    })],
  devServer: {
    //inline: false,
    contentBase: './dist',
    hot: true
  }
};
