const path = require("path");

module.exports = {
    siteMetadata: {
        title: "Yet Another State Management for JS Apps",
        description:
            "Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.",
        author: "@reactway"
    },
    plugins: [
        "gatsby-plugin-typescript",
        {
            resolve: `gatsby-plugin-sass`,
            options: {
                includePaths: [path.join(__dirname, "node_modules/foundation-sites/scss"), path.join(__dirname, "src")]
            }
        },
        "gatsby-plugin-react-helmet",
        {
            resolve: "gatsby-source-filesystem",
            options: {
                name: "images",
                path: path.join(__dirname, "/src/images")
            }
        },
        "gatsby-transformer-sharp",
        "gatsby-plugin-sharp",
        {
            resolve: "gatsby-plugin-manifest",
            options: {
                name: "saga",
                short_name: "saga",
                start_url: "/",
                background_color: "#663399",
                theme_color: "#663399",
                display: "minimal-ui",
                icon: "src/images/gatsby-icon.png"
            }
        },
        {
            resolve: "gatsby-source-filesystem",
            options: {
                path: path.join(__dirname, "/src/docs"),
                name: "docs"
            }
        },
        {
            resolve: "gatsby-plugin-react-svg",
            options: {
                rule: {
                    include: /assets/
                }
            }
        },
        "gatsby-transformer-remark"
    ]
};
