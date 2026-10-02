"use client";

import { useState } from "react";

import { Search, Edit, MoreVertical, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";


const formatDate = (isoString: string, formatStyle: "time" | "date") => {
  const d = new Date(isoString);
  if (formatStyle === "time") {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Mock Data
type Message = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
};

type Thread = {
  id: string;
  participants: { id: string; name: string; role: string }[];
  subject: string;
  lastMessage: Message;
  messages: Message[];
  unreadCount: number;
};

const MOCK_THREADS: Thread[] = [
  {
    id: "t1",
    participants: [{ id: "parent1", name: "Sarah Connor", role: "PARENT" }, { id: "teacher1", name: "John Smith", role: "TEACHER" }],
    subject: "John's recent math assignment",
    unreadCount: 1,
    lastMessage: { id: "m2", senderId: "teacher1", senderName: "John Smith", content: "He missed the last three questions. Can we schedule a call?", timestamp: "2026-10-02T10:30:00Z" },
    messages: [
      { id: "m1", senderId: "parent1", senderName: "Sarah Connor", content: "Hi Mr. Smith, I saw John's grade for the algebra quiz. What went wrong?", timestamp: "2026-10-02T09:15:00Z" },
      { id: "m2", senderId: "teacher1", senderName: "John Smith", content: "He missed the last three questions. Can we schedule a call?", timestamp: "2026-10-02T10:30:00Z" },
    ]
  },
  {
    id: "t2",
    participants: [{ id: "parent1", name: "Sarah Connor", role: "PARENT" }, { id: "admin1", name: "Principal Skinner", role: "ADMIN" }],
    subject: "Missing Immunization Records",
    unreadCount: 0,
    lastMessage: { id: "m4", senderId: "parent1", senderName: "Sarah Connor", content: "I'll upload them to the portal tonight.", timestamp: "2026-10-01T15:45:00Z" },
    messages: [
      { id: "m3", senderId: "admin1", senderName: "Principal Skinner", content: "Dear Ms. Connor, we are still missing John's updated medical records.", timestamp: "2026-10-01T14:00:00Z" },
      { id: "m4", senderId: "parent1", senderName: "Sarah Connor", content: "I'll upload them to the portal tonight.", timestamp: "2026-10-01T15:45:00Z" },
    ]
  }
];

export function Inbox() {
  const { user } = useAuthStore();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(MOCK_THREADS[0].id);
  const [threads, setThreads] = useState(MOCK_THREADS);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");

  const activeThread = threads.find(t => t.id === activeThreadId);

  const filteredThreads = threads.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread || !user) return;

    const newMessage: Message = {
      id: Math.random().toString(),
      senderId: user.id || "me",
      senderName: user.username || "Me",
      content: replyText,
      timestamp: new Date().toISOString(),
    };

    setThreads(current => current.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          lastMessage: newMessage,
          messages: [...t.messages, newMessage]
        };
      }
      return t;
    }));
    
    setReplyText("");
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[500px] w-full overflow-hidden rounded-lg border bg-background shadow-sm">
      
      {/* LEFT PANEL: INBOX LIST */}
      <div className="flex w-full flex-col border-r md:w-1/3 lg:w-[350px]">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Edit className="h-4 w-4" />
            <span className="sr-only">New message</span>
          </Button>
        </div>
        
        {/* Search */}
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search messages..." 
              className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No conversations found.
            </div>
          ) : (
            filteredThreads.map(thread => {
              // The "other" person to display as the title
              const otherPerson = thread.participants.find(p => p.id !== user?.id) || thread.participants[0];
              const isActive = thread.id === activeThreadId;

              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={cn(
                    "flex w-full flex-col items-start gap-1 border-b p-4 text-left text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted/50",
                    isActive && "bg-muted/60"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className={cn("font-semibold", thread.unreadCount > 0 && "text-foreground font-bold")}>
                      {otherPerson.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(thread.lastMessage.timestamp, "date")}
                    </span>
                  </div>
                  <div className="w-full truncate text-xs font-medium text-foreground">
                    {thread.subject}
                  </div>
                  <div className={cn("w-full truncate text-xs", thread.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {thread.lastMessage.senderId === user?.id ? "You: " : ""}{thread.lastMessage.content}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CHAT VIEW */}
      <div className="hidden flex-1 flex-col bg-muted/10 md:flex">
        {activeThread ? (
          <>
            {/* Chat Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-none">
                    {activeThread.participants.find(p => p.id !== user?.id)?.name || "User"}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeThread.subject}
                  </p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeThread.messages.map((msg, i) => {
                const isMe = msg.senderId === user?.id;
                
                return (
                  <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn("flex max-w-[75%] flex-col gap-1", isMe ? "items-end" : "items-start")}>
                      {!isMe && (
                        <span className="text-xs font-medium text-muted-foreground ml-1">
                          {msg.senderName}
                        </span>
                      )}
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm",
                        isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border shadow-sm rounded-tl-sm"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">
                        {formatDate(msg.timestamp, "time")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <div className="shrink-0 border-t bg-card p-4">
              <form onSubmit={handleSendReply} className="flex w-full items-center gap-2">
                <Input 
                  placeholder="Type your message..." 
                  className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:bg-background px-4 h-10" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full" disabled={!replyText.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Send className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Your Messages</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-[250px]">
              Select a conversation from the left to view or reply to messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}