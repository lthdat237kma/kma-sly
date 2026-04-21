import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (req.method === "POST") {
      const body = await req.json();

      // Two payload formats supported:
      // A) Multi-node: { device_id, node1:{temp,soil,rain,fan,pump,servo}, node2:{...} }
      // B) Legacy single-node: { device_id, temperature, soil_moisture, rain_level, ... }
      const { device_id, node1, node2, device_location, mcu, rssi, snr, battery, spreading_factor } = body;

      if (!device_id) {
        return new Response(
          JSON.stringify({ error: "device_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const nodes: { id: string; name: string; sensors: { temperature: number | null; soil_moisture: number | null; rain_level: number | null } }[] = [];

      if (node1 || node2) {
        if (node1) nodes.push({
          id: `${device_id}-node1`,
          name: "Node 1",
          sensors: { temperature: node1.temp ?? null, soil_moisture: node1.soil ?? null, rain_level: node1.rain ?? null },
        });
        if (node2) nodes.push({
          id: `${device_id}-node2`,
          name: "Node 2",
          sensors: { temperature: node2.temp ?? null, soil_moisture: node2.soil ?? null, rain_level: node2.rain ?? null },
        });
      } else {
        nodes.push({
          id: device_id,
          name: body.device_name || device_id,
          sensors: {
            temperature: body.temperature ?? null,
            soil_moisture: body.soil_moisture ?? null,
            rain_level: body.rain_level ?? null,
          },
        });
      }

      for (const n of nodes) {
        const { error: sensorError } = await supabase
          .from("sensor_readings")
          .insert({ device_id: n.id, ...n.sensors });
        if (sensorError) throw new Error(`Insert sensor failed (${n.id}): ${sensorError.message}`);

        const { error: deviceError } = await supabase
          .from("devices")
          .upsert({
            id: n.id,
            name: n.name,
            location: device_location || null,
            status: "online",
            mcu: mcu || "ESP32",
            rssi: rssi ?? -100,
            snr: snr ?? 0,
            battery: battery ?? 100,
            spreading_factor: spreading_factor ?? 7,
            last_seen: new Date().toISOString(),
          }, { onConflict: "id" });
        if (deviceError) throw new Error(`Upsert device failed (${n.id}): ${deviceError.message}`);
      }

      // Build firmware-friendly commands payload
      const { data: commands } = await supabase
        .from("actuator_commands")
        .select("actuator_id, is_on, mode");

      const get = (id: string) => commands?.find((c) => c.actuator_id === id);
      const responseCommands = {
        fan: get("fan")?.is_on ? 1 : 0,
        pump: get("pump")?.is_on ? 1 : 0,
        servo: get("servo")?.is_on ? 1 : 0,
        fan2: get("fan2")?.is_on ? 1 : 0,
        pump2: get("pump2")?.is_on ? 1 : 0,
        servo2: get("servo2")?.is_on ? 1 : 0,
      };

      const getMode = (id: string) => get(id)?.mode ?? "manual";
      const { data: thresholds } = await supabase
        .from("node_thresholds")
        .select("node_id, temp_max, soil_min, rain_max");

      const node1Id = `${device_id}-node1`;
      const node2Id = `${device_id}-node2`;
      const t1 = thresholds?.find((t) => t.node_id === node1Id);
      const t2 = thresholds?.find((t) => t.node_id === node2Id);

      const nodesResponse = {
        node1: {
          fan: { on: get("fan")?.is_on ? 1 : 0, mode: getMode("fan") },
          pump: { on: get("pump")?.is_on ? 1 : 0, mode: getMode("pump") },
          servo: { on: get("servo")?.is_on ? 1 : 0, mode: getMode("servo") },
          thresholds: { temp_max: t1?.temp_max ?? 35, soil_min: t1?.soil_min ?? 30, rain_max: t1?.rain_max ?? 50 },
        },
        node2: {
          fan: { on: get("fan2")?.is_on ? 1 : 0, mode: getMode("fan2") },
          pump: { on: get("pump2")?.is_on ? 1 : 0, mode: getMode("pump2") },
          servo: { on: get("servo2")?.is_on ? 1 : 0, mode: getMode("servo2") },
          thresholds: { temp_max: t2?.temp_max ?? 35, soil_min: t2?.soil_min ?? 30, rain_max: t2?.rain_max ?? 50 },
        },
      };

      return new Response(
        JSON.stringify({ success: true, commands: responseCommands, nodes: nodesResponse, raw: commands || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET: return latest actuator commands (for ESP32 polling)
    if (req.method === "GET") {
      const { data: commands } = await supabase
        .from("actuator_commands")
        .select("actuator_id, is_on, mode");

      const { data: thresholds } = await supabase
        .from("node_thresholds")
        .select("node_id, temp_max, soil_min, rain_max");

      return new Response(
        JSON.stringify({ commands: commands || [], thresholds: thresholds || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("IoT data error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
