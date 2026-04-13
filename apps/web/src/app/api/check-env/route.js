export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const openAIKeyPreview = process.env.OPENAI_API_KEY
    ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...${process.env.OPENAI_API_KEY.slice(-4)}`
    : "NOT SET";

  return Response.json({
    openai_configured: hasOpenAI,
    openai_key_preview: openAIKeyPreview,
    all_env_vars: Object.keys(process.env).filter(
      (key) =>
        key.includes("OPENAI") ||
        key.includes("DATABASE") ||
        key.includes("API"),
    ),
    message: hasOpenAI
      ? "✅ OpenAI API key is configured and available to the backend"
      : "❌ OpenAI API key is NOT configured. Please add OPENAI_API_KEY to environment variables.",
  });
}
