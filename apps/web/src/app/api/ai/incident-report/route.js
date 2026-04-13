import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId) {
      return Response.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    // Fetch ticket details
    const ticketResult = await sql`
      SELECT 
        t.*,
        c.name as customer_name,
        c.tier as customer_tier,
        ia.name as asset_name,
        ia.asset_type
      FROM tickets t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN infrastructure_assets ia ON t.asset_id = ia.id
      WHERE t.id = ${parseInt(ticketId)}
    `;

    if (ticketResult.length === 0) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket = ticketResult[0];

    const prompt = `You are a senior infrastructure engineer writing a professional incident report for management and stakeholders.

Incident Details:
- Ticket Number: ${ticket.ticket_number}
- Title: ${ticket.title}
- Severity: ${ticket.severity}
- Customer: ${ticket.customer_name || "Internal"} (${ticket.customer_tier || "N/A"} tier)
- Affected Asset: ${ticket.asset_name || "Multiple systems"} (${ticket.asset_type || "N/A"})
- Created: ${new Date(ticket.created_at).toLocaleString()}
- Resolved: ${ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleString() : "In Progress"}
- SLA Status: ${ticket.sla_breach ? "BREACHED" : "Met"}
- Description: ${ticket.description || "No description provided"}
- Resolution Notes: ${ticket.resolution_notes || "Resolution in progress"}

Generate a formal incident report with these sections:

**EXECUTIVE SUMMARY**
[2-3 sentences: what happened, impact, current status]

**INCIDENT TIMELINE**
[Chronological list of key events from creation to resolution]

**ROOT CAUSE ANALYSIS**
[Detailed explanation of what caused the incident]

**IMPACT ASSESSMENT**
[What systems/customers were affected, business impact]

**RESOLUTION STEPS**
[What was done to resolve the incident]

**PREVENTIVE MEASURES**
[Recommendations to prevent recurrence]

**LESSONS LEARNED**
[Key takeaways for the team]

Use professional, executive-friendly language. Be specific but concise. Format with markdown headers.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const report = data.choices[0].message.content;

    return Response.json({ report, ticket });
  } catch (error) {
    console.error("Error generating incident report:", error);
    return Response.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
