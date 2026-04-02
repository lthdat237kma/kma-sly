import { useState } from "react";
import { Copy, Check, Key, Link, Code, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ENDPOINT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/iot-data`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopy}>
      {copied ? <Check className="w-3.5 h-3.5 text-chart-2" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </Button>
  );
}

const ESP32_CODE = `#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ENDPOINT = "${ENDPOINT_URL}";
const char* API_KEY  = "<ANON_KEY>"; // Thay bằng key bên dưới

void sendData(float temp, float hum, float soil) {
  HTTPClient http;
  http.begin(ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", API_KEY);

  JsonDocument doc;
  doc["device_id"]     = "esp32-001";
  doc["temperature"]   = temp;
  doc["humidity"]      = hum;
  doc["soil_moisture"] = soil;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  if (code == 200) {
    String res = http.getString();
    // Phân tích lệnh điều khiển từ response
    JsonDocument resDoc;
    deserializeJson(resDoc, res);
    // resDoc["commands"] chứa trạng thái actuator
  }
  http.end();
}`;

export function ConnectionInfo() {
  const [expanded, setExpanded] = useState(false);

  const curlExample = `curl -X POST "${ENDPOINT_URL}" \\
  -H "Content-Type: application/json" \\
  -H "apikey: ${ANON_KEY}" \\
  -d '{
    "device_id": "esp32-001",
    "temperature": 28.5,
    "humidity": 65,
    "soil_moisture": 42
  }'`;

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            Thông tin kết nối thiết bị
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Endpoint */}
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Link className="w-3 h-3" /> API Endpoint
            </label>
            <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 border border-border">
              <code className="text-xs font-mono text-foreground break-all flex-1">{ENDPOINT_URL}</code>
              <CopyButton text={ENDPOINT_URL} />
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Key className="w-3 h-3" /> API Key (anon)
            </label>
            <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 border border-border">
              <code className="text-xs font-mono text-foreground break-all flex-1 select-all">{ANON_KEY}</code>
              <CopyButton text={ANON_KEY} />
            </div>
          </div>

          {/* Curl example */}
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Code className="w-3 h-3" /> Test bằng cURL
            </label>
            <div className="relative bg-muted/50 rounded-md px-3 py-2 border border-border">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">{curlExample}</pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={curlExample} />
              </div>
            </div>
          </div>

          {/* ESP32 code */}
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Code className="w-3 h-3" /> Code mẫu ESP32 (Arduino)
            </label>
            <div className="relative bg-muted/50 rounded-md px-3 py-2 border border-border max-h-64 overflow-y-auto">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">{ESP32_CODE}</pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={ESP32_CODE} />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
