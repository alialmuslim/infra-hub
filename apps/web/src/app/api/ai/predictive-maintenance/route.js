import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    // Fetch infrastructure assets and their metrics
    const assets = await sql`
      SELECT * FROM infrastructure_assets 
      WHERE status != 'Maintenance'
      ORDER BY uptime_percentage ASC, cpu_usage DESC, memory_usage DESC
    `;

    // Fetch recent tickets to identify patterns
    const recentTickets = await sql`
      SELECT asset_id, COUNT(*) as ticket_count, 
             MAX(severity) as highest_severity
      FROM tickets 
      WHERE created_at > NOW() - INTERVAL '30 days'
      AND asset_id IS NOT NULL
      GROUP BY asset_id
    `;

    const ticketMap = recentTickets.reduce((acc, t) => {
      acc[t.asset_id] = {
        count: parseInt(t.ticket_count),
        severity: t.highest_severity,
      };
      return acc;
    }, {});

    const assetsWithRisk = assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      type: asset.asset_type,
      status: asset.status,
      uptime: parseFloat(asset.uptime_percentage || 100),
      cpu: parseFloat(asset.cpu_usage || 0),
      memory: parseFloat(asset.memory_usage || 0),
      storage: parseFloat(asset.storage_usage || 0),
      recent_tickets: ticketMap[asset.id]?.count || 0,
      ticket_severity: ticketMap[asset.id]?.severity || "None",
      last_maintenance: asset.last_maintenance_date,
      next_maintenance: asset.next_maintenance_date,
    }));

    const prompt = `You are an AI predictive maintenance advisor for e-Portal InfraHub. Analyze the infrastructure data and predict potential failures or issues.

Infrastructure Assets Analysis:
${assetsWithRisk
  .slice(0, 15)
  .map(
    (a) =>
      `- ${a.name} (${a.type}): Uptime ${a.uptime}%, CPU ${a.cpu}%, Memory ${a.memory}%, Storage ${a.storage}%, Recent Tickets: ${a.recent_tickets}, Last Maintenance: ${a.last_maintenance || "Never"}`,
  )
  .join("\n")}

Total Assets Analyzed: ${assetsWithRisk.length}

Provide:

**HIGH RISK ASSETS** (3-5 assets)
[List assets most likely to fail soon with risk score and reasoning]

**PREDICTIVE ALERTS**
[Specific warnings based on metrics - e.g., "Storage exhaustion predicted in 2 weeks"]

**RECOMMENDED ACTIONS**
[Prioritized list of maintenance tasks to prevent failures]

**MAINTENANCE SCHEDULE**
[Suggested timeline for proactive maintenance over next 30 days]

**CAPACITY PLANNING**
[Infrastructure expansion needs based on current trends]

Be specific with asset names, metrics, and timeframes. Format with markdown.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 1800,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return Response.json({ analysis, assetsAnalyzed: assetsWithRisk.length });
  } catch (error) {
    console.error("Error in predictive maintenance:", error);
    return Response.json(
      { error: "Failed to generate analysis" },
      { status: 500 },
    );
  }
}
