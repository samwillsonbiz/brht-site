import localFont from "next/font/local";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BrainCircuit,
  Check,
  Database,
  Eye,
  Layers3,
  Workflow,
} from "lucide-react";
import { AuditButton, MobileNav } from "./MarketingControls";
import type { HomeDemoData } from "./home-data";
import s from "./HomePage.module.css";

const font = localFont({
  src: "../../public/marketing/dm-sans.woff",
  display: "swap",
});
const demoUrl = "/dashboards/fable-fury?range=max";
const sources = [
  { name: "Shopify", logo: "/logos/Shopify.svg" },
  { name: "Amazon", logo: "/logos/Amazon.svg" },
  { name: "Kickstarter" },
  { name: "BackerKit" },
  { name: "Meta Ads", logo: "/logos/Meta.svg" },
  { name: "Google Ads", logo: "/logos/Googleads.svg" },
];
const comparison = [
  [
    "Connect, model & report",
    "Business data, KPIs and custom logic",
    "Business data, KPIs and custom logic",
  ],
  [
    "Experience on your domain",
    "A custom web product, built for you",
    "Embedded reports or a BI workspace",
  ],
  [
    "Interface & workflows",
    "Designed around your operations",
    "Platform UI, with surrounding tools",
  ],
  [
    "AI & decision support",
    "Built around your operating context",
    "Microsoft ecosystem capabilities",
  ],
  [
    "Viewer licensing",
    "No BRHT per-viewer licence",
    "User licensing and/or capacity",
  ],
  [
    "Self-service report creation",
    "Custom; less turnkey",
    "A core Power BI strength",
  ],
  [
    "Enterprise governance",
    "Scoped to your engagement",
    "Mature, large-scale capabilities",
  ],
];

function Brand() {
  return (
    <a href="#top" className={s.brand} aria-label="BRHT Intelligence home">
      <AudioLines size={28} strokeWidth={1.6} aria-hidden="true" />
      <span>
        brht<span className={s.brandDot}>.</span>
      </span>
      <small>INTELLIGENCE</small>
    </a>
  );
}

function DataFlow() {
  return (
    <div
      className={s.flow}
      aria-label="Business systems connect to a shared BRHT data foundation, then to dashboards, workflows and AI"
    >
      <div className={s.flowSources}>
        <span className={s.micro}>01 / YOUR EXISTING SYSTEMS</span>
        <div className={s.sourceGrid}>
          {sources.map((source) => (
            <div key={source.name} className={s.source}>
              {source.logo ? (
                <Image src={source.logo} width={22} height={22} alt="" />
              ) : (
                <span className={s.textMark} aria-hidden="true">
                  {source.name.slice(0, 1)}
                </span>
              )}
              <span>{source.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={s.connector} aria-hidden="true">
        <span />
        <ArrowRight size={18} />
      </div>
      <div className={s.core}>
        <Database size={28} aria-hidden="true" />
        <strong>One operating model.</strong>
        <span>Connected. Reconciled. Reusable.</span>
        <div className={s.coreTags}>
          <span>Clean data</span>
          <span>Your logic</span>
        </div>
      </div>
      <div className={s.connector} aria-hidden="true">
        <span />
        <ArrowRight size={18} />
      </div>
      <div className={s.flowOutputs}>
        <span className={s.micro}>02 / YOUR OPERATING LAYER</span>
        {[
          { Icon: Eye, title: "See the business" },
          { Icon: Workflow, title: "Move work forward" },
          { Icon: BrainCircuit, title: "Think with context" },
        ].map(({ Icon, title }) => {
          return (
            <div key={title}>
              <Icon size={19} aria-hidden="true" />
              <span>{title}</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveProof({ demo }: { demo: HomeDemoData | null }) {
  const money = (value: number | null) =>
    value === null
      ? "Unavailable"
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: demo?.currency || "USD",
          maximumFractionDigits: 0,
        }).format(value);
  const number = (value: number | null) =>
    value === null
      ? "Unavailable"
      : new Intl.NumberFormat("en-US").format(value);
  const maxRevenue = Math.max(
    1,
    ...(demo?.revenueChannels.map((channel) => Math.abs(channel.revenue)) ??
      []),
  );
  return (
    <section id="proof" className={`${s.section} ${s.proof}`}>
      <div className={s.sectionHead}>
        <div>
          <span className={s.eyebrow}>02 / BUILT. CONNECTED. IN USE.</span>
          <h2>
            Real business.
            <br />
            Real operating intelligence.
          </h2>
        </div>
        <p>
          Fable Fury sells across commerce and crowdfunding. BRHT brings the
          moving parts into one live operating view.
        </p>
      </div>
      <div className={s.caseStudy}>
        <div className={s.caseHeader}>
          <div className={s.caseIdentity}>
            <span className={s.caseLogo}>
              F<span>F</span>
            </span>
            <div>
              <h3>Fable Fury</h3>
              <p>Commerce × crowdfunding × paid media</p>
            </div>
          </div>
          <span className={s.status}>
            {demo ? (
              <>
                <i />
                Connected data
              </>
            ) : (
              "Live case study"
            )}
          </span>
        </div>
        {demo ? (
          <>
            <div className={s.metrics}>
              <div>
                <span>Reconciled revenue</span>
                <strong>{money(demo.revenue)}</strong>
                <small>All time · {demo.currency}</small>
              </div>
              <div>
                <span>Orders recorded</span>
                <strong>{number(demo.orders)}</strong>
                <small>Across operational sources</small>
              </div>
              <div>
                <span>Paid media spend</span>
                <strong>{money(demo.adSpend)}</strong>
                <small>Reported separately from revenue</small>
              </div>
            </div>
            <div className={s.proofDetails}>
              <div>
                <span className={s.micro}>REVENUE BY CHANNEL</span>
                <div className={s.channelBars}>
                  {demo.revenueChannels.length ? (
                    demo.revenueChannels.map((channel) => (
                      <div key={channel.name}>
                        <div>
                          <span>{channel.name}</span>
                          <strong>{money(channel.revenue)}</strong>
                        </div>
                        <div className={s.barTrack}>
                          <span
                            style={{
                              width: `${(Math.abs(channel.revenue) / maxRevenue) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Channel breakdown unavailable.</p>
                  )}
                </div>
              </div>
              <div>
                <span className={s.micro}>INVENTORY VISIBILITY</span>
                {demo.inventoryProducts.length ? (
                  demo.inventoryProducts.map((product) => (
                    <div className={s.stock} key={product.name}>
                      <strong>{product.name}</strong>
                      <div>
                        <span>{number(product.available)} available</span>
                        <span>
                          {product.daysOfCover === null
                            ? "Cover unavailable"
                            : `${Math.round(product.daysOfCover)} days of cover`}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Inventory data temporarily unavailable.</p>
                )}
                <p className={s.health}>
                  {demo.totalSources
                    ? `${demo.healthySources} of ${demo.totalSources} source checks healthy.`
                    : "Source health unavailable."}{" "}
                  Snapshot{" "}
                  {new Date(demo.generatedAt).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "UTC",
                  })}{" "}
                  UTC.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className={s.unavailable}>
            <Database size={30} aria-hidden="true" />
            <div>
              <h4>Live data temporarily unavailable</h4>
              <p>
                The operating story is real. The latest figures will return when
                the data connection is available.
              </p>
            </div>
          </div>
        )}
        <div className={s.caseFooter}>
          <p>Reconciliation, not just visualization.</p>
          <a href={demoUrl}>
            Explore the live Fable Fury build{" "}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className={s.reconciliation}>
        <span className={s.micro}>THE LOGIC BEHIND THE NUMBERS</span>
        <p>
          Kickstarter pledges are derived from daily snapshots. BackerKit
          excludes Kickstarter-originated money. Ad attribution stays separate
          from operational revenue.{" "}
          <strong>One sale shouldn’t become three.</strong>
        </p>
      </div>
    </section>
  );
}

export default function HomePage({ demo }: { demo: HomeDemoData | null }) {
  return (
    <div id="top" className={`${s.page} ${font.className}`}>
      <a href="#main" className={s.skip}>
        Skip to content
      </a>
      <div className={s.announcement}>
        See what a connected business looks like.{" "}
        <a href={demoUrl}>
          Explore Fable Fury <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </div>
      <header className={s.header}>
        <Brand />
        <nav aria-label="Main navigation" className={s.desktopNav}>
          <a href="#system">The system</a>
          <a href="#proof">Our work</a>
          <a href="#why-brht">Why BRHT</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className={s.headerCta}>
          <AuditButton label="Let’s talk" />
        </div>
        <MobileNav />
      </header>
      <main id="main">
        <section className={s.hero}>
          <span className={s.eyebrow}>
            <span className={s.signal} /> BUSINESS INTELLIGENCE. AUTOMATION. AI.
          </span>
          <h1>
            Your business.
            <br />
            Finally <em>connected.</em>
          </h1>
          <p className={s.heroIntro}>
            Your business already has the answers.
            <br />
            They’re trapped in different systems.
          </p>
          <p className={s.heroBody}>
            BRHT connects your data, encodes your business logic, and builds a
            custom operating experience around the way you work.
          </p>
          <div className={s.actions}>
            <AuditButton />
            <a className={s.secondary} href={demoUrl}>
              Explore the live build{" "}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <div className={s.heroFlow}>
            <DataFlow />
          </div>
          <div className={s.heroFoot}>
            <span>Your systems. Your logic. Your domain.</span>
            <a href="#system">
              Meet your intelligence layer{" "}
              <ArrowDown size={14} aria-hidden="true" />
            </a>
          </div>
        </section>
        <section id="system" className={`${s.section} ${s.foundation}`}>
          <div className={s.foundationCopy}>
            <span className={s.eyebrow}>01 / BELOW THE SURFACE</span>
            <h2>
              The dashboard is
              <br />
              the visible part.
            </h2>
            <p className={s.statement}>
              The data foundation
              <br />
              is the compounding asset.
            </p>
            <p>
              We connect the tools you already use and turn fragmented data into
              a reliable operating model. Then we deliver it as a custom web
              product.
            </p>
            <p>
              Build the foundation once. Reuse it for every dashboard, workflow,
              and decision that follows.
            </p>
            <a className={s.textLink} href="#capabilities">
              See what it makes possible{" "}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
          <div className={s.layerDiagram}>
            <div className={s.diagramCaption}>
              <Layers3 size={18} aria-hidden="true" />
              <span>THE BRHT ARCHITECTURE</span>
            </div>
            {[
              [
                "04",
                "Your operating experience",
                "Dashboards · workflows · AI",
                "The part your team sees",
              ],
              [
                "03",
                "Your business logic",
                "Metrics · rules · reconciliation",
                "The way your business works",
              ],
              [
                "02",
                "One trusted data foundation",
                "Normalize · deduplicate · monitor",
                "The asset that keeps compounding",
              ],
              [
                "01",
                "Your existing systems",
                "APIs · databases · files · SaaS",
                "No platform migration required",
              ],
            ].map(([n, title, detail, label]) => (
              <div className={s.layer} key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
                <small>{label}</small>
              </div>
            ))}
            <p className={s.diagramNote}>
              One foundation. Built for what comes next.
            </p>
          </div>
        </section>
        <LiveProof demo={demo} />
        <section id="capabilities" className={`${s.section} ${s.capabilities}`}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.eyebrow}>03 / FROM INSIGHT TO ACTION</span>
              <h2>
                See more. Move faster.
                <br />
                Think further.
              </h2>
            </div>
            <p>
              Reporting is the first use case.
              <br />
              Operations is the bigger opportunity.
            </p>
          </div>
          <div className={s.pillars}>
            {[
              {
                n: "01",
                word: "SEE",
                title: "Business intelligence",
                Icon: Eye,
                body: "A clear view of revenue, channel performance, inventory and the metrics that matter. One definition of the truth.",
                outcome: "Know what’s happening",
              },
              {
                n: "02",
                word: "MOVE",
                title: "Workflow automation",
                Icon: Workflow,
                body: "Turn that visibility into alerts, reporting, handoffs and recurring checks. Let the system carry the routine work.",
                outcome: "Act on what matters",
              },
              {
                n: "03",
                word: "THINK",
                title: "AI operational intelligence",
                Icon: BrainCircuit,
                body: "Give AI the context it needs to summarize performance, explain anomalies and support better decisions.",
                outcome: "Decide with context",
              },
            ].map(({ n, word, title, Icon, body, outcome }) => (
              <article key={word} className={s.pillar}>
                <div className={s.pillarTop}>
                  <Icon size={29} strokeWidth={1.4} aria-hidden="true" />
                  <span>{n}</span>
                </div>
                <h3>
                  {word}
                  <span>.</span>
                </h3>
                <h4>{title}</h4>
                <p>{body}</p>
                <div className={s.pillarOutcome}>
                  {outcome}
                  <ArrowRight size={18} aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
          <div className={s.compoundLine}>
            <span />
            <p>One connected model beneath all three.</p>
            <span />
          </div>
        </section>
        <section id="why-brht" className={`${s.section} ${s.comparison}`}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.eyebrow}>
                04 / CHOOSE THE RIGHT FOUNDATION
              </span>
              <h2>
                Same core objective.
                <br />
                Different default.
              </h2>
            </div>
            <p>
              Power BI is a strong BI platform. BRHT starts with your business
              and builds a custom operating product around it.
            </p>
          </div>
          <div
            className={s.tableWrap}
            role="region"
            aria-label="BRHT and Power BI comparison"
            tabIndex={0}
          >
            <table>
              <caption className={s.srOnly}>
                How BRHT and Power BI approach business intelligence
              </caption>
              <thead>
                <tr>
                  <th scope="col">What matters to you</th>
                  <th scope="col">
                    <span>BRHT</span>
                    <small>A custom operating product</small>
                  </th>
                  <th scope="col">
                    Power BI<small>A mature BI platform</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(([feature, brht, powerbi]) => (
                  <tr key={feature}>
                    <th scope="row">{feature}</th>
                    <td>{brht}</td>
                    <td>{powerbi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.bestFit}>
            <p>
              <strong>Choose BRHT when</strong> you need a branded,
              client-facing experience, deep custom logic, and analytics
              connected to workflow and AI.
            </p>
            <p>
              <strong>Choose Power BI when</strong> self-service analysts, a
              Microsoft-centric stack, and mature enterprise governance are the
              priority.
            </p>
          </div>
          <p className={s.licenseNote}>
            BRHT has no per-viewer product licence. Total cost depends on scope
            and infrastructure. Power BI pricing depends on user licensing
            and/or capacity and embedded configuration.{" "}
            <a
              href="https://www.microsoft.com/en-us/microsoft-fabric/features/power-bi/pricing"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Microsoft’s pricing{" "}
              <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          </p>
        </section>
        <section id="process" className={`${s.section} ${s.process}`}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.eyebrow}>
                05 / A PARTNERSHIP, NOT A HANDOFF
              </span>
              <h2>
                Turn the lights on.
                <br />
                Then keep building.
              </h2>
            </div>
            <p>
              Start with the decisions you need to make. Build the system that
              helps you make them.
            </p>
          </div>
          <div className={s.steps}>
            {[
              [
                "01",
                "Map the business",
                "Understand the decisions, systems and bottlenecks. Find where visibility breaks down.",
              ],
              [
                "02",
                "Build the foundation",
                "Connect APIs, databases and files. Normalize the data and define the business logic.",
              ],
              [
                "03",
                "Ship the operating layer",
                "Bring dashboards, alerts, workflows and AI into a custom interface your team can use.",
              ],
              [
                "04",
                "Keep evolving",
                "Add new sources, refine the logic and expand the capabilities as your business changes.",
              ],
            ].map(([n, title, body]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="pricing" className={`${s.section} ${s.pricing}`}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.eyebrow}>06 / THE RIGHT STARTING POINT</span>
              <h2>
                Start with clarity.
                <br />
                Build from there.
              </h2>
            </div>
            <p>
              An ongoing operating partnership. A defined foundation, then room
              to grow.
            </p>
          </div>
          <div className={s.pricingRows}>
            {[
              {
                n: "01",
                name: "Intelligence Foundation",
                desc: "A reliable view of your business.",
                price: "$1,500",
                setup: "$5,000+ setup",
                items: [
                  "Up to 4 core integrations",
                  "Centralized data foundation",
                  "Custom executive dashboard",
                  "Pipeline monitoring & monthly iteration",
                ],
              },
              {
                n: "02",
                name: "Automation Layer",
                desc: "Intelligence that moves work forward.",
                price: "$2,500",
                setup: "$8,000+ setup",
                items: [
                  "Everything in Foundation",
                  "Workflow & process automation",
                  "Alerts and operational handoffs",
                  "Priority iteration",
                ],
              },
              {
                n: "03",
                name: "BrightOps AI",
                desc: "Decision support with operating context.",
                price: "$4,000+",
                setup: "$15,000+ setup",
                items: [
                  "Everything in Automation",
                  "AI summaries & anomaly detection",
                  "Forecasting support",
                  "Executive strategy reporting",
                ],
              },
            ].map((tier) => (
              <article className={s.pricingRow} key={tier.n}>
                <div className={s.tierName}>
                  <span className={s.micro}>
                    /{tier.n}
                    {tier.n === "02" ? " · RECOMMENDED PATH" : ""}
                  </span>
                  <h3>{tier.name}</h3>
                  <p>{tier.desc}</p>
                </div>
                <ul>
                  {tier.items.map((item) => (
                    <li key={item}>
                      <Check size={14} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className={s.price}>
                  <strong>
                    {tier.price}
                    <small>/mo</small>
                  </strong>
                  <span>{tier.setup}</span>
                </div>
                <a href="#contact" aria-label={`Discuss ${tier.name}`}>
                  <ArrowUpRight size={24} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
          <p className={s.pricingNote}>
            Scope, currency and implementation requirements are confirmed before
            engagement.
          </p>
        </section>
        <section id="contact" className={`${s.section} ${s.finalCta}`}>
          <span className={s.eyebrow}>
            YOUR NEXT CHAPTER STARTS WITH CLARITY
          </span>
          <h2>
            Your business is already
            <br />
            generating the data.
            <br />
            <em>Make it useful.</em>
          </h2>
          <p>Let’s find the connections that change how you operate.</p>
          <div className={s.actions}>
            <AuditButton />
            <a className={s.secondary} href={demoUrl}>
              Explore the live build{" "}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <footer className={s.footer}>
        <div>
          <Brand />
          <p>
            Business intelligence. Automation. AI.
            <br />
            Built around your business.
          </p>
        </div>
        <div>
          <a href="mailto:samwillsonbiz@gmail.com">
            Let’s build something useful{" "}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <span>© {new Date().getUTCFullYear()} BRHT Intelligence</span>
        </div>
      </footer>
    </div>
  );
}
