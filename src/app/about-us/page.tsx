import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Breadcrumb } from "antd";
import Link from "next/link";
import type { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "About Us",
    description:
      "Learn about Alaba International Market and AlabaMarketPlace.ng - our mission, vision, and commitment to digital transformation.",
  };
};

function AboutUs() {
  return (
    <div className="page-Box">
      <Container>
        <Breadcrumb
          items={[{ title: <Link href="/">Home</Link> }, { title: "About Us" }]}
        />
        <h1 className="page-text1">About Us</h1>
        <Row>
          <Col sm={8}>
            <p className="page-text2">
              Discover the story, significance, and future of Alaba
              International Market and AlabaMarketPlace.ng
            </p>

            <h4 className="page-text2">
              Historical Background of Alaba International Market
            </h4>
            <ul>
              <li>
                Alaba International Market, located in Ojo, Lagos, began to take
                shape in the late 1970s and early 1980s during Nigeria's
                expanding import economy. Initially a cluster of traders dealing
                in electrical components and cassette media, the market grew
                rapidly due to demand for affordable electronics and the rise of
                Nigerian home-video production.
              </li>
              <li>
                According to older accounts, the market was formally constituted
                by a small group of about 13 young men (then between 30–40 years
                old), who saw potential in establishing a trading ground for
                electronics in what was then a sparsely populated area of Ojo.
              </li>
              <li>
                As Ojo developed around the market, Alaba transformed from a
                simple open-air market into a sprawling electronics hub with
                streets of shops, sub-shops and specialized sections.
              </li>
              <li>
                By 2019, the market celebrated its 40-year anniversary,
                underscoring decades of growth from humble beginnings to a major
                commercial institution.
              </li>
              <li>
                Today, Alaba International Market is widely recognized as the
                largest electronics market in Nigeria, and among the biggest
                such markets in West Africa.
              </li>
            </ul>
            <p className="page-text3">
              Alaba's rise reflects entrepreneurial ambition, opportunity in
              consumer electronics demand, and organic growth over decades from
              a few traders, to a densely populated, specialized, and regionally
              significant marketplace.
            </p>

            <h4 className="page-text2">
              Economic Importance in Nigeria and West Africa
            </h4>
            <ul>
              <li>
                <strong>Electronics and home-appliance hub:</strong> The market
                deals in a very wide range of electronics—TVs, fridges,
                computers, broadcast equipment, video gadgets, generators,
                security equipment, household appliances, and more.
              </li>
              <li>
                <strong>Employment and livelihoods:</strong> With "over 5,000
                shops" (excluding stalls and sub-shops) reported by some media,
                plus support services (artisans, repairers, loaders,
                transporters, hawkers, logistics), Alaba sustains a large
                workforce—from shop-owners through technicians to informal
                service providers.
              </li>
              <li>
                <strong>Regional commerce:</strong> Alaba draws customers not
                only from various parts of Nigeria, but also from neighboring
                countries—making it a regional distribution and trading centre.
              </li>
              <li>
                <strong>Affordability and wide product range:</strong> Because
                of volume, supply chains (including import of goods), many
                items—new, second-hand or reconditioned—are available at
                relatively low prices, enabling wide access for lower- and
                middle-income buyers.
              </li>
              <li>
                <strong>Entrepreneurial launchpad:</strong> For many traders and
                entrepreneurs, Alaba serves as a starting point—the place where
                small-scale businesses begin, where technicians become
                established, and where informal retail evolves into structured
                commerce.
              </li>
            </ul>
            <p className="page-text3">
              Overall, Alaba International Market contributes significantly to
              commerce, trade, livelihoods, and cross-border distribution in the
              electronics and home-appliance sector—not just for Lagos, but for
              Nigeria and parts of West Africa.
            </p>

            <h4 className="page-text2">
              Recent Pressures and the Need for Digital Transformation
            </h4>
            <ul>
              <li>
                <strong>Infrastructural and regulatory vulnerabilities:</strong>{" "}
                As of June 2023, several "distressed" buildings within the
                market were demolished by the authorities, citing structural
                defects and safety concerns.
              </li>
              <li>
                <strong>Environmental and sanitation enforcement:</strong> In
                October 2023, the market was sealed by the Lagos State
                Government due to "poor waste disposal practices, failure to pay
                waste bills, and gross environmental sanitation offences."
              </li>
              <li>
                <strong>Public health, safety, and regulatory risk:</strong>{" "}
                Such closures expose traders and buyers to risk of disruption;
                frequent disruptions make physical-only business fragile.
                Eventually, after interventions and compliance, the market was
                reopened.
              </li>
              <li>
                <strong>Scale and complexity of supply/service chains:</strong>{" "}
                With thousands of shops, variable product quality (new,
                reconditioned, used), large flows of goods—maintaining quality
                standards, verifying authenticity, establishing trust, and
                efficient logistics become increasingly difficult in an informal
                or semi-formal marketplace.
              </li>
              <li>
                <strong>
                  Changing consumer behavior and competitive landscape:
                </strong>{" "}
                As e-commerce expands in Nigeria and globally, many buyers
                expect convenience, delivery, quality assurance and transparent
                pricing—offering pressure (and opportunity) for traditional
                markets to evolve digitally.
              </li>
            </ul>
            <p className="page-text3">
              Given these pressures—structural, regulatory, environmental, and
              competitive—there was a strong and growing need for a more
              formalized, digital layer for Alaba: one that can help mitigate
              risks, expand reach, improve trust and adopt modern market
              practices.
            </p>

            <h4 className="page-text2">
              AlabaMarketPlace.ng — Purpose, Objectives and Features
            </h4>
            <h5 className="page-text2">Purpose and Objectives</h5>
            <ul>
              <li>
                Bring Alaba vendors online so they can reach customers beyond
                the physical market.
              </li>
              <li>
                Provide vendor support services (seller onboarding, seller
                support).
              </li>
              <li>
                Reduce transaction friction through standardized listings,
                verification and logistics integrations.
              </li>
              <li>
                Strengthen market leadership's capacity to govern, certify and
                represent traders in digital commerce.
              </li>
            </ul>
            <h5 className="page-text2">Key Features</h5>
            <ul>
              <li>
                Seller onboarding dashboard with claims of a commission and
                seller support resources. This commission is used to promotion
                and manage the platform.
              </li>
              <li>
                User accounts and product listings for electronics, accessories,
                home goods and related categories.
              </li>
              <li>
                Verification and inspection offers (the platform advertises
                inspection agents and seller support).
              </li>
              <li>
                Logistics and delivery integration (order tracking and shipping
                policies described on site).
              </li>
              <li>
                Customer support and dispute channels via a seller support page.
              </li>
              <li>
                Marketing and reach through brand presence and social media
                engagement tied to Alaba identity.
              </li>
            </ul>

            <h4 className="page-text2">Role of the Amalgamated Leadership</h4>
            <p>
              The Alaba amalgamated leadership (AIATA and the Amalgamated
              Council of Sections) provides institutional legitimacy,
              coordinates trader participation, and can mediate between platform
              operations and physical market governance. Since Alaba's
              leadership has historically organised sections and represented
              traders to government, its sponsorship or endorsement of a
              platform helps drive mass onboarding and signals collective intent
              to formalise certain market functions. News and association
              reports show the leadership's involvement in administrative
              matters and outreach.
            </p>

            <h4 className="page-text2">How the Platform Serves Traders</h4>
            <ul>
              <li>
                <strong>Verification:</strong> By registering sellers and
                offering inspection support, the platform can provide
                buyer-facing credentials that increase trust and reduce fraud
                risk. The site advertises seller support and inspection-backed
                listings.
              </li>
              <li>
                <strong>Logistics:</strong> Integration with delivery and
                order-tracking functions enables same-day or timed deliveries,
                widening customer reach from local foot traffic to national and
                regional buyers. Platform pages describe shipping and tracking
                features.
              </li>
              <li>
                <strong>Market expansion:</strong> Digital storefronts enable
                small stalls to reach customers in other states and countries
                without the capital cost of physical expansion.
              </li>
              <li>
                <strong>Trust building:</strong> Standardized product
                descriptions, buyer reviews, and a marketplace dispute process
                can mitigate longstanding issues of counterfeit goods and
                inconsistent warranties.
              </li>
              <li>
                <strong>Price transparency:</strong> Public listings and search
                improve price discovery across thousands of sellers, helping
                reduce information asymmetry that previously allowed opaque
                price spreads.
              </li>
            </ul>

            <h4 className="page-text2">Potential Future Impact</h4>
            <ul>
              <li>
                <strong>Formalisation of informal economy:</strong> Many Alaba
                traders may transition to more formal business models—with
                record-keeping, digital payment trails, and better
                accountability—improving access to credit, financial services,
                and government support.
              </li>
              <li>
                <strong>Market expansion beyond Lagos:</strong> The platform
                could make Alaba a national (or even regional) brand supplying
                electronics, home-appliances, and consumer goods to cities
                across Nigeria, reducing supply-chain friction and flattening
                price disparities.
              </li>
              <li>
                <strong>
                  Increased competition, better quality, and price transparency:
                </strong>{" "}
                As more sellers compete online, buyers may benefit from better
                prices, clearer product information, and ease of
                comparison—pushing the market toward efficiency.
              </li>
              <li>
                <strong>Resilience to physical disruptions:</strong> Given past
                issues (structural demolition, environmental shutdowns, fires),
                having an online channel could insulate traders against some
                physical-market disruptions.
              </li>
              <li>
                <strong>Model for similar markets:</strong> If successful,
                AlabaMarketplace.ng may inspire other large traditional markets
                in Nigeria or West Africa to digitize, blending informal trade
                culture with formal e-commerce infrastructure.
              </li>
            </ul>

            <h4 className="page-text2">Conclusion</h4>
            <p>
              The story of Alaba International Market is one of entrepreneurial
              grit, organic growth, and vibrant commerce—from 13 young men
              selling speakers decades ago, to a sprawling hub of electronics
              and appliance trade in Lagos that now commands national and
              regional significance. But the market's success has come with
              vulnerabilities: informal structure, infrastructural weaknesses,
              regulatory and environmental pressures, and risks of fire or
              demolition. In that context, the advent of AlabaMarketplace.ng
              represents a potentially transformative step: a digitization of
              commerce that preserves the market's identity and community, while
              offering modern e-commerce infrastructure. If well managed, it
              could strengthen traders' livelihoods, expand reach, improve trust
              and transparency, and insulate participants against physical
              disruptions.
            </p>
          </Col>
          <Col sm={1}></Col>
          <Col sm={3}>
            <div className="page-stickeyBox">
              <div className="Footer-text2">
                <Link href="privacy-policy">Privacy and Policy</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="cookies-policy">Cookies Policy</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="terms_of_service">Terms of Service</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="cancellation_return">Refund Policy</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="access_statement">Accessibility Statement</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="fa-questions">FAQs</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="contact_us">Contact</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AboutUs;
