import {
  BarChart3,
  Bot,
  Database,
  LineChart,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

export const demoCompanies = [
  {
    id: "fable-fury",
    name: "Fable Fury Studios",
    industry: "Game Publisher",
    plan: "Plan A — Publisher Intelligence",
    connected: 6,
  },
  {
    id: "peak-supplements",
    name: "Peak Supplements",
    industry: "Ecommerce Brand",
    plan: "Plan B — Commerce Ops",
    connected: 4,
  },
  {
    id: "custom-ops",
    name: "Custom Ops Client",
    industry: "Custom Business",
    plan: "Plan C — Full Service",
    connected: 3,
  },
];

export const connectors = [
  { name: "Shopify", status: "Connected", type: "Commerce" },
  { name: "Amazon", status: "Connected", type: "Marketplace" },
  { name: "Meta Ads", status: "Connected", type: "Paid Social" },
  { name: "Google Ads", status: "Connected", type: "Paid Search" },
  { name: "ShipStation", status: "Connected", type: "Fulfillment" },
  { name: "HubSpot", status: "Connected", type: "CRM" },
];

export const dashboardCards = [
  {
    title: "Executive Dashboard",
    description: "Revenue, ROAS, inventory risk, fulfillment, and AI summary.",
    icon: BarChart3,
    href: "dashboard",
  },
  {
    title: "Marketing Dashboard",
    description: "Channel spend, CAC, ROAS, campaign performance.",
    icon: LineChart,
    href: "marketing",
  },
  {
    title: "Operations Dashboard",
    description: "Orders, delivery lag, fulfillment cost, inventory alerts.",
    icon: Truck,
    href: "operations",
  },
  {
    title: "AI Insights",
    description: "Ask BRHT what changed, what matters, and what to do next.",
    icon: Bot,
    href: "insights",
  },
];

export const kpis = [
  { label: "Revenue", value: "$482,216", note: "+18.6%" },
  { label: "True ROAS", value: "4.21x", note: "+32.1%" },
  { label: "Inventory Risk", value: "Low", note: "Healthy" },
  { label: "Delivery Lag", value: "2.4d", note: "-0.6d" },
];

export const aiInsights = [
  "Revenue increased 18.6%, with Amazon contributing more growth than Shopify.",
  "Paid efficiency improved, but Meta and Google appear to be serving different roles.",
  "Fulfillment cost is improving, but profitability should be reviewed by channel.",
];

export const aiRecommendation =
  "Shift 15% of Meta spend toward the highest-margin product group and review Amazon fee impact before scaling marketplace volume.";