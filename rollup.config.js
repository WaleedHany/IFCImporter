import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/Script.js',
  output: [
    {
      format: 'esm',
      file: 'src/bundle.js'
    },
  ],
  plugins: [
    resolve(),
  ]
};