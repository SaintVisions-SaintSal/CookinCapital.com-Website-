import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ImageIcon, Upload, Download, Eye, Trash2, Plus } from "lucide-react"

const documents = [
  { id: "1", name: "Purchase Agreement.pdf", type: "pdf", size: "2.4 MB", uploaded: "Jan 15, 2024" },
  { id: "2", name: "Title Report.pdf", type: "pdf", size: "1.8 MB", uploaded: "Jan 16, 2024" },
  { id: "3", name: "Property Photos.zip", type: "archive", size: "45 MB", uploaded: "Jan 14, 2024" },
  { id: "4", name: "Inspection Report.pdf", type: "pdf", size: "3.2 MB", uploaded: "Jan 17, 2024" },
  { id: "5", name: "Rehab Estimate.xlsx", type: "spreadsheet", size: "256 KB", uploaded: "Jan 15, 2024" },
]

export function DealRoomDocuments() {
  return (
    <div className="space-y-6">
      {/* Upload area */}
      <Card className="border-dashed border-2">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">Upload Documents</p>
            <p className="mt-1 text-sm text-muted-foreground">Drag and drop files here, or click to browse</p>
            <Button variant="outline" className="mt-4 bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documents ({documents.length})</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            Download All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    {doc.type === "pdf" ? (
                      <FileText className="h-5 w-5 text-red-500" />
                    ) : doc.type === "archive" ? (
                      <ImageIcon className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.size} • Uploaded {doc.uploaded}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
