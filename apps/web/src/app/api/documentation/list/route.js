import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = "SELECT * FROM documentation WHERE 1=1";
    const values = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      values.push(category);
      paramCount++;
    }

    query += " ORDER BY created_at DESC";

    const docs = await sql(query, values);

    return Response.json({ documents: docs });
  } catch (error) {
    console.error("Error fetching documentation:", error);
    return Response.json(
      { error: "Failed to fetch documentation" },
      { status: 500 },
    );
  }
}
