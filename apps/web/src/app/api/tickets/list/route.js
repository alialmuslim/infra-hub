import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const customerId = searchParams.get("customer_id");

    let query = `
      SELECT t.*, 
             c.name as customer_name,
             ia.name as asset_name,
             ia.asset_type as asset_type,
             CASE 
               WHEN t.sla_deadline < NOW() AND t.status NOT IN ('Resolved', 'Closed') THEN true
               ELSE false
             END as is_overdue,
             EXTRACT(EPOCH FROM (t.sla_deadline - NOW())) / 3600 as hours_until_deadline
      FROM tickets t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN infrastructure_assets ia ON t.asset_id = ia.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` AND t.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (severity) {
      query += ` AND t.severity = $${paramCount}`;
      values.push(severity);
      paramCount++;
    }

    if (customerId) {
      query += ` AND t.customer_id = $${paramCount}`;
      values.push(parseInt(customerId));
      paramCount++;
    }

    query += " ORDER BY t.severity DESC, t.sla_deadline ASC";

    const tickets = await sql(query, values);

    // Update sla_breach flag for overdue tickets
    for (const ticket of tickets) {
      if (ticket.is_overdue && !ticket.sla_breach) {
        await sql`UPDATE tickets SET sla_breach = true WHERE id = ${ticket.id}`;
        ticket.sla_breach = true;
      }
    }

    return Response.json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return Response.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
