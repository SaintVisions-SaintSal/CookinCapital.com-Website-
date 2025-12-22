"use client"

import { useState, useEffect } from "react"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield, CreditCard, Mail, Smartphone, CheckCircle2, Loader2, AlertCircle } from "lucide-react"

export function SettingsPanel() {
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Profile state
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    role: "Borrower",
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailDeals: true,
    emailApplications: true,
    emailMarketing: false,
    smsDeals: true,
    smsUrgent: true,
    pushEnabled: true,
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (isSupabaseAvailable()) {
          const supabase = createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            setUser(user)
            setProfile({
              fullName: user.user_metadata?.full_name || "",
              email: user.email || "",
              phone: user.user_metadata?.phone || "",
              company: user.user_metadata?.company || "",
              role: user.user_metadata?.role || "Borrower",
            })
          }
        }
      } catch (e) {
        console.warn("[v0] Could not fetch user")
      }

      // Load saved notification preferences from localStorage
      const savedNotifications = localStorage.getItem("cookincap_notifications")
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications))
      }

      // Load profile from localStorage as fallback
      const savedProfile = localStorage.getItem("cookincap_profile")
      if (savedProfile && !user) {
        setProfile(JSON.parse(savedProfile))
      }

      setLoading(false)
    }
    loadUser()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      if (isSupabaseAvailable()) {
        const supabase = createClient()
        await supabase.auth.updateUser({
          data: {
            full_name: profile.fullName,
            phone: profile.phone,
            company: profile.company,
            role: profile.role,
          },
        })
      }

      // Always save to localStorage as backup
      localStorage.setItem("cookincap_profile", JSON.stringify(profile))
      localStorage.setItem("cookincap_notifications", JSON.stringify(notifications))

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    try {
      if (isSupabaseAvailable()) {
        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({
          password: passwordData.newPassword,
        })
        if (error) throw error
      }

      setPasswordSuccess(true)
      setPasswordData({ newPassword: "", confirmPassword: "" })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <User className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Settings</h1>
          <p className="text-muted-foreground">Manage your account and notification preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary h-12 flex-wrap">
          <TabsTrigger value="profile" className="px-4 sm:px-6 gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="px-4 sm:px-6 gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="px-4 sm:px-6 gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="px-4 sm:px-6 gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={profile.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Information</CardTitle>
                <CardDescription>Your company details for funding applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    placeholder="ABC Investments LLC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Your Role</Label>
                  <select
                    id="role"
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Borrower">Borrower / Investor</option>
                    <option value="Investor">Capital Partner</option>
                    <option value="Lender">Private Lender</option>
                    <option value="Agent">Real Estate Agent</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Email Notifications</CardTitle>
                    <CardDescription>Choose what emails you receive</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Deal Updates</p>
                    <p className="text-sm text-muted-foreground">New opportunities and deal status changes</p>
                  </div>
                  <Switch
                    checked={notifications.emailDeals}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailDeals: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Application Status</p>
                    <p className="text-sm text-muted-foreground">Updates on your funding applications</p>
                  </div>
                  <Switch
                    checked={notifications.emailApplications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailApplications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Marketing & News</p>
                    <p className="text-sm text-muted-foreground">Tips, market updates, and promotions</p>
                  </div>
                  <Switch
                    checked={notifications.emailMarketing}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailMarketing: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">SMS & Push Notifications</CardTitle>
                    <CardDescription>Mobile alerts and text messages</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Deal Alerts (SMS)</p>
                    <p className="text-sm text-muted-foreground">Text alerts for new deals</p>
                  </div>
                  <Switch
                    checked={notifications.smsDeals}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsDeals: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Urgent Updates (SMS)</p>
                    <p className="text-sm text-muted-foreground">Critical updates requiring attention</p>
                  </div>
                  <Switch
                    checked={notifications.smsUrgent}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsUrgent: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Browser and app notifications</p>
                  </div>
                  <Switch
                    checked={notifications.pushEnabled}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                {passwordError && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 text-green-500 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Password updated successfully
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handlePasswordChange}
                  disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">2FA Not Enabled</p>
                      <p className="text-sm text-muted-foreground">Protect your account with 2FA</p>
                    </div>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-foreground">Pro Access</p>
                      <p className="text-sm text-muted-foreground">Full CRM + Deal Analyzer + SaintSal AI</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
                <CardDescription>Manage your payment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Settings saved</span>
          </div>
        )}
        <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
