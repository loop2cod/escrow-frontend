"use client";

import { AdminChatMonitor } from "@/components/chat/AdminChatMonitor";

export default function AdminChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chat Monitor</h1>
        <p className="text-muted-foreground">
          Monitor and participate in buyer-seller conversations
        </p>
      </div>
      
      <AdminChatMonitor />
    </div>
  );
}
