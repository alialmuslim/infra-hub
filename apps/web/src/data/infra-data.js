export const systemHealth = [
  {
    id: 1,
    name: "Core Compute Cluster",
    type: "Server",
    status: "Healthy",
    uptime: "99.98%",
    region: "US-East",
  },
  {
    id: 2,
    name: "Enterprise Storage Array",
    type: "Storage",
    status: "Warning",
    uptime: "98.50%",
    region: "US-West",
  },
  {
    id: 3,
    name: "Cloud HCI Instance",
    type: "Cloud",
    status: "Healthy",
    uptime: "99.99%",
    region: "Global",
  },
  {
    id: 4,
    name: "Disaster Recovery Hub",
    type: "Backup",
    status: "Healthy",
    uptime: "100%",
    region: "EU-Central",
  },
];

export const activeTickets = [
  {
    id: "T-882",
    title: "L3 latency issues on ERP DB",
    priority: "High",
    category: "Computing",
  },
  {
    id: "T-885",
    title: "HCI node expansion required",
    priority: "Medium",
    category: "Infrastructure",
  },
  {
    id: "T-890",
    title: "Backup verification failure",
    priority: "Critical",
    category: "Security",
  },
  {
    id: "T-892",
    title: "Hypervisor patching cycle",
    priority: "Low",
    category: "Maintenance",
  },
];

export const kpis = [
  { label: "System Uptime", value: 99.8, color: "#EA580C", suffix: "%" },
  { label: "SLA Compliance", value: 94, color: "#EA580C", suffix: "%" },
  { label: "Backup Integrity", value: 100, color: "#EA580C", suffix: "%" },
  { label: "Capacity Used", value: 68, color: "#EA580C", suffix: "%" },
];

export const kpiStats = [
  { label: "Active Alerts", value: "12", trend: "+2", trendType: "neutral" },
  {
    label: "Storage Used",
    value: "412TB",
    trend: "82%",
    trendType: "positive",
  },
  {
    label: "Cloud Spend",
    value: "$12,400",
    trend: "-5%",
    trendType: "positive",
  },
  { label: "MTTR", value: "1.4h", trend: "-12m", trendType: "positive" },
];
