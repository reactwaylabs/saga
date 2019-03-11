const path = require("upath");

const INDEX = "index";

exports.createPages = ({ actions, graphql }) => {
    const { createPage } = actions;

    const blogPostTemplate = path.resolve("src/templates/docs-template.tsx");

    return graphql(`
        {
            allMarkdownRemark(sort: { order: DESC, fields: [] }, limit: 1000) {
                edges {
                    node {
                        fileAbsolutePath
                        html
                        headings(depth: h1) {
                            value
                        }
                    }
                }
            }
        }
    `).then(result => {
        if (result.errors) {
            return Promise.reject(result.errors);
        }

        result.data.allMarkdownRemark.edges.forEach(({ node }) => {
            const relativePath = path.relative(path.join(__dirname, "src"), node.fileAbsolutePath);
            const extname = path.extname(relativePath);
            let nodePath = relativePath.substr(0, relativePath.length - extname.length);
            if (nodePath.endsWith(INDEX)) {
                nodePath = nodePath.substr(0, nodePath.length - INDEX.length);
            }

            createPage({
                path: nodePath,
                component: blogPostTemplate,
                context: {
                    markdownAbsolutePath: node.fileAbsolutePath,
                    title: node.headings[0] != null ? node.headings[0].value : null
                }
            });
        });
    });
};
