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

      // Validate required fields
      const { device_id, temperature, humidity, soil_moisture, device_name, device_location, mcu, rssi, snr, battery, spreading_factor } = body;

      if (!device_id) {
        return new Response(
          JSON.stringify({ error: "device_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insert sensor reading
      const { error: sensorError } = await supabase
        .from("sensor_readings")
        .insert({
          device_id,
          temperature: temperature ?? null,
          humidity: humidity ?? null,
          soil_moisture: soil_moisture ?? null,
        });

      if (sensorError) {
        throw new Error(`Failed to insert sensor reading: ${sensorError.message}`);
      }

      // Upsert device status
      const { error: deviceError } = await supabase
        .from("devices")
        .upsert(
          {
            id: device_id,
            name: device_name || device_id,
            location: device_location || null,
            status: "online",
            mcu: mcu || "ESP32",
            rssi: rssi ?? -100,
            snr: snr ?? 0,
            battery: battery ?? 100,
            spreading_factor: spreading_factor ?? 7,
            last_seen: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (deviceError) {
        throw new Error(`Failed to upsert device: ${deviceError.message}`);
      }

      // Return current actuator commands so ESP32 can act on them
      const { data: commands } = await supabase
        .from("actuator_commands")
        .select("actuator_id, is_on, mode");

      return new Response(
        JSON.stringify({
          success: true,
          commands: commands || [],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET: return latest actuator commands (for ESP32 polling)
    if (req.method === "GET") {
      const { data: commands } = await supabase
        .from("actuator_commands")
        .select("actuator_id, is_on, mode");

      return new Response(
        JSON.stringify({ commands: commands || [] }),
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
