import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      asset_id,
      title,
      description,
      severity,
      assigned_engineer,
    } = body;

    if (!title || !severity) {
      return Response.json(
        { error: "Title and severity are required" },
        { status: 400 },
      );
    }

    // Generate ticket number
    const ticketCount = await sql`SELECT COUNT(*) as count FROM tickets`;
    const ticketNumber = `INC-2024-${String(parseInt(ticketCount[0].count) + 1).padStart(3, "0")}`;

    // Calculate SLA deadline based on severity
    let slaHours = 24;
    if (severity === "Critical") slaHours = 2;
    else if (severity === "High") slaHours = 6;
    else if (severity === "Medium") slaHours = 12;

    const result = await sql`
      INSERT INTO tickets (
        ticket_number,
        customer_id,
        asset_id,
        title,
        description,
        severity,
        assigned_engineer,
        sla_deadline,
        status
      ) VALUES (
        ${ticketNumber},
        ${customer_id || null},
        ${asset_id || null},
        ${title},
        ${description || null},
        ${severity},
        ${assigned_engineer || null},
        NOW() + INTERVAL '${slaHours} hours',
        'Open'
      )
      RETURNING *
    `;

    return Response.json({ ticket: result[0] });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return Response.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
