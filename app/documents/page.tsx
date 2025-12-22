import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { DocumentUploadPage } from "@/components/landing/document-upload-page"

export const metadata = {
  title: "Secure Document Upload | CookinCap",
  description: "Securely upload your loan documents to our encrypted portal for faster processing.",
}

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DocumentUploadPage />
      <Footer />
    </div>
  )
}
