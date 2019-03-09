import React from "react";
import { StaticQuery, graphql } from "gatsby";

interface SidebarItem {
    title: Array<{ value: string }>;
    path: string;
}

export function Sidebar(): JSX.Element {
    return (
        <StaticQuery
            query={graphql`
                {
                    allMarkdownRemark {
                        edges {
                            node {
                                headings(depth:h1) {
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
            `}
            render={({ allMarkdownRemark, allSitePage }) => {
                const sidebarItems: SidebarItem[] = [];
                const pathsIndex: { [absolutePath: string]: number } = {};

                allMarkdownRemark.edges.forEach(({ node }) => {
                    if (pathsIndex[node.fileAbsolutePath] == null) {
                        const item: SidebarItem = {
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
                        const item: SidebarItem = {
                            title: [],
                            path: node.path
                        };
                        pathsIndex[absolutePath] = sidebarItems.push(item) - 1;
                    } else {
                        sidebarItems[pathsIndex[absolutePath]].path = node.path;
                    }
                });

                return <aside>{JSON.stringify(sidebarItems, undefined, 4)}</aside>;
            }}
        />
    );
}
