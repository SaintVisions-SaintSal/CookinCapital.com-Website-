import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Link
        href="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="CookinCap" width={48} height={48} className="rounded-xl" />
          </Link>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-secondary">
              <Mail className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Click the link in your email to confirm your account</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Didn't receive an email? Check your spam folder or try signing up again.
            </p>
            <Link href="/auth/login" className="inline-block text-primary hover:underline text-sm font-medium">
              Back to login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
