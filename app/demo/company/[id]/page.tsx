"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Home,
  LineChart,
  Plug,
  Send,
  Settings,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  connectors,
  dashboardCards,
  demoCompanies,
} from "../../demoData";

export default function CompanyHomePage() {
  const { id } = useParams();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "ai",
      text: "Ask me what changed this week, which channel is most profitable, or what action BRHT recommends.",
    },
  ]);

  const company =
    demoCompanies.find((item) => item.id === id) ?? demoCompanies[0];

  const nav = [
    { key: "overview", label: "Overview", icon: Home },
    { key: "executive", label: "Executive", icon: BarChart3 },
    { key: "marketing", label: "Marketing", icon: LineChart },
    { key: "operations", label: "Operations", icon: Truck },
    { key: "ai", label: "AI Insights", icon: Bot },
    { key: "connections", label: "Connections", icon: Plug },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  function askBRHT(question: string) {
    const answer =
      question === "revenue"
        ? "Revenue is up 18.6%. Amazon is contributing more growth than Shopify, but margin should be checked before scaling marketplace volume."
        : question === "profit"
          ? "The strongest profitability signal is Shopify bundles from Meta retargeting. Amazon volume is higher, but fee pressure may reduce contribution margin."
          : "Recommended action: shift 15% of Meta spend toward higher-margin Shopify bundles and review Amazon product-level profitability.";

    setChatMessages((current) => [
      ...current,
      { role: "user", text: question },
      { role: "ai", text: answer },
    ]);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div
        className={`grid min-h-screen transition-all ${
          collapsed ? "lg:grid-cols-[96px_1fr]" : "lg:grid-cols-[280px_1fr]"
        }`}
      >
        <aside className="border-r border-white/10 bg-slate-950/95 p-5">
          <div className="mb-8 flex items-center justify-between">
            {!collapsed && (
              <div>
                <p className="text-2xl font-black tracking-tight">BRHT</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-cyan-200">
                  Intelligence
                </p>
              </div>
            )}

            {collapsed && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 font-black text-slate-950">
                B
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:bg-white/10"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {!collapsed && (
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-black">{company.name}</p>
              <p className="mt-1 text-xs text-slate-400">{company.plan}</p>
            </div>
          )}

          <nav className="space-y-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                    collapsed ? "justify-center px-0" : ""
                  } ${
                    active
                      ? "bg-cyan-300 text-slate-950"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="px-6 py-8 lg:px-10">
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => router.push("/demo/companies")}
              className="text-sm font-bold text-cyan-200"
            >
              ← Back to companies
            </button>

            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-5 py-3 text-sm font-black text-emerald-200">
              {company.connected} sources live
            </span>
          </div>

          {activeSection === "overview" && (
            <>
              <Header
                eyebrow="Workspace Overview"
                title={`Welcome back, ${company.name}.`}
                subtitle="Your business systems are connected and intelligence is updating."
              />

              <KpiGrid />

              <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                <DashboardPanel
                  companyId={company.id}
                  router={router}
                  setActiveSection={setActiveSection}
                />
                <RecommendationPanel />
              </div>

              <div className="mt-8 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
                <ConnectionsPanel compact />
                <RecentInsights />
              </div>
            </>
          )}

          {activeSection === "executive" && (
            <>
              <Header
                eyebrow="Executive Intelligence"
                title="Executive Dashboard"
                subtitle="A high-level view of performance, risk, and what needs attention."
              />
              <KpiGrid />

              <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-2xl font-black">Revenue Performance</h2>
                  <span className="rounded-full bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-200">
                    Live dashboard
                  </span>
                </div>

                <FakeChart />

                <button
                  onClick={() => router.push(`/demo/company/${company.id}/dashboard`)}
                  className="mt-6 rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950"
                >
                  Open full dashboard
                </button>
              </div>
            </>
          )}

          {activeSection === "marketing" && (
            <>
              <Header
                eyebrow="Performance"
                title="Marketing Dashboard"
                subtitle="Channel spend, ROAS, CAC, and campaign performance."
              />
              <ThreeCards
                cards={[
                  ["Meta ROAS", "4.8x", "+21%"],
                  ["Google ROAS", "3.6x", "+9%"],
                  ["CAC", "$28.14", "-11%"],
                ]}
              />
              <FakeChart />
            </>
          )}

          {activeSection === "operations" && (
            <>
              <Header
                eyebrow="Operations"
                title="Operations Dashboard"
                subtitle="Fulfillment, delivery lag, shipping costs, and inventory warnings."
              />
              <ThreeCards
                cards={[
                  ["Orders", "2,841", "+14%"],
                  ["Delivery Lag", "2.4d", "-0.6d"],
                  ["Shipping Cost", "$7.82", "-6.5%"],
                ]}
              />
              <RecentInsights />
            </>
          )}

          {activeSection === "ai" && (
            <>
              <Header
                eyebrow="AI Intelligence"
                title="Ask BRHT"
                subtitle="A demo AI layer that explains what changed and recommends actions."
              />

              <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
                <RecommendationPanel />

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                  <h2 className="mb-5 text-2xl font-black">AI Chat</h2>

                  <div className="min-h-[360px] space-y-4 rounded-[1.5rem] bg-slate-950/70 p-5">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`max-w-[85%] rounded-2xl p-4 leading-7 ${
                          message.role === "user"
                            ? "ml-auto bg-cyan-300 text-slate-950"
                            : "bg-white/10 text-slate-200"
                        }`}
                      >
                        {message.text}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <button
                      onClick={() => askBRHT("revenue")}
                      className="rounded-2xl bg-white/10 p-4 text-left text-sm font-bold hover:bg-white/15"
                    >
                      Why is revenue up?
                    </button>
                    <button
                      onClick={() => askBRHT("profit")}
                      className="rounded-2xl bg-white/10 p-4 text-left text-sm font-bold hover:bg-white/15"
                    >
                      Which channel is most profitable?
                    </button>
                    <button
                      onClick={() => askBRHT("next action")}
                      className="rounded-2xl bg-white/10 p-4 text-left text-sm font-bold hover:bg-white/15"
                    >
                      What should we do next?
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === "connections" && (
            <>
              <Header
                eyebrow="Data Layer"
                title="Connected Sources"
                subtitle="Systems BRHT is reading to power dashboards, alerts, and AI."
              />
              <ConnectionsPanel />
            </>
          )}

          {activeSection === "settings" && (
            <>
              <Header
                eyebrow="Workspace Settings"
                title="Settings"
                subtitle="Demo settings for workspace, users, permissions, and alerts."
              />

              <div className="grid gap-5 md:grid-cols-2">
                {["Users & Permissions", "Alert Rules", "Billing Plan", "Data Refresh Schedule"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
                    >
                      <p className="text-xl font-black">{item}</p>
                      <p className="mt-2 text-slate-400">
                        Demo configuration area.
                      </p>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Header({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-5xl font-black tracking-tight">{title}</h1>
      <p className="mt-3 text-slate-300">{subtitle}</p>
    </div>
  );
}

function KpiGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-4">
      {[
        ["Revenue", "$482,216", "+18.6%"],
        ["True ROAS", "4.21x", "+32.1%"],
        ["Inventory Risk", "Low", "Healthy"],
        ["Delivery Lag", "2.4d", "-0.6d"],
      ].map(([label, value, note]) => (
        <div
          key={label}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
        >
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-4xl font-black">{value}</p>
          <p className="mt-2 text-sm font-bold text-cyan-200">{note}</p>
        </div>
      ))}
    </div>
  );
}

function DashboardPanel({
  companyId,
  router,
  setActiveSection,
}: {
  companyId: string;
  router: ReturnType<typeof useRouter>;
  setActiveSection: (section: string) => void;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-black">Dashboards</h2>
        <button
          onClick={() => router.push(`/demo/company/${companyId}/dashboard`)}
          className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-black text-slate-950"
        >
          Open Executive
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={() =>
                card.href === "dashboard"
                  ? setActiveSection("executive")
                  : setActiveSection(card.href)
              }
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 text-left transition hover:border-cyan-300/40"
            >
              <Icon className="mb-5 h-7 w-7 text-cyan-300" />
              <p className="text-lg font-black">{card.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {card.description}
              </p>
              <p className="mt-5 flex items-center text-sm font-black text-cyan-200">
                Open <ArrowRight className="ml-2 h-4 w-4" />
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecommendationPanel() {
  return (
    <div className="rounded-[2rem] border border-purple-300/20 bg-purple-400/10 p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-300/15 text-purple-200">
          <Sparkles />
        </div>
        <h2 className="text-2xl font-black">AI Recommendation</h2>
      </div>

      <p className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 leading-7 text-slate-300">
        Revenue is up 18.6%, but Amazon is contributing more of the growth than
        Shopify. Before scaling marketplace volume, review product-level margin
        and fee impact.
      </p>

      <p className="mt-4 rounded-2xl border border-purple-300/20 bg-slate-950/70 p-5 font-black leading-7 text-purple-100">
        Recommended action: Shift 15% of Meta spend toward higher-margin Shopify
        bundles.
      </p>
    </div>
  );
}

function ConnectionsPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-5 text-2xl font-black">Connected Sources</h2>

      <div className={`grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
        {connectors.map((source) => (
          <div
            key={source.name}
            className="flex items-center justify-between rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="font-black">{source.name}</p>
                <p className="text-sm text-slate-400">{source.type}</p>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-200">
              Connected
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentInsights() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-5 text-2xl font-black">Recent Insights</h2>

      <div className="space-y-4">
        {[
          "Meta is driving efficient Shopify revenue, but repeat purchase value is strongest from Google Search.",
          "Delivery lag improved by 0.6 days after fulfillment changes.",
          "Amazon growth is strong, but contribution margin should be reviewed before scaling.",
        ].map((insight) => (
          <div
            key={insight}
            className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
          >
            <div className="mb-2 flex items-center gap-2 font-black text-cyan-200">
              <Database className="h-4 w-4" />
              Insight detected
            </div>
            <p className="leading-7 text-slate-300">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThreeCards({ cards }: { cards: string[][] }) {
  return (
    <div className="mb-8 grid gap-5 md:grid-cols-3">
      {cards.map(([label, value, note]) => (
        <div
          key={label}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
        >
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-4xl font-black">{value}</p>
          <p className="mt-2 text-sm font-bold text-cyan-200">{note}</p>
        </div>
      ))}
    </div>
  );
}

function FakeChart() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <div className="flex h-72 items-end gap-3">
        {[38, 52, 44, 68, 61, 74, 69, 88, 81, 96, 89, 112].map(
          (height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-xl bg-gradient-to-t from-cyan-400 via-cyan-200 to-yellow-200"
              style={{ height: `${height / 1.25}%` }}
            />
          ),
        )}
      </div>
    </div>
  );
}