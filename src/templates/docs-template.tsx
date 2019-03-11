import React from "react";
import { graphql } from "gatsby";

import { Layout } from "../modules/layout";
import { DocsLayout } from "../modules/docs";

export default function Template({
    data // this prop will be injected by the GraphQL query below.
}) {
    const { markdownRemark } = data; // data.markdownRemark holds our post data
    const { html } = markdownRemark;

    return (
        <Layout>
            <DocsLayout>
                <div className="blog-post-container">
                    <div className="blog-post">
                        <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: html }} />
                    </div>
                </div>
            </DocsLayout>
        </Layout>
    );
}

export const pageQuery = graphql`
    query($markdownAbsolutePath: String!) {
        markdownRemark(fileAbsolutePath: { eq: $markdownAbsolutePath }) {
            html
        }
    }
`;
