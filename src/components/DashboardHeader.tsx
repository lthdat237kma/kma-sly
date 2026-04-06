import { Radio, Wifi, WifiOff, Clock, LogOut, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function DashboardHeader() {
  const [time, setTime] = useState(new Date());
  const [disconnecting, setDisconnecting] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDisconnect = async () => {
    const confirmed = window.confirm("Bạn có chắc muốn ngắt kết nối? Toàn bộ dữ liệu cảm biến, thiết bị và lệnh điều khiển sẽ bị xóa.");
    if (!confirmed) return;

    setDisconnecting(true);
    try {
      await supabase.from("sensor_readings").delete().neq("id", "");
      await supabase.from("actuator_commands").delete().neq("id", "");
      await supabase.from("devices").delete().neq("id", "");
      toast.success("Đã ngắt kết nối và xóa dữ liệu thiết bị");
    } catch (err) {
      toast.error("Lỗi khi ngắt kết nối");
    } finally {
      setDisconnecting(false);
    }
  };
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Radio className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            LoRa<span className="text-primary">WAN</span> Dashboard
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Hệ thống giám sát cảm biến IoT thời gian thực
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
          <Wifi className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Gateway Online</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">
            {time.toLocaleTimeString("vi-VN")}
          </span>
        </div>
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground hover:text-destructive gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-xs hidden sm:inline">Đăng xuất</span>
          </Button>
        )}
      </div>
    </header>
  );
}
