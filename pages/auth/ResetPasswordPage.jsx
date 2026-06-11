import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Spinner } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { supabase, isSupabaseConfigured } from '@/lib/supabase.client'
import { showToast } from '@/store/toastStore'
import { validatePassword } from '@/utils/validators'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isLinkValid, setIsLinkValid] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsVerifying(false)
      return
    }
    let cancelled = false

    const verify = async () => {
      const { data } = await supabase.auth.getSession()
      if (cancelled) return
      if (data?.session) {
        setIsLinkValid(true)
        setIsVerifying(false)
      }
    }
    verify()

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === 'PASSWORD_RECOVERY' || session) {
        setIsLinkValid(true)
        setIsVerifying(false)
      }
    })

    const timer = setTimeout(() => {
      if (!cancelled) setIsVerifying(false)
    }, 4000)

    return () => {
      cancelled = true
      clearTimeout(timer)
      subscription?.subscription?.unsubscribe?.()
    }
  }, [])

  const handleSubmit = async () => {
    const next = {}
    const pwError = validatePassword(password)
    if (pwError) next.password = pwError
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    if (Object.keys(next).length) return

    setIsSubmitting(true)
    try {
      await updatePassword(password)
      showToast({ message: 'Password updated', type: 'success' })
      navigate('/home', { replace: true })
    } catch (error) {
      showToast({ message: error.message || 'Could not update password', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-lg">
        <Spinner size={24} />
      </div>
    )
  }

  if (!isLinkValid) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-lg py-2xl">
        <div className="flex flex-col gap-md">
          <h1 className="text-heading font-bold text-text">Link expired</h1>
          <p className="text-body text-muted">
            Your reset link is invalid or has expired. Request a new one.
          </p>
          <Button onClick={() => navigate('/forgot-password', { replace: true })} fullWidth>
            Request new link
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-lg py-2xl">
      <div className="flex flex-col gap-lg">
        <div className="flex flex-col gap-xs">
          <h1 className="text-heading font-bold text-text">Set a new password</h1>
          <p className="text-body text-muted">
            Use at least 6 characters.
          </p>
        </div>

        <form
          className="flex flex-col gap-md"
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <Input
            id="password"
            label="New password"
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            required
            autoFocus
          />
          <Input
            id="confirm_password"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
            required
          />
          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Update password
          </Button>
        </form>
      </div>
    </div>
  )
}
