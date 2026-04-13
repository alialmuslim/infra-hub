import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const result = await sql`
      SELECT 
        t.*,
        c.name as customer_name,
        c.tier as customer_tier,
        ia.name as asset_name,
        ia.asset_type
      FROM tickets t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN infrastructure_assets ia ON t.asset_id = ia.id
      WHERE t.id = ${parseInt(id)}
    `;

    if (result.length === 0) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    return Response.json({ ticket: result[0] });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return Response.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}
