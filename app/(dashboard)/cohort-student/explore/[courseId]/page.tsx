"use client";

import { useParams } from "next/navigation";
import { OLCourseViewer } from "@/components/ol/OLCourseViewer";

export default function CohortOLCourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  return <OLCourseViewer courseId={courseId} backHref="/cohort-student/explore" backLabel="Back to Open Learning" />;
}
