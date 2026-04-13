import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customer_id");

    let query = `
      SELECT sm.*, c.name as customer_name, c.tier as customer_tier
      FROM sla_metrics sm
      LEFT JOIN customers c ON sm.customer_id = c.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (customerId) {
      query += ` AND sm.customer_id = $${paramCount}`;
      values.push(parseInt(customerId));
      paramCount++;
    }

    query += " ORDER BY sm.metric_date DESC";

    const metrics = await sql(query, values);

    return Response.json({ metrics });
  } catch (error) {
    console.error("Error fetching SLA metrics:", error);
    return Response.json(
      { error: "Failed to fetch SLA metrics" },
      { status: 500 },
    );
  }
}
