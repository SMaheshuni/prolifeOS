import { useState } from 'react'
import { Target } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import { Avatar, Button, Card, Skeleton } from '@/components/ui'
import { NumberRow, PairedNumberRow, SelectRow } from './ProfileFieldRow'
import { useProfile } from './profile.hooks'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/store/toastStore'
import { SEX_OPTIONS, ACTIVITY_LEVELS } from '@/utils/constants'

const sexOptions = SEX_OPTIONS.map((value) => ({ value, label: value }))
const activityOptions = ACTIVITY_LEVELS.map((value) => ({
  value,
  label: value.replace('_', ' '),
}))

export default function ProfilePage() {
  const { user } = useAuth()
  const {
    settings,
    isLoading,
    saveProfile,
    latestWeight,
    latestWeightUnit,
    maintenanceKcal,
    monthlyForecastKg,
  } = useProfile()
  const [isSaving, setIsSaving] = useState(false)

  const updateField = async (field, value) => {
    if (!settings) return
    setIsSaving(true)
    const result = await saveProfile({
      profile: { [field]: value },
      weight: '',
      weightUnit: settings.weight_unit || 'kg',
    })
    setIsSaving(false)
    return result
  }

  const updateWeight = async (next) => {
    if (!settings) return
    setIsSaving(true)
    const result = await saveProfile({
      profile: {},
      weight: next === null ? '' : String(next),
      weightUnit: settings.weight_unit || latestWeightUnit || 'kg',
    })
    setIsSaving(false)
    return result
  }

  const handleSetGoalFromMaintenance = async () => {
    if (!maintenanceKcal) return
    const next = Math.max(0, maintenanceKcal - 500)
    await updateField('daily_kcal_goal', next)
    showToast({ message: `Daily goal set to ${next} kcal`, type: 'success' })
  }

  const accountName = user?.email?.split('@')[0] || 'you'
  const memberLabel = user?.created_at
    ? `Member since ${new Date(user.created_at).getFullYear()}`
    : 'Member'

  return (
    <>
      <TopBar pageName="Profile" />
      <PageWrapper>
        {isLoading || !settings ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="flex flex-col gap-md">
            <Card className="!p-md">
              <div className="flex items-center gap-md">
                <Avatar name={accountName} size="md" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-display text-subheading font-medium text-text">
                    {accountName}
                  </span>
                  <span className="text-micro text-muted">{memberLabel}</span>
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-sm">
              <SelectRow
                label="Sex"
                value={settings.sex || ''}
                options={sexOptions}
                onCommit={(next) => updateField('sex', next)}
              />
              <NumberRow
                label="Age"
                value={settings.age}
                onCommit={(next) => updateField('age', next)}
              />
              <PairedNumberRow
                left={{
                  label: 'Weight',
                  value: latestWeight,
                  suffix: latestWeightUnit || settings.weight_unit || 'kg',
                  onCommit: updateWeight,
                }}
                right={{
                  label: 'Height',
                  value: settings.height_cm,
                  suffix: 'cm',
                  onCommit: (next) => updateField('height_cm', next),
                }}
              />
              <SelectRow
                label="Activity level"
                value={settings.activity_level || ''}
                options={activityOptions}
                onCommit={(next) => updateField('activity_level', next)}
              />
              <NumberRow
                label="Daily goal"
                value={settings.daily_kcal_goal}
                suffix="kcal"
                onCommit={(next) => updateField('daily_kcal_goal', next)}
              />
            </div>

            {maintenanceKcal !== null && (
              <Card className="!p-md">
                <div className="flex items-start justify-between gap-md">
                  <div className="flex flex-col gap-xs">
                    <span className="text-micro font-medium uppercase tracking-[0.18em] text-muted">
                      Maintenance
                    </span>
                    <span className="font-display text-heading font-bold text-text leading-none">
                      {maintenanceKcal}
                      <span className="ml-xs text-label text-muted">kcal</span>
                    </span>
                  </div>
                  {monthlyForecastKg !== null && (
                    <div className="flex flex-col items-end gap-xs">
                      <span className="text-micro font-medium uppercase tracking-[0.18em] text-muted">
                        Forecast
                      </span>
                      <span
                        className={`font-display text-heading font-bold leading-none ${
                          monthlyForecastKg <= 0 ? 'text-success' : 'text-warning'
                        }`}
                      >
                        {monthlyForecastKg > 0 ? '+' : ''}
                        {monthlyForecastKg.toFixed(1)}
                        <span className="ml-xs text-label text-muted">kg/mo</span>
                      </span>
                    </div>
                  )}
                </div>
                {settings.daily_kcal_goal && maintenanceKcal && (
                  <p className="mt-sm text-micro text-muted">
                    {maintenanceKcal - settings.daily_kcal_goal === 0
                      ? 'at maintenance'
                      : `${Math.abs(maintenanceKcal - settings.daily_kcal_goal)} kcal ${
                          settings.daily_kcal_goal < maintenanceKcal ? 'deficit' : 'surplus'
                        }`}
                  </p>
                )}
              </Card>
            )}

            {maintenanceKcal !== null && (
              <Button
                variant="primary"
                fullWidth
                leftIcon={<Target size={16} />}
                onClick={handleSetGoalFromMaintenance}
                isLoading={isSaving}
              >
                Set goal from profile · −500 kcal deficit
              </Button>
            )}
          </div>
        )}
      </PageWrapper>
    </>
  )
}
