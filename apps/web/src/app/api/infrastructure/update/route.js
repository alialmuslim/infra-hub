import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id,
      status,
      cpu_usage,
      memory_usage,
      storage_usage,
      uptime_percentage,
      notes,
    } = body;

    if (!id) {
      return Response.json({ error: "Asset ID is required" }, { status: 400 });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (cpu_usage !== undefined) {
      updates.push(`cpu_usage = $${paramCount}`);
      values.push(cpu_usage);
      paramCount++;
    }

    if (memory_usage !== undefined) {
      updates.push(`memory_usage = $${paramCount}`);
      values.push(memory_usage);
      paramCount++;
    }

    if (storage_usage !== undefined) {
      updates.push(`storage_usage = $${paramCount}`);
      values.push(storage_usage);
      paramCount++;
    }

    if (uptime_percentage !== undefined) {
      updates.push(`uptime_percentage = $${paramCount}`);
      values.push(uptime_percentage);
      paramCount++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(notes);
      paramCount++;
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(parseInt(id));
    const query = `UPDATE infrastructure_assets SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "Asset not found" }, { status: 404 });
    }

    return Response.json({ asset: result[0] });
  } catch (error) {
    console.error("Error updating infrastructure asset:", error);
    return Response.json(
      { error: "Failed to update infrastructure asset" },
      { status: 500 },
    );
  }
}
