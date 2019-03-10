import React from "react";

import { Layout } from "../modules/layout";
import SEO from "../components/seo";

import { Hero, Features } from "../modules/landing-page";

function IndexPage(): JSX.Element {
    return (
        <Layout>
            <SEO title="Saga" keywords={[`gatsby`, `application`, `react`]} />
            <Hero />
            <Features />
        </Layout>
    );
}

export default IndexPage;
