"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
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
  const { gradeBands, notificationTemplates, systemSettings, setSystemSettings } = useStore();
  const [maintenance, setMaintenance] = useState(systemSettings.maintenanceMode);

  return (
    <div>
      <PageHeader title="System Settings" description="Configure global system parameters." />
      <Tabs defaultValue="grading">
        <TabsList>
          <TabsTrigger value="grading">Grading Scheme</TabsTrigger>
          <TabsTrigger value="templates">Notification Templates</TabsTrigger>
          <TabsTrigger value="files">File Settings</TabsTrigger>
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
                {systemSettings.allowedFileTypes.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
            </div>
            <Button onClick={() => toast.success("File settings saved")}>Save</Button>
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
                <AlertDescription>Students and staff will see a maintenance notice.</AlertDescription>
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
    </div>
  );
}
