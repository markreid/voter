module.exports = [{
  context: __dirname + '/client/src',
  entry: './voter.js',

  output: {
    filename: 'app.js',
    path: __dirname + '/client/build',
    library: 'Voter',
  },

  devtool: 'source-map',
  // optimize: {
  //   minimize: true,
  // },

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'react'],
      },
    },
    // {
    //   test: /\.scss$/,
    //   loaders: ['style', 'css', 'sass'],
    // }
    ],
  },
}];
