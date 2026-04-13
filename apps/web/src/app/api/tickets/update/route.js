import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, status, assigned_engineer, resolution_notes } = body;

    if (!id) {
      return Response.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;

      // Auto-set resolved_at when status changes to Resolved
      if (status === "Resolved") {
        updates.push(`resolved_at = NOW()`);
      }

      // Auto-set closed_at when status changes to Closed
      if (status === "Closed") {
        updates.push(`closed_at = NOW()`);
      }
    }

    if (assigned_engineer !== undefined) {
      updates.push(`assigned_engineer = $${paramCount}`);
      values.push(assigned_engineer);
      paramCount++;
    }

    if (resolution_notes !== undefined) {
      updates.push(`resolution_notes = $${paramCount}`);
      values.push(resolution_notes);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(parseInt(id));
    const query = `UPDATE tickets SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    return Response.json({ ticket: result[0] });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return Response.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
