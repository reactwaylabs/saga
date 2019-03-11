import { useMemo } from "react";
import { useStaticQuery, graphql } from "gatsby";

export interface MenuItem {
    title: string | null;
    path: string;
}

export function useMenu(): MenuItem[] {
    const { allSitePage } = useStaticQuery(graphql`
        {
            allSitePage(filter: { path: { regex: "//docs/*.+/" } }) {
                edges {
                    node {
                        path
                        context {
                            title
                        }
                    }
                }
            }
        }
    `);

    console.log(allSitePage);
    const result: MenuItem[] = (allSitePage.edges as any[]).map<MenuItem>(({ node }) => ({ path: node.path, title: node.context.title }));
    console.log(result);
    return result;
}
