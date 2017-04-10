module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "./dist/simplr-flux.js",
        libraryTarget: "umd"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                options: {
                }
            }
        ]
    },
    resolve: {
        extensions: [".ts"]
    },
    externals: {
        "flux": "flux",
        "flux/utils": "flux/utils",
        "immutable": "immutable"
    }
};