export async function POST(request) {
  try {
    const body = await request.json();
    const { ticket, action } = body;

    if (!ticket || !action) {
      return Response.json(
        { error: "Ticket and action are required" },
        { status: 400 },
      );
    }

    let prompt = "";

    switch (action) {
      case "analyze":
        prompt = `You are a senior infrastructure engineer analyzing a support ticket. 

Ticket Details:
- Title: ${ticket.title}
- Description: ${ticket.description || "No description provided"}
- Severity: ${ticket.severity}
- Asset: ${ticket.asset_name || "Not specified"} (${ticket.asset_type || "Unknown type"})

Analyze this ticket and provide:
1. Most likely root cause (2-3 possibilities)
2. Immediate troubleshooting steps (5-7 steps)
3. Potential escalation path if needed
4. Estimated time to resolution

Format your response in clear sections with bullet points.`;
        break;

      case "resolution":
        prompt = `You are a senior infrastructure engineer writing resolution notes for a completed ticket.

Ticket: ${ticket.title}
Description: ${ticket.description || "No description"}
Current Notes: ${ticket.resolution_notes || "No notes yet"}

Generate professional, detailed resolution notes that include:
1. Root cause identified
2. Steps taken to resolve
3. Verification performed
4. Preventive measures recommended

Write in past tense, technical but clear language. Keep it concise (3-4 paragraphs).`;
        break;

      case "assign":
        prompt = `Based on this ticket, recommend which type of engineer should handle it:

Ticket: ${ticket.title}
Description: ${ticket.description || "No description"}
Severity: ${ticket.severity}
Asset Type: ${ticket.asset_type || "Unknown"}

Recommend:
1. Required expertise level (Junior/Mid/Senior)
2. Required specializations (e.g., Storage, Networking, VMware, Cloud)
3. Suggested engineer name if this matches a known pattern
4. Justification (1 sentence)

Keep it brief and actionable.`;
        break;

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return Response.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in AI ticket assistant:", error);
    return Response.json(
      { error: "Failed to generate AI response" },
      { status: 500 },
    );
  }
}
