import { useMemo } from "react";
import { useStaticQuery, graphql } from "gatsby";

export interface MenuItem {
    title: Array<{ value: string }>;
    path: string;
}

export function useMenu(): MenuItem[] {
    const data = useStaticQuery(graphql`
        {
            allMarkdownRemark {
                edges {
                    node {
                        headings(depth: h1) {
                            value
                            depth
                        }
                        fileAbsolutePath
                    }
                }
            }
            allSitePage(filter: { path: { regex: "//docs/*.+/" } }) {
                edges {
                    node {
                        path
                        context {
                            markdownAbsolutePath
                        }
                    }
                }
            }
        }
    `);

    const menuItems: MenuItem[] = useMemo(() => {
        const { allMarkdownRemark, allSitePage } = data;
        const sidebarItems: MenuItem[] = [];
        const pathsIndex: { [absolutePath: string]: number } = {};

        allMarkdownRemark.edges.forEach(({ node }) => {
            if (pathsIndex[node.fileAbsolutePath] == null) {
                const item: MenuItem = {
                    title: node.headings,
                    path: "#"
                };
                pathsIndex[node.fileAbsolutePath] = sidebarItems.push(item) - 1;
            } else {
                sidebarItems[pathsIndex[node.fileAbsolutePath]].title = node.headings;
            }
        });
        allSitePage.edges.forEach(({ node }) => {
            const absolutePath = node.context.markdownAbsolutePath;
            if (pathsIndex[absolutePath] == null) {
                const item: MenuItem = {
                    title: [],
                    path: node.path
                };
                pathsIndex[absolutePath] = sidebarItems.push(item) - 1;
            } else {
                sidebarItems[pathsIndex[absolutePath]].path = node.path;
            }
        });

        return sidebarItems;
    }, [data]);

    return menuItems;
}
