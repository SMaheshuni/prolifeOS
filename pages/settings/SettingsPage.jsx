import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import { Card, Select, Skeleton, Toggle } from '@/components/ui'
import { useSettings } from './settings.hooks'
import { useThemeStore } from '@/store/themeStore'
import { WEIGHT_UNITS, DISTANCE_UNITS } from '@/utils/constants'

const weightUnitOptions = WEIGHT_UNITS.map((value) => ({ value, label: value }))
const distanceUnitOptions = DISTANCE_UNITS.map((value) => ({ value, label: value }))

export default function SettingsPage() {
  const { settings, isLoading, updateSettings } = useSettings()
  const setThemeMode = useThemeStore((state) => state.setMode)

  return (
    <>
      <TopBar pageName="Settings" />
      <PageWrapper>
        {isLoading || !settings ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Card>
            <div className="flex flex-col gap-md">
              <Select
                id="weight_unit"
                label="Weight unit"
                value={settings.weight_unit}
                onChange={(value) => updateSettings({ weight_unit: value })}
                options={weightUnitOptions}
              />
              <Select
                id="distance_unit"
                label="Distance unit"
                value={settings.distance_unit}
                onChange={(value) => updateSettings({ distance_unit: value })}
                options={distanceUnitOptions}
              />
              <Toggle
                label="Dark mode"
                checked={settings.theme === 'dark'}
                onChange={(checked) => {
                  const next = checked ? 'dark' : 'light'
                  setThemeMode(next)
                  updateSettings({ theme: next })
                }}
              />
            </div>
          </Card>
        )}
      </PageWrapper>
    </>
  )
}
