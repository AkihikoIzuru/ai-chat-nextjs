
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

type Message = {
  role: string;
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  //males benerin 😂
  const [isTyping, setIsTyping] = useState(false);


  useEffect(() => {
    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
  
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
  
    try {
      const response = await axios.post(
        API_URL,
        {
          model: "deepseek/deepseek-r1:free",
          messages: [...messages, userMessage],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data.choices && response.data.choices.length > 0) {
        const aiMessage: Message = { role: "assistant", content: response.data.choices[0].message.content };
  
        // Tambahkan delay sebelum jawaban muncul (simulasi mengetik)
        setTimeout(() => {
          setMessages((prev) => [...prev, aiMessage]);
          setIsTyping(false); // Selesai mengetik
        }, 1500); // Delay 1.5 detik
      } else {
        console.error("Unexpected API response:", response.data);
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      setIsTyping(false);
    }
  };
  

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div className="h-80 overflow-y-auto border p-2 rounded-lg bg-white">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
<span className={`px-3 py-1 rounded-lg max-w-[80%] block whitespace-pre-wrap ${
  msg.role === "user"
    ? "bg-blue-500 text-white self-end"
    : "bg-gray-300 text-black self-start"
}`}>
  <ReactMarkdown>{msg.content}</ReactMarkdown>
</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tulis pesan..." />
        <Button onClick={sendMessage}>Kirim</Button>
        <Button variant="destructive" onClick={clearChat}>Hapus</Button>
      </div>
    </div>
  );
}
