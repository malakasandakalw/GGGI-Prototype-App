"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store/provider";
import { cn } from "@/lib/utils";

interface Convo { key: string; moduleId: string; lecturerId: string; moduleCode: string; lecturerName: string }

export default function StudentMessages() {
  const { currentUser, modules, users, directMessages, sendMessage } = useStore();

  // Modules this student is in: own programme modules + cross-enrolled ones.
  const myModules = modules.filter(
    (m) => m.programId === currentUser?.programId || (currentUser?.crossEnrolledModuleIds ?? []).includes(m.id),
  );
  // One conversation per (module, lecturer) the student can reach.
  const convos: Convo[] = myModules.flatMap((m) =>
    m.lecturerIds.map((lid) => ({
      key: `${m.id}:${lid}`,
      moduleId: m.id,
      lecturerId: lid,
      moduleCode: m.code,
      lecturerName: users.find((u) => u.id === lid)?.name ?? "Lecturer",
    })),
  );

  const [activeKey, setActiveKey] = useState(convos[0]?.key ?? "");
  const active = convos.find((c) => c.key === activeKey);
  const [draft, setDraft] = useState("");

  const messages = active
    ? directMessages
        .filter((d) => d.moduleId === active.moduleId && d.lecturerId === active.lecturerId && d.studentId === currentUser?.id)
        .sort((a, b) => a.at.localeCompare(b.at))
    : [];

  function send() {
    if (!active || !draft.trim() || !currentUser) return;
    sendMessage({ moduleId: active.moduleId, lecturerId: active.lecturerId, studentId: currentUser.id, from: "student", text: draft });
    setDraft("");
    toast.success("Message sent");
  }

  return (
    <div>
      <PageHeader title="Messages" description="Message the lecturers of the modules you're enrolled in." />

      {convos.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No lecturers to message" description="Once you're enrolled in a module with an assigned lecturer, you can message them here." />
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1"><CardContent className="p-2 space-y-1 max-h-[560px] overflow-y-auto">
            {convos.map((c) => (
              <button key={c.key} onClick={() => setActiveKey(c.key)} className={cn("w-full text-left rounded-md p-2.5 hover:bg-muted", activeKey === c.key && "bg-primary/5 border border-primary")}>
                <p className="font-medium text-sm">{c.lecturerName}</p>
                <p className="text-xs text-muted-foreground">{c.moduleCode}</p>
              </button>
            ))}
          </CardContent></Card>

          <Card className="lg:col-span-2"><CardContent className="pt-6 flex flex-col h-[560px]">
            {active ? (
              <>
                <div className="border-b pb-2 mb-3"><p className="font-semibold">{active.lecturerName}</p><p className="text-xs text-muted-foreground">{active.moduleCode} · Direct message</p></div>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet — ask your lecturer a question.</p>}
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("max-w-[75%] rounded-lg px-3 py-2 text-sm", msg.from === "student" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}>
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
              <div className="flex-1 flex items-center justify-center"><EmptyState icon={MessageSquare} title="Select a lecturer" description="Pick a conversation to start messaging." /></div>
            )}
          </CardContent></Card>
        </div>
      )}
    </div>
  );
}
