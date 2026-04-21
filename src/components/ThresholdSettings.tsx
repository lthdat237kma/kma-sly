import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Thermometer, Leaf, CloudRain, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  nodeId: string;
  nodeLabel: string;
}

interface Thresholds {
  temp_max: number;
  soil_min: number;
  rain_max: number;
}

export function ThresholdSettings({ nodeId, nodeLabel }: Props) {
  const [values, setValues] = useState<Thresholds>({ temp_max: 35, soil_min: 30, rain_max: 50 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("node_thresholds")
      .select("temp_max, soil_min, rain_max")
      .eq("node_id", nodeId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (data) setValues({ temp_max: data.temp_max, soil_min: data.soil_min, rain_max: data.rain_max });
        setLoading(false);
      });
    return () => { active = false; };
  }, [nodeId]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("node_thresholds")
      .upsert({ node_id: nodeId, ...values, updated_at: new Date().toISOString() }, { onConflict: "node_id" });
    setSaving(false);
    if (error) {
      toast.error("Lỗi khi lưu ngưỡng");
      return;
    }
    toast.success(`Đã gửi ngưỡng mới cho ${nodeLabel}`, {
      description: `ESP nhận ở lần polling kế tiếp · T≤${values.temp_max}°C · Soil≥${values.soil_min}% · Rain≤${values.rain_max}mm`,
    });
  };

  const fields = [
    { key: "temp_max" as const, label: "Nhiệt độ tối đa", unit: "°C", icon: Thermometer, hint: "Quạt bật khi nhiệt độ vượt ngưỡng" },
    { key: "soil_min" as const, label: "Độ ẩm đất tối thiểu", unit: "%", icon: Leaf, hint: "Bơm bật khi độ ẩm thấp hơn ngưỡng" },
    { key: "rain_max" as const, label: "Lượng mưa tối đa", unit: "mm", icon: CloudRain, hint: "Mái che đóng khi mưa vượt ngưỡng" },
  ];

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {fields.map(({ key, label, unit, icon: Icon, hint }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={values[key]}
                  disabled={loading}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: parseFloat(e.target.value) || 0 }))}
                  className="pr-12 font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">{unit}</span>
              </div>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={saving || loading} size="sm" className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Đang lưu..." : "Lưu ngưỡng"}
        </Button>
      </CardContent>
    </Card>
  );
}
