'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUserProfile } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Phone, CheckCircle, User } from 'lucide-react'

export default function ContactAdminPage() {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkUserStatus()
  }, [router])

  const checkUserStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/sign-in')
        return
      }

      setUserEmail(user.email || '')

      // Check if user is admin - if so, redirect to admin dashboard
      const profile = await getCurrentUserProfile()
      if (profile?.is_admin) {
        router.push('/admin')
        return
      }
    } catch (error) {
      console.error('Error checking user status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Account Created Successfully!</CardTitle>
            <CardDescription>
              Your account has been created and is pending admin approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                <strong>Account Status:</strong> Awaiting admin approval
                <br />
                <strong>Registered Email:</strong> {userEmail}
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Your account has been created with limited access</li>
                <li>An administrator will review and approve your account</li>
                <li>Once approved, you&apos;ll have full access to TRANSFORMO AI features</li>
                <li>You&apos;ll receive an email notification when your access is granted</li>
              </ol>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Need Immediate Access?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Contact an administrator to expedite your account approval:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <a 
                      href="mailto:admin@transformo.ai" 
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      admin@transformo.ai
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <a 
                      href="tel:+1234567890" 
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      +1 (234) 567-8900
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}