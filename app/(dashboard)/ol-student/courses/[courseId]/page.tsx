"use client";

import { useParams } from "next/navigation";
import { OLCourseViewer } from "@/components/ol/OLCourseViewer";

export default function OLCourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  return <OLCourseViewer courseId={courseId} backHref="/ol-student/courses" />;
}
