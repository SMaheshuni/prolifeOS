import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button, Card, EmptyState, ProgressBar, Skeleton, Tabs } from '@/components/ui'
import { useChartsData } from './charts.hooks'
import { formatPercent } from '@/utils/formatters'

const STROKE_PRIMARY = 'var(--lifeos-color-primary)'
const STROKE_SUCCESS = 'var(--lifeos-color-success)'

const RANGE_TABS = [
  { id: 7, label: '7d' },
  { id: 30, label: '30d' },
  { id: 90, label: '90d' },
]

const ChartSection = ({ title, children, isEmpty, emptyDescription }) => (
  <Card>
    <div className="flex flex-col gap-md">
      <h3 className="text-subheading font-medium text-text">{title}</h3>
      {isEmpty ? (
        <EmptyState icon={BarChart3} title="No data yet" description={emptyDescription} />
      ) : (
        children
      )}
    </div>
  </Card>
)

export default function ChartsPage() {
  const navigate = useNavigate()
  const [range, setRange] = useState(30)
  const { isLoading, weightSeries, moodSeries, taskCompletion, activitySeries, goalProgress } =
    useChartsData(range)

  return (
    <>
      <TopBar pageName="Charts" />
      <PageWrapper>
        <div className="flex flex-col gap-md">
          <Tabs
            tabs={RANGE_TABS.map((t) => ({ id: t.id, label: t.label }))}
            activeId={range}
            onChange={setRange}
          />

          {isLoading ? (
            <div className="flex flex-col gap-md">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-md">
              <ChartSection
                title="Weight"
                isEmpty={weightSeries.length === 0}
                emptyDescription="Log a check-in to see weight trends"
              >
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightSeries}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={STROKE_PRIMARY}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartSection>

              <ChartSection
                title="Mood"
                isEmpty={moodSeries.length === 0}
                emptyDescription="Log a mood in your check-in to see trends"
              >
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodSeries}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={[0, 5]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={STROKE_SUCCESS}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartSection>

              <Card>
                <div className="flex flex-col gap-md">
                  <h3 className="text-subheading font-medium text-text">Task completion</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-heading font-bold text-text">
                      {formatPercent(taskCompletion.rate)}
                    </span>
                    <span className="text-label text-muted">
                      {taskCompletion.completed} / {taskCompletion.total}
                    </span>
                  </div>
                  <ProgressBar value={taskCompletion.completed} max={taskCompletion.total || 1} />
                </div>
              </Card>

              <ChartSection
                title="Activity minutes"
                isEmpty={activitySeries.every((point) => point.value === 0)}
                emptyDescription="Log an activity to see your weekly minutes"
              >
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activitySeries}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="value" fill={STROKE_PRIMARY} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartSection>

              <Card>
                <div className="flex flex-col gap-md">
                  <h3 className="text-subheading font-medium text-text">Goal progress</h3>
                  {goalProgress.length === 0 ? (
                    <EmptyState
                      icon={BarChart3}
                      title="No goals yet"
                      description="Add a goal to track progress here"
                    />
                  ) : (
                    <ul className="flex flex-col gap-sm">
                      {goalProgress.map((entry) => (
                        <li key={entry.title} className="flex flex-col gap-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-label font-medium text-text">{entry.title}</span>
                            <span className="text-micro text-muted">{formatPercent(entry.rate)}</span>
                          </div>
                          <ProgressBar value={entry.current} max={entry.target} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  )
}
