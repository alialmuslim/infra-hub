import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Asset ID is required" }, { status: 400 });
    }

    const assets = await sql`
      SELECT ia.*, c.name as customer_name, c.tier as customer_tier
      FROM infrastructure_assets ia
      LEFT JOIN customers c ON ia.customer_id = c.id
      WHERE ia.id = ${parseInt(id)}
    `;

    if (assets.length === 0) {
      return Response.json({ error: "Asset not found" }, { status: 404 });
    }

    return Response.json({ asset: assets[0] });
  } catch (error) {
    console.error("Error fetching infrastructure asset:", error);
    return Response.json(
      { error: "Failed to fetch infrastructure asset" },
      { status: 500 },
    );
  }
}
