import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const sessions = await sql`
      SELECT * FROM mentorship_sessions
      ORDER BY session_date DESC
    `;

    return Response.json({ sessions });
  } catch (error) {
    console.error("Error fetching mentorship sessions:", error);
    return Response.json(
      { error: "Failed to fetch mentorship sessions" },
      { status: 500 },
    );
  }
}
