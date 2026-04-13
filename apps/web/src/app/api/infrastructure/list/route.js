import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetType = searchParams.get("type");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customer_id");

    let query =
      "SELECT ia.*, c.name as customer_name FROM infrastructure_assets ia LEFT JOIN customers c ON ia.customer_id = c.id WHERE 1=1";
    const values = [];
    let paramCount = 1;

    if (assetType) {
      query += ` AND ia.asset_type = $${paramCount}`;
      values.push(assetType);
      paramCount++;
    }

    if (status) {
      query += ` AND ia.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (customerId) {
      query += ` AND ia.customer_id = $${paramCount}`;
      values.push(parseInt(customerId));
      paramCount++;
    }

    query += " ORDER BY ia.created_at DESC";

    const assets = await sql(query, values);

    return Response.json({ assets });
  } catch (error) {
    console.error("Error fetching infrastructure assets:", error);
    return Response.json(
      { error: "Failed to fetch infrastructure assets" },
      { status: 500 },
    );
  }
}
