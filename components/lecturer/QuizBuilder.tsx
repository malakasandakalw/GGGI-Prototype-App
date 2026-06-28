"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store/provider";
import type { Question, QuestionType } from "@/lib/types";

const uid = () => Math.random().toString(36).slice(2, 8);

export function QuizBuilder({ open, onOpenChange, moduleId }: { open: boolean; onOpenChange: (o: boolean) => void; moduleId: string }) {
  const { addQuiz, updateQuiz } = useStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState("bank");
  // current question draft
  const [qType, setQType] = useState<QuestionType>("mcq-single");
  const [qText, setQText] = useState("");
  const [qMarks, setQMarks] = useState(2);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correct, setCorrect] = useState<string>("");
  const [explanation, setExplanation] = useState("");
  // config
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [timeLimit, setTimeLimit] = useState("20");
  const [attempts, setAttempts] = useState("1");
  const [randomise, setRandomise] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);

  const total = questions.reduce((s, q) => s + q.marks, 0);

  function addQuestion() {
    if (!qText.trim()) return;
    const q: Question = {
      id: uid(), type: qType, text: qText, marks: qMarks, explanation: explanation || undefined,
      options: ["mcq-single", "mcq-multi"].includes(qType) ? options.filter(Boolean) : undefined,
      correctAnswer: qType === "true-false" ? (correct || "True") : correct,
    };
    setQuestions((prev) => [...prev, q]);
    setQText(""); setOptions(["", ""]); setCorrect(""); setExplanation(""); setQMarks(2);
    toast.success("Question added");
  }

  function finish(submit: boolean) {
    const q = addQuiz({
      moduleId, title, instructions, questions,
      timeLimitMinutes: Number(timeLimit) || undefined,
      allowedAttempts: attempts === "unlimited" ? 99 : Number(attempts),
      randomiseOrder: randomise, showAnswersAfter: showAnswers,
      availableFrom: "2026-06-28T09:00", availableTo: "2026-07-30T23:59",
    });
    if (submit) updateQuiz(q.id, { status: "submitted", submittedAt: new Date().toISOString() });
    toast.success(submit ? "Quiz submitted for HOD verification" : "Quiz saved as draft");
    onOpenChange(false);
    setQuestions([]); setStep("bank"); setTitle("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create Quiz</DialogTitle></DialogHeader>
        <Tabs value={step} onValueChange={setStep}>
          <TabsList>
            <TabsTrigger value="bank">1. Questions</TabsTrigger>
            <TabsTrigger value="config">2. Configuration</TabsTrigger>
            <TabsTrigger value="review">3. Review</TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="space-y-4">
            <div className="rounded-lg border p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Question Type</Label>
                  <Select value={qType} onValueChange={(v) => setQType(v as QuestionType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq-single">MCQ Single</SelectItem>
                      <SelectItem value="mcq-multi">MCQ Multiple</SelectItem>
                      <SelectItem value="true-false">True / False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                      <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">Marks</Label><Input type="number" value={qMarks} onChange={(e) => setQMarks(Number(e.target.value))} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Question Text <span className="text-muted-foreground">(Rich text to be integrated)</span></Label><Textarea value={qText} onChange={(e) => setQText(e.target.value)} /></div>

              {["mcq-single", "mcq-multi"].includes(qType) && (
                <div className="space-y-2">
                  <Label className="text-xs">Options (click to mark correct)</Label>
                  {options.map((o, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={o} onChange={(e) => setOptions((p) => p.map((x, j) => j === i ? e.target.value : x))} placeholder={`Option ${i + 1}`} />
                      <Button type="button" size="sm" variant={correct === o && o ? "default" : "outline"} onClick={() => setCorrect(o)}>Correct</Button>
                    </div>
                  ))}
                  <Button type="button" size="sm" variant="ghost" onClick={() => setOptions((p) => [...p, ""])}><Plus className="size-4" /> Add Option</Button>
                </div>
              )}
              {qType === "true-false" && (
                <RadioGroup value={correct || "True"} onValueChange={setCorrect} className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="True" /> True</label>
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="False" /> False</label>
                </RadioGroup>
              )}
              {(qType === "short-answer" || qType === "fill-blank") && (
                <div className="space-y-1.5"><Label className="text-xs">Correct Answer{qType === "fill-blank" && " (comma-separated for multiple)"}</Label><Input value={correct} onChange={(e) => setCorrect(e.target.value)} /></div>
              )}
              <div className="space-y-1.5"><Label className="text-xs">Explanation (optional)</Label><Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} /></div>
              <Button type="button" size="sm" onClick={addQuestion}><Plus className="size-4" /> Save Question</Button>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Question Bank ({questions.length}) — {total} marks</p>
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                    <span className="truncate">{i + 1}. {q.text}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-[10px]">{q.marks}m</Badge>
                      <Button size="icon" variant="ghost" onClick={() => setQuestions((p) => p.filter((x) => x.id !== q.id))}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Quiz Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Instructions</Label><Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Time Limit (min)</Label><Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Allowed Attempts</Label>
                <Select value={attempts} onValueChange={setAttempts}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["1", "2", "3", "unlimited"].map((a) => <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="flex items-center justify-between"><Label className="text-sm">Randomise question order</Label><Switch checked={randomise} onCheckedChange={setRandomise} /></div>
            <div className="flex items-center justify-between"><Label className="text-sm">Show answers after submission</Label><Switch checked={showAnswers} onCheckedChange={setShowAnswers} /></div>
            <p className="text-sm text-muted-foreground">Total Marks: {total}</p>
          </TabsContent>

          <TabsContent value="review" className="space-y-3">
            <div className="rounded-lg border p-4 text-sm space-y-1">
              <p><b>{title || "Untitled Quiz"}</b></p>
              <p className="text-muted-foreground">{questions.length} questions · {total} marks · {timeLimit} min · {attempts} attempt(s)</p>
              <p className="text-muted-foreground">{randomise ? "Randomised" : "Fixed"} order · Answers {showAnswers ? "shown" : "hidden"} after</p>
            </div>
            <DialogFooter>
              <Button variant="outline" disabled={!title || questions.length === 0} onClick={() => finish(false)}>Save as Draft</Button>
              <Button disabled={!title || questions.length === 0} onClick={() => finish(true)}>Submit for HOD Verification</Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
