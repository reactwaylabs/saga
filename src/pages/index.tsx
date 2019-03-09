import React from "react";
import { Link } from "gatsby";

import { Layout } from "../modules/layout";
import Image from "../components/image";
import SEO from "../components/seo";

import { Hero } from "../modules/landing-page";

const IndexPage = () => (
    <Layout>
        <SEO title="Saga" keywords={[`gatsby`, `application`, `react`]} />
        <Hero />
        <p>Welcome to your new Gatsby site.</p>
        <p>Now go build something great.</p>
        <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
            <Image />
        </div>
        <Link to="/page-2/">Go to page 2</Link>
    </Layout>
);

export default IndexPage;
