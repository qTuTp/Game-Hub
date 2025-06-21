"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import Link from "next/link"

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  // Profile information states
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState("")
  const [isLoadingName, setIsLoadingName] = useState(false)

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)

  // Load user name when component mounts or user changes
  useEffect(() => {
    if (user) {
      setName(user.name)
    }
  }, [user])

  // Handle name update
  const handleSaveName = async () => {
    if (!user || !name.trim()) return

    setIsLoadingName(true)
    try {
      await updateProfile({ name: name.trim() })
      setIsEditingName(false)
      toast.success("Name updated successfully")
    } catch (error) {
      console.error("Error updating name:", error)
      toast.error("Failed to update name")
    } finally {
      setIsLoadingName(false)
    }
  }

  // Handle password change
  const handleChangePassword = async () => {
    if (!user || !auth.currentUser) return

    // Validation checks
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    // Minimum length check
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters")
      return
    }

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
      )
      return
    }

    // Check for common weak passwords
    const commonPasswords = [
      "password",
      "123456",
      "password123",
      "admin",
      "qwerty",
      "letmein",
      "welcome",
      "monkey",
      "dragon",
      "master",
      "shadow",
      "123456789",
    ]
    if (commonPasswords.includes(newPassword.toLowerCase())) {
      toast.error("Please choose a stronger password. Avoid common passwords.")
      return
    }

    setIsLoadingPassword(true)
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update password
      await updatePassword(auth.currentUser, newPassword)

      // Clear form fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      toast.success("Password updated successfully")
    } catch (error: any) {
      console.error("Error updating password:", error)
      if (error.code === "auth/wrong-password") {
        toast.error("Current password is incorrect")
      } else if (error.code === "auth/weak-password") {
        toast.error("New password is too weak")
      } else {
        toast.error("Failed to update password")
      }
    } finally {
      setIsLoadingPassword(false)
    }
  }

  // Handle logout
  // This function handles user logout and displays a success message
  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to log out")
    }
  }

  // If user is not logged in, show access denied message
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(user.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Profile Settings */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="flex-1"
                      />
                      <Button onClick={handleSaveName} disabled={isLoadingName || !name.trim()}>
                        {isLoadingName ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingName(false)
                          setName(user.name)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input value={user.name} disabled className="flex-1" />
                      <Button variant="outline" onClick={() => setIsEditingName(true)}>
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user.email} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters with uppercase, lowercase, number, and special character
                    (@$!%*?&)
                  </p>
                  {newPassword && (
                    <div className="space-y-1 mt-2">
                      <div className="text-xs text-muted-foreground">Password strength:</div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div
                          className={`flex items-center gap-1 ${newPassword.length >= 8 ? "text-green-600" : "text-red-600"}`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${newPassword.length >= 8 ? "bg-green-600" : "bg-red-600"}`}
                          />
                          8+ characters
                        </div>
                        <div
                          className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? "text-green-600" : "text-red-600"}`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${/[A-Z]/.test(newPassword) ? "bg-green-600" : "bg-red-600"}`}
                          />
                          Uppercase
                        </div>
                        <div
                          className={`flex items-center gap-1 ${/[a-z]/.test(newPassword) ? "text-green-600" : "text-red-600"}`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${/[a-z]/.test(newPassword) ? "bg-green-600" : "bg-red-600"}`}
                          />
                          Lowercase
                        </div>
                        <div
                          className={`flex items-center gap-1 ${/\d/.test(newPassword) ? "text-green-600" : "text-red-600"}`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${/\d/.test(newPassword) ? "bg-green-600" : "bg-red-600"}`}
                          />
                          Number
                        </div>
                        <div
                          className={`flex items-center gap-1 ${/[@$!%*?&]/.test(newPassword) ? "text-green-600" : "text-red-600"}`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${/[@$!%*?&]/.test(newPassword) ? "bg-green-600" : "bg-red-600"}`}
                          />
                          Special char
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={isLoadingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {isLoadingPassword ? "Updating Password..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <Button variant="destructive" onClick={handleLogout}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
