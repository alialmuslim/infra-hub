import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      mentee_name,
      mentor_name,
      session_date,
      topic,
      duration_minutes,
      notes,
    } = body;

    if (!mentee_name || !mentor_name || !session_date || !topic) {
      return Response.json(
        { error: "Mentee, mentor, session date, and topic are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO mentorship_sessions (
        mentee_name,
        mentor_name,
        session_date,
        topic,
        duration_minutes,
        status,
        notes
      ) VALUES (
        ${mentee_name},
        ${mentor_name},
        ${session_date},
        ${topic},
        ${duration_minutes || 60},
        'Scheduled',
        ${notes || null}
      )
      RETURNING *
    `;

    return Response.json({ session: result[0] });
  } catch (error) {
    console.error("Error creating mentorship session:", error);
    return Response.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}
