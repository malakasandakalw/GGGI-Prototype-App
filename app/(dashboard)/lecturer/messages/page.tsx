"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store/provider";
import { cn } from "@/lib/utils";
import { studentsInModule } from "@/lib/utils/student-access";
import type { User } from "@/lib/types";

interface Message { from: "me" | "student"; text: string; at: string }

export default function LecturerMessages() {
  const { currentUser, modules, programs, users } = useStore();
  const myModules = modules.filter((m) => m.lecturerIds.includes(currentUser?.id ?? ""));
  const [moduleId, setModuleId] = useState(myModules[0]?.id ?? "");
  const mod = myModules.find((m) => m.id === moduleId);
  // Recipients by enrollment — includes cross-enrolled Open Learning students.
  const enrolled = studentsInModule(users, programs, moduleId);
  const [activeStudent, setActiveStudent] = useState<User | null>(null);
  const [draft, setDraft] = useState("");
  // Module-scoped mock conversations, keyed by `${moduleId}:${studentId}` (local only).
  const [threads, setThreads] = useState<Record<string, Message[]>>({});

  const keyFor = (sid: string) => `${moduleId}:${sid}`;
  const seed: Message[] = [{ from: "student", text: "Hello, I have a question about the latest assignment — is the deadline firm?", at: "2026-06-30T10:12" }];
  const messages = activeStudent ? (threads[keyFor(activeStudent.id)] ?? seed) : [];

  function send() {
    if (!activeStudent || !draft.trim()) return;
    const key = keyFor(activeStudent.id);
    setThreads((prev) => ({ ...prev, [key]: [...(prev[key] ?? seed), { from: "me", text: draft, at: new Date().toISOString() }] }));
    setDraft("");
    toast.success("Message sent (simulated)");
  }

  return (
    <div>
      <PageHeader title="Messages" description="Module-scoped direct messaging with your students.">
        <Select value={moduleId} onValueChange={(v) => { setModuleId(v); setActiveStudent(null); }}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent>{myModules.map((m) => <SelectItem key={m.id} value={m.id}>{m.code} — {m.name}</SelectItem>)}</SelectContent>
        </Select>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1"><CardContent className="p-2 space-y-1 max-h-[560px] overflow-y-auto">
          {enrolled.map((s) => (
            <button key={s.id} onClick={() => setActiveStudent(s)} className={cn("w-full text-left rounded-md p-2.5 hover:bg-muted", activeStudent?.id === s.id && "bg-primary/5 border border-primary")}>
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.studentId ?? "—"}</p>
            </button>
          ))}
          {enrolled.length === 0 && <p className="text-sm text-muted-foreground p-3">No students in this module.</p>}
        </CardContent></Card>

        <Card className="lg:col-span-2"><CardContent className="pt-6 flex flex-col h-[560px]">
          {activeStudent ? (
            <>
              <div className="border-b pb-2 mb-3"><p className="font-semibold">{activeStudent.name}</p><p className="text-xs text-muted-foreground">{mod?.code} · Direct message</p></div>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("max-w-[75%] rounded-lg px-3 py-2 text-sm", msg.from === "me" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t mt-3">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && send()} />
                <Button onClick={send} disabled={!draft.trim()}><Send className="size-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center"><EmptyState icon={MessageSquare} title="Select a student" description="Pick a student to start or continue a conversation." /></div>
          )}
        </CardContent></Card>
      </div>
    </div>
  );
}
