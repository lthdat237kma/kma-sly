ALTER TABLE public.sensor_readings DROP COLUMN IF EXISTS humidity;

INSERT INTO public.actuator_commands (actuator_id, is_on, mode)
VALUES ('fan', false, 'manual'), ('fan2', false, 'manual')
ON CONFLICT DO NOTHING;