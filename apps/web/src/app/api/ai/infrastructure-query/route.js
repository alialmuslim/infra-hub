import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    // Fetch current infrastructure state
    const assets =
      await sql`SELECT * FROM infrastructure_assets ORDER BY created_at DESC`;
    const tickets =
      await sql`SELECT * FROM tickets WHERE status != 'Closed' ORDER BY created_at DESC LIMIT 20`;
    const slaMetrics =
      await sql`SELECT * FROM sla_metrics ORDER BY metric_date DESC LIMIT 7`;

    const contextData = {
      total_assets: assets.length,
      assets_by_type: assets.reduce((acc, a) => {
        acc[a.asset_type] = (acc[a.asset_type] || 0) + 1;
        return acc;
      }, {}),
      assets_by_status: assets.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {}),
      open_tickets: tickets.length,
      critical_tickets: tickets.filter((t) => t.severity === "Critical").length,
      latest_sla: slaMetrics[0] || {},
      high_capacity_assets: assets
        .filter((a) => parseFloat(a.capacity_utilization_percentage || 0) > 80)
        .map((a) => ({
          name: a.name,
          capacity: a.capacity_utilization_percentage,
        })),
    };

    const prompt = `You are an AI infrastructure analyst for e-Portal InfraHub. Answer the following question based on the current infrastructure state.

Current Infrastructure Summary:
- Total Assets: ${contextData.total_assets}
- Assets by Type: ${JSON.stringify(contextData.assets_by_type)}
- Assets by Status: ${JSON.stringify(contextData.assets_by_status)}
- Open Tickets: ${contextData.open_tickets} (${contextData.critical_tickets} Critical)
- Latest SLA Metrics: Uptime ${contextData.latest_sla.uptime_percentage}%, Compliance ${contextData.latest_sla.compliance_percentage}%
- High Capacity Assets (>80%): ${contextData.high_capacity_assets.length > 0 ? JSON.stringify(contextData.high_capacity_assets) : "None"}

User Question: ${query}

Provide a clear, actionable answer. Include:
1. Direct answer to the question
2. Relevant metrics or data points
3. Recommendations if applicable
4. Any warnings or concerns

Keep it professional and concise (2-3 paragraphs max).`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return Response.json({ response: aiResponse, context: contextData });
  } catch (error) {
    console.error("Error in infrastructure query:", error);
    return Response.json({ error: "Failed to process query" }, { status: 500 });
  }
}
