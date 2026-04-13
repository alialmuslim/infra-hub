import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const customers = await sql`
      SELECT * FROM customers ORDER BY name ASC
    `;

    return Response.json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return Response.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}
