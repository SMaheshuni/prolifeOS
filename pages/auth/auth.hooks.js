import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/store/toastStore'
import { validateEmail, validatePassword } from '@/utils/validators'

export const useLogin = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const nextErrors = {}
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    if (emailError) nextErrors.email = emailError
    if (passwordError) nextErrors.password = passwordError
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/home', { replace: true })
    } catch (error) {
      showToast({ message: error.message || 'Could not sign in', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { email, password, errors, isSubmitting, setEmail, setPassword, handleSubmit }
}

export const useSignup = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const nextErrors = {}
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    if (emailError) nextErrors.email = emailError
    if (passwordError) nextErrors.password = passwordError
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    try {
      await signUp(email, password)
      showToast({ message: 'Account created', type: 'success' })
      navigate('/onboarding', { replace: true })
    } catch (error) {
      showToast({ message: error.message || 'Could not sign up', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { email, password, errors, isSubmitting, setEmail, setPassword, handleSubmit }
}
