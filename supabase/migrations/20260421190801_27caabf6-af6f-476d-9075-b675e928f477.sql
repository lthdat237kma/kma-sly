ALTER TABLE public.node_thresholds
  ADD COLUMN IF NOT EXISTS temp_min real NOT NULL DEFAULT 15;

INSERT INTO public.actuator_commands (actuator_id, is_on, mode)
VALUES ('heater', false, 'manual'), ('heater2', false, 'manual')
ON CONFLICT DO NOTHING;