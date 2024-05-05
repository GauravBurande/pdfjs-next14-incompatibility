/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    experimental: {
        esmExternals: true, // required for the canvas to work
    },
    webpack: function (config) {
        config.externals = config.externals.concat({ canvas: "canvas" }); // required for the canvas to work
        config.module.rules.push({
            test: /\.node/,
            use: 'raw-loader',
        });
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;
        return config;
    },
};
