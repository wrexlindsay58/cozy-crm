export function reportTitle(id: string) {
  return id;
}
export function ReportViewer({ reportId }: { reportId: string }) {
  return <p className="text-sm text-muted">Report {reportId}.</p>;
}
