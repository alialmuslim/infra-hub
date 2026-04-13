import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      asset_type,
      name,
      model,
      location,
      vendor,
      support_contract_expires,
      notes,
    } = body;

    if (!asset_type || !name) {
      return Response.json(
        { error: "Asset type and name are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO infrastructure_assets (
        customer_id,
        asset_type,
        name,
        model,
        location,
        status,
        cpu_usage,
        memory_usage,
        storage_usage,
        uptime_percentage,
        vendor,
        support_contract_expires,
        notes
      ) VALUES (
        ${customer_id || null},
        ${asset_type},
        ${name},
        ${model || null},
        ${location || null},
        'Operational',
        0.00,
        0.00,
        0.00,
        100.00,
        ${vendor || null},
        ${support_contract_expires || null},
        ${notes || null}
      )
      RETURNING *
    `;

    return Response.json({ asset: result[0] });
  } catch (error) {
    console.error("Error creating infrastructure asset:", error);
    return Response.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
