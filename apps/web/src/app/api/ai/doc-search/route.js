import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, context } = body;

    if (!query) {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    // Fetch all documentation
    const docs =
      await sql`SELECT * FROM documentation ORDER BY created_at DESC`;

    const docsContext = docs.map((doc) => ({
      title: doc.title,
      category: doc.category,
      description: doc.description,
      tags: doc.tags,
    }));

    const prompt = `You are an AI documentation assistant for e-Portal InfraHub. Help find relevant documentation based on the user's query.

Available Documentation:
${docsContext.map((d, i) => `${i + 1}. ${d.title} (${d.category}) - ${d.description || "No description"}`).join("\n")}

User Query: ${query}
${context ? `Additional Context: ${context}` : ""}

Provide:
1. Most relevant documentation (list 2-3 documents by title)
2. Brief explanation of why each is relevant
3. Suggested search terms for finding more info
4. If no exact match exists, suggest what documentation SHOULD be created

Keep it actionable and specific.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Find most relevant docs based on simple keyword matching as backup
    const queryLower = query.toLowerCase();
    const relevantDocs = docs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(queryLower) ||
        doc.description?.toLowerCase().includes(queryLower) ||
        doc.tags?.some((tag) => tag.toLowerCase().includes(queryLower)),
    );

    return Response.json({
      response: aiResponse,
      suggestedDocs: relevantDocs.slice(0, 3),
    });
  } catch (error) {
    console.error("Error in doc search:", error);
    return Response.json(
      { error: "Failed to search documentation" },
      { status: 500 },
    );
  }
}
