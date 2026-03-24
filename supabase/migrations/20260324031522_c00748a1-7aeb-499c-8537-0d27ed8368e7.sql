-- Sensor readings table (data from ESP32/STM32)
CREATE TABLE public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  temperature REAL,
  humidity REAL,
  soil_moisture REAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_sensor_readings_device_time ON public.sensor_readings (device_id, created_at DESC);

-- Actuator commands table (pump, servo control)
CREATE TABLE public.actuator_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actuator_id TEXT NOT NULL UNIQUE,
  is_on BOOLEAN NOT NULL DEFAULT false,
  mode TEXT NOT NULL DEFAULT 'manual' CHECK (mode IN ('manual', 'auto')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Device status table
CREATE TABLE public.devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'warning')),
  rssi INTEGER DEFAULT -120,
  snr REAL DEFAULT 0,
  battery INTEGER DEFAULT 0,
  spreading_factor INTEGER DEFAULT 7,
  mcu TEXT DEFAULT 'ESP32' CHECK (mcu IN ('ESP32', 'STM32')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actuator_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Public read access (IoT dashboard)
CREATE POLICY "Anyone can read sensor data" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "Anyone can read actuator state" ON public.actuator_commands FOR SELECT USING (true);
CREATE POLICY "Anyone can read device status" ON public.devices FOR SELECT USING (true);

-- Public write for actuator commands (from web dashboard toggle)
CREATE POLICY "Anyone can update actuator commands" ON public.actuator_commands FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert actuator commands" ON public.actuator_commands FOR INSERT WITH CHECK (true);

-- Public insert for sensor data & devices (from ESP32 edge function)
CREATE POLICY "Allow insert sensor readings" ON public.sensor_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow upsert devices" ON public.devices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update devices" ON public.devices FOR UPDATE USING (true);

-- Insert initial actuator rows
INSERT INTO public.actuator_commands (actuator_id, is_on, mode) VALUES 
  ('pump', false, 'manual'),
  ('servo', false, 'manual');