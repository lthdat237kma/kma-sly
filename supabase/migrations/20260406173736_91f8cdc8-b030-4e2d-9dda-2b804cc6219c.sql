CREATE POLICY "Allow delete sensor readings" ON public.sensor_readings FOR DELETE USING (true);
CREATE POLICY "Allow delete actuator commands" ON public.actuator_commands FOR DELETE USING (true);
CREATE POLICY "Allow delete devices" ON public.devices FOR DELETE USING (true);