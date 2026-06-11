import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, SkipForward } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button, Card, Input, Select } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useOnboarding, markOnboardingComplete } from './onboarding.hooks'
import {
  WEIGHT_UNITS,
  DISTANCE_UNITS,
  SEX_OPTIONS,
  ACTIVITY_LEVELS,
} from '@/utils/constants'

const toOptions = (values) => values.map((value) => ({ value, label: value.replace('_', ' ') }))

const TOTAL_STEPS = 3

const StepIndicator = ({ step }) => (
  <div className="flex items-center gap-xs">
    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
      <span
        key={i}
        className={`h-1 flex-1 rounded-full ${i + 1 <= step ? 'bg-primary' : 'bg-border'}`}
      />
    ))}
  </div>
)

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { settings, saveStep, suggestKcalGoal } = useOnboarding()

  const [step, setStep] = useState(1)
  const [weightUnit, setWeightUnit] = useState('kg')
  const [distanceUnit, setDistanceUnit] = useState('km')
  const [sex, setSex] = useState('')
  const [age, setAge] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [activityLevel, setActivityLevel] = useState('')
  const [dailyKcalGoal, setDailyKcalGoal] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSkip = () => {
    if (user?.id) markOnboardingComplete(user.id)
    navigate('/home', { replace: true })
  }

  const goNext = async () => {
    setIsSubmitting(true)
    if (step === 1) {
      await saveStep({ weight_unit: weightUnit, distance_unit: distanceUnit })
      setStep(2)
    } else if (step === 2) {
      await saveStep({
        sex: sex || null,
        age: age === '' ? null : Number(age),
        height_cm: heightCm === '' ? null : Number(heightCm),
        activity_level: activityLevel || null,
      })
      const suggestion = suggestKcalGoal({
        sex: sex || null,
        age: age === '' ? null : Number(age),
        height_cm: heightCm === '' ? null : Number(heightCm),
        activity_level: activityLevel || null,
      })
      if (suggestion && dailyKcalGoal === '') setDailyKcalGoal(String(suggestion))
      setStep(3)
    } else {
      await saveStep({
        daily_kcal_goal: dailyKcalGoal === '' ? null : Number(dailyKcalGoal),
      })
      if (user?.id) markOnboardingComplete(user.id)
      navigate('/home', { replace: true })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-lg py-2xl">
      <div className="flex flex-col gap-lg">
        <StepIndicator step={step} />

        {step === 1 && (
          <>
            <div className="flex flex-col gap-xs">
              <h1 className="text-heading font-bold text-text">Choose your units</h1>
              <p className="text-body text-muted">You can change these later in Settings.</p>
            </div>
            <Card>
              <div className="flex flex-col gap-md">
                <Select
                  id="weight_unit"
                  label="Weight"
                  value={weightUnit}
                  onChange={setWeightUnit}
                  options={WEIGHT_UNITS.map((value) => ({ value, label: value }))}
                />
                <Select
                  id="distance_unit"
                  label="Distance"
                  value={distanceUnit}
                  onChange={setDistanceUnit}
                  options={DISTANCE_UNITS.map((value) => ({ value, label: value }))}
                />
              </div>
            </Card>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col gap-xs">
              <h1 className="text-heading font-bold text-text">About you</h1>
              <p className="text-body text-muted">
                Used to estimate your maintenance calories. All optional.
              </p>
            </div>
            <Card>
              <div className="flex flex-col gap-md">
                <div className="grid grid-cols-2 gap-md">
                  <Select
                    id="sex"
                    label="Sex"
                    value={sex}
                    onChange={setSex}
                    options={toOptions(SEX_OPTIONS)}
                    placeholder="—"
                  />
                  <Input
                    id="age"
                    label="Age"
                    type="number"
                    value={age}
                    onChange={setAge}
                    inputMode="numeric"
                  />
                </div>
                <Input
                  id="height_cm"
                  label="Height (cm)"
                  type="number"
                  value={heightCm}
                  onChange={setHeightCm}
                  inputMode="numeric"
                />
                <Select
                  id="activity_level"
                  label="Activity level"
                  value={activityLevel}
                  onChange={setActivityLevel}
                  options={toOptions(ACTIVITY_LEVELS)}
                  placeholder="—"
                />
              </div>
            </Card>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex flex-col gap-xs">
              <h1 className="text-heading font-bold text-text">Daily calorie goal</h1>
              <p className="text-body text-muted">
                Powers the calorie ring on Home. Pre-filled to maintenance − 500 kcal if we have enough info.
              </p>
            </div>
            <Card>
              <Input
                id="daily_kcal_goal"
                label="Daily goal (kcal)"
                type="number"
                value={dailyKcalGoal}
                onChange={setDailyKcalGoal}
                inputMode="numeric"
                placeholder="e.g. 1800"
              />
            </Card>
          </>
        )}

        <div className="flex flex-col gap-sm">
          <Button onClick={goNext} isLoading={isSubmitting} rightIcon={<ChevronRight size={18} />} fullWidth>
            {step === TOTAL_STEPS ? 'Finish' : 'Next'}
          </Button>
          <Button variant="ghost" onClick={handleSkip} leftIcon={<SkipForward size={16} />} fullWidth>
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  )
}
