const postcss = require('rollup-plugin-postcss');
const replace = require('@rollup/plugin-replace');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
  rollup(config, options) {
    config.plugins = config.plugins.map((plugin) => {
      if (plugin && plugin.name === 'replace') {
        return replace({
          preventAssignment: true,
        });
      }
      return plugin;
    });
    config.plugins.push(
      postcss({
        plugins: [
          autoprefixer(),
          cssnano({
            preset: 'default',
          }),
        ],
        inject: true,
        extract: !!options.writeMeta,
        less: true,
      })
    );
    return config;
  },
};
