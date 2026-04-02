import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type FAQItem = {
  keywords: string[];
  question: string;
  answer: string;
};

const FAQ_DATA: FAQItem[] = [
  {
    keywords: ["kết nối", "connect", "esp32", "esp", "thiết bị"],
    question: "Làm sao để kết nối ESP32 với hệ thống?",
    answer: "Bạn cần sao chép API Endpoint và API Key từ phần 'Thông tin kết nối' trên dashboard, sau đó cấu hình vào code ESP32 của bạn. ESP32 sẽ gửi dữ liệu qua HTTP POST đến endpoint này.",
  },
  {
    keywords: ["cảm biến", "sensor", "nhiệt độ", "độ ẩm", "đất", "soil"],
    question: "Hệ thống hỗ trợ những cảm biến nào?",
    answer: "Hệ thống hỗ trợ 3 loại cảm biến: Nhiệt độ (DHT11), Độ ẩm không khí (DHT11), và Độ ẩm đất. Dữ liệu được gửi dưới dạng JSON với các trường temperature, humidity, soil_moisture.",
  },
  {
    keywords: ["bơm", "pump", "servo", "điều khiển", "actuator", "motor"],
    question: "Làm sao để điều khiển máy bơm/servo?",
    answer: "Bạn có thể bật/tắt máy bơm và servo trực tiếp trên dashboard. Chọn chế độ 'Manual' để điều khiển tay, hoặc 'Auto' để hệ thống tự động bật khi đạt ngưỡng (ví dụ: bơm bật khi độ ẩm đất < 30%).",
  },
  {
    keywords: ["lora", "lorawan", "rssi", "snr", "tín hiệu"],
    question: "LoRa/LoRaWAN hoạt động như thế nào?",
    answer: "Thiết bị ESP32/STM32 giao tiếp qua LoRa với gateway, sau đó gateway gửi dữ liệu lên server qua HTTP. Dashboard hiển thị RSSI, SNR và Spreading Factor để bạn theo dõi chất lượng tín hiệu.",
  },
  {
    keywords: ["api", "endpoint", "url", "token", "key"],
    question: "API endpoint và key ở đâu?",
    answer: "Mở phần 'Thông tin kết nối API' trên dashboard để xem API Endpoint URL và API Key. Bạn cũng có thể copy lệnh curl test và code mẫu ESP32 từ đó.",
  },
  {
    keywords: ["tần suất", "gửi", "interval", "thời gian", "bao lâu"],
    question: "Nên gửi dữ liệu với tần suất bao lâu?",
    answer: "Khuyến nghị gửi dữ liệu mỗi 1-5 phút tùy nhu cầu. Gửi quá nhanh có thể tốn năng lượng pin và bandwidth, gửi quá chậm sẽ không phản ánh kịp thời trạng thái.",
  },
  {
    keywords: ["offline", "mất kết nối", "không hiển thị", "lỗi"],
    question: "Thiết bị hiện offline, phải làm sao?",
    answer: "Kiểm tra: 1) ESP32 có kết nối WiFi chưa, 2) API endpoint và key có đúng không, 3) Thiết bị có gửi đúng format JSON không. Bạn có thể dùng lệnh curl test trong phần 'Thông tin kết nối' để kiểm tra.",
  },
  {
    keywords: ["node", "nhiều thiết bị", "2 node", "hai node"],
    question: "Hệ thống hỗ trợ bao nhiêu node?",
    answer: "Hệ thống hỗ trợ nhiều node LoRa. Mỗi node được phân biệt bằng device_id (ví dụ: node-1, node-2). Dashboard sẽ tự động nhóm và hiển thị dữ liệu theo từng node.",
  },
];

type Message = {
  id: string;
  text: string;
  isBot: boolean;
};

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  let bestMatch: FAQItem | null = null;
  let bestScore = 0;

  for (const faq of FAQ_DATA) {
    const score = faq.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch.answer;
  }

  return "Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về:\n• Kết nối ESP32\n• Cảm biến (nhiệt độ, độ ẩm)\n• Điều khiển máy bơm/servo\n• LoRa/LoRaWAN\n• API endpoint & key\n• Tần suất gửi dữ liệu";
}

const SUGGESTED_QUESTIONS = FAQ_DATA.slice(0, 4).map((f) => f.question);

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", text: "Xin chào! Tôi là trợ lý IoT. Bạn cần hỗ trợ gì?", isBot: true },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: crypto.randomUUID(), text: text.trim(), isBot: false };
    const answer = findAnswer(text);
    const botMsg: Message = { id: crypto.randomUUID(), text: answer, isBot: true };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center",
          "bg-primary text-primary-foreground shadow-lg transition-all duration-300",
          "hover:scale-110 glow-primary",
          open && "rotate-90"
        )}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[28rem] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="px-4 py-3 bg-secondary border-b border-border flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary status-online" />
            <span className="text-sm font-semibold text-foreground">Trợ lý IoT</span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.isBot ? "justify-start" : "justify-end")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-line",
                    msg.isBot
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Suggested questions - show only at start */}
            {messages.length === 1 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-muted-foreground">Câu hỏi gợi ý:</p>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="block w-full text-left text-xs px-3 py-2 rounded-md bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="flex-1 h-9 text-sm"
            />
            <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
