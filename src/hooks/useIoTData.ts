import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type SensorReading = Tables<"sensor_readings">;
type ActuatorCommand = Tables<"actuator_commands">;
type Device = Tables<"devices">;

export function useLatestSensorData() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      // Get latest reading per device using distinct on device_id
      const { data } = await supabase
        .from("sensor_readings")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        // Keep only latest per device
        const latestByDevice = new Map<string, SensorReading>();
        for (const r of data) {
          if (!latestByDevice.has(r.device_id)) {
            latestByDevice.set(r.device_id, r);
          }
        }
        setReadings(Array.from(latestByDevice.values()));
      }
      setLoading(false);
    };
    fetchLatest();

    const channel = supabase
      .channel("sensor-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sensor_readings" }, (payload) => {
        const newReading = payload.new as SensorReading;
        setReadings((prev) => {
          const updated = prev.filter((r) => r.device_id !== newReading.device_id);
          return [...updated, newReading];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { readings, loading };
}

export function useHistoryData() {
  const [history, setHistory] = useState<SensorReading[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("sensor_readings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setHistory(data);
    };
    fetch();
  }, []);

  return history;
}

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("devices").select("*");
      if (data) setDevices(data);
    };
    fetch();

    const channel = supabase
      .channel("devices-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "devices" }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return devices;
}

export function useActuators() {
  const [actuators, setActuators] = useState<ActuatorCommand[]>([]);

  useEffect(() => {
    const fetchActuators = async () => {
      const { data } = await supabase.from("actuator_commands").select("*");
      if (data) setActuators(data);
    };
    fetchActuators();

    const channel = supabase
      .channel("actuators-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "actuator_commands" }, () => {
        fetchActuators();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleActuator = async (actuatorId: string, isOn: boolean) => {
    // Optimistic update
    setActuators((prev) =>
      prev.map((a) => a.actuator_id === actuatorId ? { ...a, is_on: isOn } : a)
    );
    const { error } = await supabase
      .from("actuator_commands")
      .update({ is_on: isOn, updated_at: new Date().toISOString() })
      .eq("actuator_id", actuatorId);
    if (error) {
      // Revert on error
      setActuators((prev) =>
        prev.map((a) => a.actuator_id === actuatorId ? { ...a, is_on: !isOn } : a)
      );
      throw error;
    }
  };

  const setMode = async (actuatorId: string, mode: string) => {
    const prevMode = mode === "auto" ? "manual" : "auto";
    // Optimistic update
    setActuators((prev) =>
      prev.map((a) => a.actuator_id === actuatorId ? { ...a, mode } : a)
    );
    const { error } = await supabase
      .from("actuator_commands")
      .update({ mode, updated_at: new Date().toISOString() })
      .eq("actuator_id", actuatorId);
    if (error) {
      setActuators((prev) =>
        prev.map((a) => a.actuator_id === actuatorId ? { ...a, mode: prevMode } : a)
      );
      throw error;
    }
  };

  return { actuators, toggleActuator, setMode };
}
