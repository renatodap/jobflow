"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, resendConfirmation, handleAuthError } from "@/lib/supabase"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

interface LoginFormProps {
  redirectTo?: string
  className?: string
}

/**
 * Complete authentication form component
 * Handles both email and Google OAuth authentication
 */
export function LoginForm({ redirectTo, className }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState("")
  
  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    console.log('🔍 LoginForm: Google sign in button clicked')
    try {
      setIsGoogleLoading(true)
      
      console.log('🔍 LoginForm: Calling signInWithGoogle with redirectTo:', redirectTo)
      await signInWithGoogle(redirectTo)
      
      // Note: The actual redirect happens in the OAuth flow
      toast.success("Redirecting to Google...")
      
    } catch (error: any) {
      console.error("❌ LoginForm: Google sign in error:", error)
      const errorMessage = handleAuthError(error)
      toast.error(errorMessage)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔍 LoginForm: Email sign in form submitted')
    
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setIsLoading(true)
      
      console.log('🔍 LoginForm: Calling signInWithEmail')
      const result = await signInWithEmail(email, password)
      
      if (result.user) {
        console.log('✅ LoginForm: Sign in successful, redirecting to:', redirectTo || "/dashboard")
        toast.success("Successfully signed in!")
        router.push(redirectTo || "/dashboard")
      }
      
    } catch (error: any) {
      console.error("❌ LoginForm: Email sign in error:", error)
      
      // Check if it's an email not confirmed error
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        setNeedsEmailConfirmation(true)
        setConfirmationEmail(email)
        toast.error("Please check your email and click the confirmation link to sign in.")
      } else {
        const errorMessage = handleAuthError(error)
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !fullName || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    try {
      setIsLoading(true)
      
      const result = await signUpWithEmail(email, password, fullName)
      
      if (result.user) {
        if (result.user.email_confirmed_at) {
          toast.success("Account created successfully!")
          router.push(redirectTo || "/dashboard")
        } else {
          toast.success("Please check your email to confirm your account")
          setActiveTab("signin")
        }
      }
      
    } catch (error: any) {
      console.error("Email sign up error:", error)
      const errorMessage = handleAuthError(error)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resetEmail) {
      toast.error("Please enter your email address")
      return
    }

    try {
      setIsLoading(true)
      
      await resetPassword(resetEmail)
      toast.success("Password reset email sent! Check your inbox.")
      setActiveTab("signin")
      
    } catch (error: any) {
      console.error("Password reset error:", error)
      const errorMessage = handleAuthError(error)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    try {
      setIsLoading(true)
      
      await resendConfirmation(confirmationEmail)
      toast.success("Confirmation email sent! Please check your inbox.")
      
    } catch (error: any) {
      console.error("❌ LoginForm: Resend confirmation error:", error)
      const errorMessage = handleAuthError(error)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome to StudySharper</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Google Sign In */}
        <Button 
          variant="outline" 
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full mb-4"
        >
          {isGoogleLoading ? (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        {/* Email Confirmation Notice */}
        {needsEmailConfirmation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Email Confirmation Required
            </h3>
            <p className="text-sm text-yellow-700 mb-3">
              Please check your email ({confirmationEmail}) and click the confirmation link to sign in.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendConfirmation}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              ) : null}
              Resend Confirmation Email
            </Button>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Email Authentication Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="reset">Reset</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : null}
                Sign In
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : null}
                Create Account
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="reset">
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : null}
                Send Reset Email
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}