"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/provider";

export default function SettingsPage() {
  const { gradeBands, notificationTemplates, systemSettings, setSystemSettings, modules, programs } = useStore();
  const [maintenance, setMaintenance] = useState(systemSettings.maintenanceMode);

  // File types (editable)
  const [fileTypes, setFileTypes] = useState<string[]>(systemSettings.allowedFileTypes);
  const [newType, setNewType] = useState("");

  // Cross-stream rules
  const [xs, setXs] = useState({
    allowCohortToCohort: systemSettings.allowCohortToCohort,
    allowCohortToOL: systemSettings.allowCohortToOL,
    allowOLToCohort: systemSettings.allowOLToCohort,
    requireRegistrarPaymentApproval: systemSettings.requireRegistrarPaymentApproval,
  });
  const [xsInfo, setXsInfo] = useState(false);
  const exposedModules = modules.filter((m) => m.isCrossStreamEnabled);
  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";

  function addFileType() {
    let t = newType.trim().toLowerCase();
    if (!t) return;
    if (!t.startsWith(".")) t = "." + t;
    if (!fileTypes.includes(t)) setFileTypes((prev) => [...prev, t]);
    setNewType("");
  }

  return (
    <div>
      <PageHeader title="System Settings" description="Configure global system parameters." />
      <Tabs defaultValue="grading">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="grading">Grading Scheme</TabsTrigger>
          <TabsTrigger value="templates">Notification Templates</TabsTrigger>
          <TabsTrigger value="files">File Settings</TabsTrigger>
          <TabsTrigger value="cross-stream">Cross-Stream Rules</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="academic">Academic Year</TabsTrigger>
        </TabsList>

        <TabsContent value="grading">
          <Card><CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Grade</TableHead><TableHead>Min Mark</TableHead><TableHead>Grade Point</TableHead></TableRow></TableHeader>
              <TableBody>
                {gradeBands.map((b) => (
                  <TableRow key={b.grade}>
                    <TableCell className="font-medium">{b.grade}</TableCell>
                    <TableCell><Input defaultValue={b.minMark} className="w-24" type="number" /></TableCell>
                    <TableCell>{b.gradePoint.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button className="mt-4" onClick={() => toast.success("Grading scheme saved")}>Save Changes</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card><CardContent className="pt-6 space-y-4">
            {notificationTemplates.map((t) => (
              <div key={t.id} className="space-y-1.5">
                <Label className="text-sm font-medium">{t.event}</Label>
                <Textarea defaultValue={t.body} rows={2} />
              </div>
            ))}
            <Button onClick={() => toast.success("Templates saved")}>Save Templates</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="files">
          <Card><CardContent className="pt-6 space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label className="text-xs">Max File Size (MB)</Label>
              <Input type="number" defaultValue={systemSettings.maxFileSizeMb} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Allowed File Types</Label>
              <div className="flex flex-wrap gap-1.5">
                {fileTypes.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <button onClick={() => setFileTypes((prev) => prev.filter((x) => x !== t))} className="hover:text-destructive"><X className="size-3" /></button>
                  </Badge>
                ))}
                {fileTypes.length === 0 && <span className="text-xs text-muted-foreground">No file types allowed.</span>}
              </div>
              <div className="flex gap-2 pt-1">
                <Input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="e.g. .txt" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFileType(); } }} />
                <Button variant="outline" onClick={addFileType}><Plus className="size-4" /> Add</Button>
              </div>
            </div>
            <Button onClick={() => { setSystemSettings({ allowedFileTypes: fileTypes }); toast.success("File settings saved"); }}>Save</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="cross-stream">
          <Card><CardContent className="pt-6 space-y-5 max-w-2xl">
            <p className="text-sm text-muted-foreground">These rules govern how HODs expose modules for cross-stream access and how the Registrar processes cross-stream enrollment requests (SRS §4.1, §7.4).</p>
            <div className="space-y-4 max-w-md">
              <ToggleRow label="Allow Cohort → Cohort requests" desc="Students requesting modules from another Cohort program." checked={xs.allowCohortToCohort} onChange={(v) => setXs((s) => ({ ...s, allowCohortToCohort: v }))} />
              <ToggleRow label="Allow Cohort → Open Learning" desc="Cohort students enrolling in OL courses." checked={xs.allowCohortToOL} onChange={(v) => setXs((s) => ({ ...s, allowCohortToOL: v }))} />
              <ToggleRow label="Allow Open Learning → Cohort" desc="OL students requesting Cohort modules (Scenario A)." checked={xs.allowOLToCohort} onChange={(v) => setXs((s) => ({ ...s, allowOLToCohort: v }))} />
              <ToggleRow label="Require Registrar payment approval (paid)" desc="Paid cross-stream requests must be approved by the Registrar after payment." checked={xs.requireRegistrarPaymentApproval} onChange={(v) => setXs((s) => ({ ...s, requireRegistrarPaymentApproval: v }))} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Modules currently exposed for cross-stream ({exposedModules.length})</Label>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Program</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {exposedModules.map((m) => <TableRow key={m.id}><TableCell>{m.code} — {m.name}</TableCell><TableCell className="text-muted-foreground">{programName(m.programId)}</TableCell></TableRow>)}
                    {exposedModules.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-4">No modules exposed yet. HODs enable this per module.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
              <p className="text-[11px] text-muted-foreground">This list is read-only — individual exposure is toggled by each module&apos;s HOD.</p>
            </div>

            <Button onClick={() => { setSystemSettings(xs); toast.success("Cross-stream rules saved"); setXsInfo(true); }}>Save Rules</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="security">
          <Card><CardContent className="pt-6 space-y-5 max-w-md">
            <div className="space-y-1.5">
              <Label className="text-xs">Session Timeout (minutes)</Label>
              <Input type="number" defaultValue={systemSettings.sessionTimeoutMinutes} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Require re-authentication for admin actions</Label>
              <Switch defaultChecked={systemSettings.requireReauthForAdmin} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Maintenance Mode</Label>
              <Switch checked={maintenance} onCheckedChange={(v) => { setMaintenance(v); setSystemSettings({ maintenanceMode: v }); }} />
            </div>
            {maintenance && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTitle>Maintenance mode is active</AlertTitle>
                <AlertDescription>A system-wide banner is now shown to all users.</AlertDescription>
              </Alert>
            )}
            <Button onClick={() => toast.success("Security settings saved")}>Save</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card><CardContent className="pt-6 space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label className="text-xs">Current Academic Year</Label>
              <Input defaultValue={systemSettings.academicYear} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Semesters per Year</Label>
              <Input type="number" defaultValue={systemSettings.semestersPerYear} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Default Semester Duration (weeks)</Label>
              <Input type="number" defaultValue={systemSettings.semesterDurationWeeks} />
            </div>
            <Button onClick={() => toast.success("Academic year settings saved")}>Save</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <InfoDialog
        open={xsInfo}
        onOpenChange={setXsInfo}
        title="Cross-stream rules updated"
        description={<>These rules govern how <strong>HODs</strong> expose modules for cross-stream access and how the <strong>Registrar</strong> processes cross-stream enrollment requests.</>}
      />
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
