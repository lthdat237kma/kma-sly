CREATE TABLE public.node_thresholds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id TEXT NOT NULL UNIQUE,
  temp_max REAL NOT NULL DEFAULT 35,
  soil_min REAL NOT NULL DEFAULT 30,
  rain_max REAL NOT NULL DEFAULT 50,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.node_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read thresholds" ON public.node_thresholds FOR SELECT USING (true);
CREATE POLICY "Anyone can insert thresholds" ON public.node_thresholds FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update thresholds" ON public.node_thresholds FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete thresholds" ON public.node_thresholds FOR DELETE USING (true);

INSERT INTO public.node_thresholds (node_id, temp_max, soil_min, rain_max) VALUES
  ('esp32-001-node1', 35, 30, 50),
  ('esp32-001-node2', 35, 30, 50)
ON CONFLICT (node_id) DO NOTHING;