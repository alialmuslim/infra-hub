import sql from "@/app/api/utils/sql";

export async function POST() {
  try {
    // Clear existing data (in reverse order of foreign key dependencies)
    await sql`TRUNCATE TABLE mentorship_sessions CASCADE`;
    await sql`TRUNCATE TABLE documentation CASCADE`;
    await sql`TRUNCATE TABLE sla_metrics CASCADE`;
    await sql`TRUNCATE TABLE tickets CASCADE`;
    await sql`TRUNCATE TABLE infrastructure_assets CASCADE`;
    await sql`TRUNCATE TABLE customers CASCADE`;

    // Restart sequences
    await sql`ALTER SEQUENCE customers_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE infrastructure_assets_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE tickets_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE sla_metrics_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE documentation_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE mentorship_sessions_id_seq RESTART WITH 1`;

    // ── Customers ────────────────────────────────────────────────────────────
    await sql`
      INSERT INTO customers (name, tier, sla_target_uptime, contact_email, contact_phone)
      VALUES
        ('Meridian Financial', 'Enterprise', 99.95, 'ops@meridian.com', '+1-555-0101'),
        ('NovaTech Solutions', 'Premium', 99.90, 'infra@novatech.io', '+1-555-0102'),
        ('Apex Logistics', 'Standard', 99.50, 'it@apexlogistics.com', '+1-555-0103'),
        ('Greenfield Energy', 'Premium', 99.90, 'noc@greenfield.com', '+1-555-0104'),
        ('Coastal Health', 'Enterprise', 99.95, 'admin@coastal.health', '+1-555-0105')
    `;

    // Get customer IDs for foreign keys
    const customers = await sql`SELECT id, name FROM customers ORDER BY id`;
    const custMap = Object.fromEntries(customers.map((c) => [c.name, c.id]));

    // ── Infrastructure Assets ────────────────────────────────────────────────
    await sql`
      INSERT INTO infrastructure_assets (
        customer_id, asset_type, name, model, location, status, 
        cpu_usage, memory_usage, storage_usage, uptime_percentage,
        vendor, notes
      )
      VALUES
        (${custMap["Meridian Financial"]}, 'Server', 'PROD-DB-01', 'Dell PowerEdge R750', 'DC-East', 'Operational', 32, 61, 45, 99.98, 'Dell', 'Primary database server'),
        (${custMap["Meridian Financial"]}, 'Server', 'PROD-WEB-01', 'HPE ProLiant DL380', 'DC-East', 'Operational', 58, 72, 38, 99.95, 'HPE', 'Web application server'),
        (${custMap["Meridian Financial"]}, 'Server', 'PROD-WEB-02', 'HPE ProLiant DL380', 'DC-East', 'Warning', 87, 81, 55, 99.82, 'HPE', 'Web server - high CPU usage'),
        (${custMap["Meridian Financial"]}, 'Storage', 'SAN-STORAGE-01', 'NetApp FAS8300', 'DC-East', 'Operational', 5, 12, 78, 99.99, 'NetApp', 'Primary SAN storage'),
        (${custMap["NovaTech Solutions"]}, 'HCI', 'NOVA-HCI-01', 'Nutanix NX-3060', 'DC-West', 'Operational', 41, 68, 52, 99.91, 'Nutanix', 'HCI cluster node 1'),
        (${custMap["NovaTech Solutions"]}, 'HCI', 'NOVA-HCI-02', 'Nutanix NX-3060', 'DC-West', 'Critical', 96, 93, 89, 98.45, 'Nutanix', 'HCI cluster node 2 - resource exhaustion'),
        (${custMap["NovaTech Solutions"]}, 'Backup', 'NOVA-BKP-01', 'Veeam B&R Server', 'DC-West', 'Operational', 8, 22, 63, 99.98, 'Veeam', 'Backup and replication'),
        (${custMap["Apex Logistics"]}, 'Cloud', 'APEX-VM-01', 'AWS EC2 m5.xlarge', 'Cloud-AWS', 'Operational', 44, 57, 41, 99.87, 'AWS', 'Application server'),
        (${custMap["Greenfield Energy"]}, 'Server', 'GF-ESX-01', 'Cisco UCS C240', 'DC-North', 'Warning', 78, 84, 67, 99.72, 'VMware', 'ESXi host - performance issues'),
        (${custMap["Coastal Health"]}, 'Server', 'CH-DB-01', 'Dell PowerEdge R740', 'DC-South', 'Operational', 29, 54, 43, 99.96, 'Dell', 'Healthcare database - HIPAA compliant')
    `;

    // Get infrastructure IDs for tickets
    const infrastructure =
      await sql`SELECT id, name FROM infrastructure_assets ORDER BY id`;
    const infraMap = Object.fromEntries(
      infrastructure.map((i) => [i.name, i.id]),
    );

    // ── Tickets ──────────────────────────────────────────────────────────────
    await sql`
      INSERT INTO tickets (
        ticket_number, customer_id, asset_id, title, description, 
        severity, status, assigned_engineer, sla_deadline, sla_breach
      )
      VALUES
        ('TKT-2025-001', ${custMap["Meridian Financial"]}, ${infraMap["PROD-WEB-02"]}, 
         'High CPU on PROD-WEB-02',
         'CPU utilisation has been above 85% for 3 hours. Possible memory leak in application tier. User reports slow page load times.',
         'High', 'In Progress', 'John Doe', NOW() + INTERVAL '2 hours', false),
        
        ('TKT-2025-002', ${custMap["NovaTech Solutions"]}, ${infraMap["NOVA-HCI-02"]}, 
         'NOVA-HCI-02 nearing capacity',
         'All resources (CPU 96%, RAM 93%, Disk 89%) are critical. Risk of service disruption. Cluster may fail if node goes down.',
         'Critical', 'Open', 'John Doe', NOW() + INTERVAL '30 minutes', false),
        
        ('TKT-2025-003', ${custMap["Greenfield Energy"]}, ${infraMap["GF-ESX-01"]}, 
         'ESX host performance degradation',
         'GF-ESX-01 showing elevated CPU ready times. VMs experiencing latency. May need workload rebalancing or additional resources.',
         'Medium', 'Open', 'Sarah Chen', NOW() + INTERVAL '8 hours', false),
        
        ('TKT-2025-004', ${custMap["Meridian Financial"]}, ${infraMap["SAN-STORAGE-01"]}, 
         'SAN storage at 78% capacity',
         'Storage utilisation growing at 2% per week. Predict full in 3 weeks at current rate. Need expansion planning.',
         'Medium', 'Open', NULL, NOW() + INTERVAL '48 hours', false),
        
        ('TKT-2025-005', ${custMap["Apex Logistics"]}, ${infraMap["APEX-VM-01"]}, 
         'Scheduled patching window',
         'Monthly OS patching required for APEX-VM-01. Coordinate with client for maintenance window. Security updates available.',
         'Low', 'Open', NULL, NOW() + INTERVAL '7 days', false)
    `;

    // ── SLA Metrics ──────────────────────────────────────────────────────────
    await sql`
      INSERT INTO sla_metrics (
        customer_id, metric_date, uptime_percentage, compliance_percentage,
        data_integrity_percentage, capacity_utilization_percentage,
        tickets_resolved_within_sla, total_tickets
      )
      VALUES
        (${custMap["Meridian Financial"]}, CURRENT_DATE - 1, 99.92, 98.5, 100.0, 65.2, 14, 15),
        (${custMap["Meridian Financial"]}, CURRENT_DATE - 2, 99.85, 97.8, 100.0, 63.8, 12, 13),
        (${custMap["Meridian Financial"]}, CURRENT_DATE - 7, 99.88, 98.1, 100.0, 62.1, 18, 19),
        (${custMap["NovaTech Solutions"]}, CURRENT_DATE - 1, 99.50, 88.3, 99.5, 82.4, 8, 10),
        (${custMap["NovaTech Solutions"]}, CURRENT_DATE - 2, 99.71, 92.1, 99.8, 79.6, 11, 12),
        (${custMap["Apex Logistics"]}, CURRENT_DATE - 1, 99.99, 99.2, 100.0, 45.3, 6, 6),
        (${custMap["Greenfield Energy"]}, CURRENT_DATE - 1, 99.40, 84.2, 98.9, 71.8, 6, 8),
        (${custMap["Coastal Health"]}, CURRENT_DATE - 1, 99.95, 99.1, 100.0, 52.7, 11, 11)
    `;

    // ── Documentation ────────────────────────────────────────────────────────
    await sql`
      INSERT INTO documentation (
        title, category, description, version, tags
      )
      VALUES
        ('Disaster Recovery Runbook - Meridian Financial',
         'Runbook',
         'Step-by-step disaster recovery procedure for Meridian Financial production environment. Includes failover procedures, DNS updates, and stakeholder communication.',
         '2.1',
         ARRAY['DR', 'failover', 'critical', 'meridian']),
        
        ('Monthly Patching Standard Operating Procedure',
         'SOP',
         'Approved maintenance windows and patching procedures. Includes pre-patch checklist, execution steps, and post-patch validation.',
         '1.5',
         ARRAY['patching', 'maintenance', 'security']),
        
        ('VMware vSAN Expansion Guide',
         'Deployment Guide',
         'Procedure for adding new nodes to vSAN cluster without downtime. Covers capacity planning, hardware requirements, and step-by-step expansion.',
         '3.0',
         ARRAY['vSAN', 'HCI', 'capacity', 'vmware']),
        
        ('Backup Verification Checklist',
         'Runbook',
         'Weekly backup verification procedures. Test restore procedures, offsite replication checks, and compliance logging requirements.',
         '1.2',
         ARRAY['backup', 'verification', 'compliance']),
        
        ('HIPAA Compliance - Infrastructure Controls',
         'Security Protocol',
         'HIPAA-relevant infrastructure controls for healthcare customers. Encryption standards, access logging, audit requirements.',
         '4.0',
         ARRAY['HIPAA', 'compliance', 'healthcare', 'security']),
        
        ('Incident Response Escalation Matrix',
         'Vendor Escalation',
         'Contact information and escalation procedures for all vendors. Includes severity definitions and response time SLAs.',
         '2.3',
         ARRAY['escalation', 'vendor', 'incident']),
        
        ('Network Architecture Diagram - Multi-DC',
         'Architecture Diagram',
         'High-level network architecture showing datacenter connectivity, WAN links, and cloud integration points.',
         '1.0',
         ARRAY['network', 'architecture', 'diagram'])
    `;

    // ── Mentorship Sessions ──────────────────────────────────────────────────
    await sql`
      INSERT INTO mentorship_sessions (
        mentee_name, mentor_name, session_date, topic, duration_minutes, status, notes
      )
      VALUES
        ('Alex Rivera', 'John Doe', NOW() + INTERVAL '2 days', 
         'vSAN Troubleshooting Deep Dive', 90, 'Scheduled',
         'Cover disk failure scenarios, capacity planning, and stretched cluster configuration'),
        
        ('Alex Rivera', 'John Doe', NOW() + INTERVAL '9 days',
         'HCI Performance Tuning', 60, 'Scheduled',
         'Focus on IOPS optimization and VM placement policies'),
        
        ('Maria Santos', 'Sarah Chen', NOW() - INTERVAL '3 days',
         'Incident Response Best Practices', 60, 'Completed',
         'Covered P1 runbook walkthrough, escalation paths, and post-mortem process. Very productive session.'),
        
        ('Alex Rivera', 'Sarah Chen', NOW() + INTERVAL '5 days',
         'Network Security Fundamentals', 75, 'Scheduled',
         'Firewall rule management, segmentation strategies, and monitoring tools'),
        
        ('Maria Santos', 'John Doe', NOW() - INTERVAL '10 days',
         'Storage SAN Basics', 45, 'Completed',
         'Introduction to Fibre Channel, LUN masking, and multipathing concepts')
    `;

    // Get counts for response
    const customerCount = await sql`SELECT COUNT(*) as count FROM customers`;
    const infraCount =
      await sql`SELECT COUNT(*) as count FROM infrastructure_assets`;
    const ticketCount = await sql`SELECT COUNT(*) as count FROM tickets`;
    const slaCount = await sql`SELECT COUNT(*) as count FROM sla_metrics`;
    const docCount = await sql`SELECT COUNT(*) as count FROM documentation`;
    const mentorCount =
      await sql`SELECT COUNT(*) as count FROM mentorship_sessions`;

    return Response.json({
      success: true,
      message: "🎉 Database seeded successfully with sample data!",
      counts: {
        customers: customerCount[0].count,
        infrastructure: infraCount[0].count,
        tickets: ticketCount[0].count,
        sla_metrics: slaCount[0].count,
        documentation: docCount[0].count,
        mentorship_sessions: mentorCount[0].count,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
        details: error.stack,
      },
      { status: 500 },
    );
  }
}
