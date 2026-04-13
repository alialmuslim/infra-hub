export async function POST(request) {
  try {
    const body = await request.json();
    const { question, topic, conversationHistory } = body;

    if (!question) {
      return Response.json({ error: "Question is required" }, { status: 400 });
    }

    const messages = [
      {
        role: "system",
        content: `You are a senior infrastructure engineer mentor at e-Portal. Your role is to teach and guide junior engineers on topics like:
- VMware vSphere and ESXi administration
- Storage SAN/NAS fundamentals
- Backup and disaster recovery
- Cloud infrastructure (AWS, Azure)
- Linux/Windows server management
- Networking and security
- ITIL and incident management

Teaching style:
- Patient and encouraging
- Use analogies and real-world examples
- Break complex topics into digestible parts
- Provide hands-on exercises when appropriate
- Reference official documentation and best practices
- Relate concepts to e-Portal's actual infrastructure

Current mentorship topic: ${topic || "General Infrastructure"}

Be supportive, thorough, and practical. If asked about specific e-Portal systems, provide realistic examples based on enterprise infrastructure.`,
      },
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    // Add current question
    messages.push({
      role: "user",
      content: question,
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return Response.json({ answer });
  } catch (error) {
    console.error("Error in mentor bot:", error);
    return Response.json(
      { error: "Failed to get mentor response" },
      { status: 500 },
    );
  }
}
