# CODING_STANDARDS.md
> This file is universal. It applies to every project regardless of app type, tech stack, or team size.
> Read this before writing a single line of code.
> These rules do not change per project. They are the baseline contract for all development.
> If this file and a project-specific AI_CONTEXT.md conflict — AI_CONTEXT.md wins for project-specific decisions, this file wins for everything else.

---

## TABLE OF CONTENTS

1. [Philosophy](#1-philosophy)
2. [File & Folder Rules](#2-file--folder-rules)
3. [Naming Conventions](#3-naming-conventions)
4. [Code Style & Readability](#4-code-style--readability)
5. [Component Rules](#5-component-rules)
6. [Data Flow Rules](#6-data-flow-rules)
7. [State Management Rules](#7-state-management-rules)
8. [Imports & Dependencies](#8-imports--dependencies)
9. [Theme & Styling Rules](#9-theme--styling-rules)
10. [Uniformity Rules](#10-uniformity-rules)
11. [Typography Rules](#11-typography-rules)
12. [Color Rules](#12-color-rules)
13. [Spacing & Layout Rules](#13-spacing--layout-rules)
14. [Interaction & UX Rules](#14-interaction--ux-rules)
15. [Navigation Rules](#15-navigation-rules)
16. [Forms Rules](#16-forms-rules)
17. [Loading & Error States](#17-loading--error-states)
18. [Icons Rules](#18-icons-rules)
19. [Animation & Transitions](#19-animation--transitions)
20. [Data Formatting Rules](#20-data-formatting-rules)
21. [Comments & Documentation](#21-comments--documentation)
22. [How AI Should Behave](#22-how-ai-should-behave)

---

## 1. PHILOSOPHY

These are the core beliefs behind every rule in this document.

### Readability Over Cleverness
Code is written once and read hundreds of times. A junior developer, a new team member, or an AI reading this code six months from now should understand it immediately. Never write code to show off. Write code to communicate.

### One Thing, One Place
Every piece of logic has exactly one home. If you find yourself writing the same thing twice, something is wrong. If you find yourself unsure where something belongs, the structure is telling you it needs a clearer home.

### Predictability Over Flexibility
Consistent patterns are more valuable than clever abstractions. When every page, every component, every interaction follows the same pattern — the entire codebase becomes predictable. Predictable code is easy to debug, easy to extend, and easy to hand off to anyone including AI.

### UI is a Reflection of Logic
A messy codebase produces a messy UI. When the code is clean and structured, the product feels clean and structured. These are not separate concerns.

### Ask Before Inventing
If a rule does not exist for a situation, do not invent a pattern. Ask first, establish the rule, then implement. One undocumented pattern becomes five, then becomes chaos.

---

## 2. FILE & FOLDER RULES

### Core Rules
- One file = one responsibility. If you struggle to name a file, it is doing too much.
- No file should duplicate what another file already does.
- Files should be findable by someone who has never seen the project before.
- Split a component into its own file ONLY when it is reused in 2 or more places, or when it is genuinely complex enough to warrant isolation.
- Do not create a file speculatively. Only create files when they are needed now.

### Folder Depth
- Maximum 3 levels deep inside `/src`. Any deeper and the structure is too complex.
- Group by feature, not by type. Tasks-related files live together, not scattered across a `/components` folder and a `/hooks` folder and a `/utils` folder.

### File Size
- There is no strict line limit, but if a file is becoming hard to scan, ask whether it has taken on a second responsibility.
- A file that handles both UI layout and data fetching is always wrong regardless of its length.
- A file that is purely complex UI logic may be long and that is acceptable.

### Dead Code
- Never leave commented-out code in committed files.
- Never leave unused imports.
- Never leave console.log statements in committed code.
- If code might be needed later, delete it — version control exists for a reason.

---

## 3. NAMING CONVENTIONS

Names should be honest. A name should tell you exactly what something is or does without needing to open the file.

### Files
| Type | Convention | Example |
|---|---|---|
| Page component | PascalCase | `TasksPage.jsx` |
| Sub-component | PascalCase | `TaskItem.jsx` |
| Hooks file | camelCase + .hooks.js | `tasks.hooks.js` |
| Service file | camelCase + .service.js | `tasks.service.js` |
| Zustand store | camelCase + Store.js | `authStore.js` |
| Utility file | camelCase | `dateHelpers.js` |
| Constants file | camelCase | `constants.js` |
| Style/theme file | camelCase | `theme.js` |

### Variables & Functions
| Type | Convention | Example |
|---|---|---|
| Variables | camelCase | `userWeight` |
| Functions | camelCase, verb-first | `getUserTasks()`, `addTask()`, `deleteGoal()` |
| Booleans | is / has / can prefix | `isLoading`, `hasError`, `canEdit` |
| Constants | UPPER_SNAKE_CASE | `MAX_WEIGHT_ENTRIES`, `DEFAULT_CHALLENGE_DAYS` |
| Event handlers | handle prefix | `handleSubmit`, `handleDelete`, `handleToggle` |
| Async functions | Clearly named, no abbreviations | `fetchUserGoals()` not `getG()` |

### Components
| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `GoalCard`, `WeightInput` |
| Props | camelCase | `onDelete`, `isVisible`, `taskId` |
| Custom hooks | use prefix | `useTasks`, `useAuth`, `useSync` |

### Database
| Type | Convention | Example |
|---|---|---|
| Table names | snake_case, plural | `daily_checkins`, `meal_plans` |
| Column names | snake_case | `created_at`, `user_id`, `is_completed` |
| Foreign keys | referenced_table_id | `user_id`, `goal_id` |

### Do Not
- Abbreviate unless the abbreviation is universally understood (id, url, api are fine — usr, tmp, val are not)
- Use single letter variable names outside of short loop indices
- Name something `data`, `info`, `stuff`, `thing`, `temp`
- Name a function `handleData` or `processInfo` — be specific about what data and what info

---

## 4. CODE STYLE & READABILITY

### General
- Write for humans first, machines second.
- Shorter is not always better. Clear is always better.
- If you need to think hard to understand a line of code, rewrite it.
- Favour explicit over implicit.

### Functions
- A function should do one thing only.
- If a function needs a comment to explain what it does, rename it until it does not.
- Maximum 3 parameters. If you need more, pass an object.
- Keep functions short. If you cannot see the entire function on screen, consider splitting it.

```js
// WRONG — unclear, multiple responsibilities
const process = (d, t, f) => {
  const x = d.filter(i => i.t === t)
  if (f) return x.sort()
  return x
}

// CORRECT — clear, single responsibility, readable
const filterTasksByType = ({ tasks, type, shouldSort = false }) => {
  const filtered = tasks.filter(task => task.type === type)
  return shouldSort ? filtered.sort(sortByCreatedAt) : filtered
}
```

### Conditionals
- Avoid nested ternaries — they are always unreadable.
- Prefer early returns over deeply nested if/else blocks.
- Name complex conditions as booleans before using them.

```js
// WRONG
const label = isComplete ? isDue ? 'Overdue' : 'Done' : isPending ? 'Pending' : 'Unknown'

// CORRECT
if (isComplete && isDue) return 'Overdue'
if (isComplete) return 'Done'
if (isPending) return 'Pending'
return 'Unknown'
```

### Async / Await
- Always use async/await. Never mix with .then().catch() in the same file.
- Always wrap async calls in try/catch.
- Always handle the error case — never silently ignore it.

```js
// CORRECT
const loadTasks = async () => {
  try {
    const tasks = await tasksService.getAll(userId)
    setTasks(tasks)
  } catch (error) {
    showToast({ message: 'Failed to load tasks', type: 'error' })
  }
}
```

---

## 5. COMPONENT RULES

### What a Component Is Responsible For
- Receiving props
- Rendering UI
- Calling event handlers passed via props
- Local UI state only (open/closed, focused, hovered)

### What a Component Is NOT Responsible For
- Fetching data
- Writing to the database
- Business logic
- Formatting data (that belongs in formatters.js)
- Global state management

### Props
- Always destructure props at the top of the component.
- Always define PropTypes or TypeScript types (whichever the project uses).
- Never pass more than 5 props without considering whether to pass an object instead.
- Never pass a raw database object as a prop — shape it before passing.

### Component Structure — Always in This Order
```jsx
// 1. Imports
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { formatDate } from '@/utils/formatters'

// 2. Component definition
export default function TaskItem({ task, onDelete, onToggle }) {

  // 3. Local state
  const [isExpanded, setIsExpanded] = useState(false)

  // 4. Derived values
  const formattedDate = formatDate(task.createdAt)
  const isOverdue = task.dueDate < Date.now() && !task.isCompleted

  // 5. Event handlers
  const handleDelete = () => onDelete(task.id)
  const handleToggle = () => onToggle(task.id)

  // 6. Render
  return (
    <div>
      ...
    </div>
  )
}
```

### Never Do This
```jsx
// WRONG — data fetching inside a component
export default function TaskItem({ taskId }) {
  const [task, setTask] = useState(null)

  useEffect(() => {
    supabase.from('tasks').select().eq('id', taskId).then(...)
  }, [taskId])
}

// WRONG — business logic inside a component
export default function GoalCard({ goal }) {
  const progress = (goal.current / goal.target) * 100
  const daysLeft = Math.ceil((goal.deadline - Date.now()) / 86400000)
  const isAtRisk = progress < (daysLeft / goal.totalDays) * 100
  // This belongs in a hook or utility
}
```

---

## 6. DATA FLOW RULES

This is the most important structural rule in the entire document.

### The Flow — Always in This Direction
```
service.js
    ↓ handles all database operations (local + cloud)
hooks.js
    ↓ calls service, manages loading/error state, exposes clean data
Page.jsx
    ↓ calls hook, passes data down as props
Item / Card / Form components
    ↓ receive props only — no data fetching ever
```

### service.js Responsibilities
- All Dexie (local DB) reads and writes
- All Supabase (cloud DB) reads and writes
- Offline-first logic: write local first, then sync to cloud
- Returns plain data objects — never returns Supabase or Dexie response objects directly

### hooks.js Responsibilities
- Calls service functions
- Manages loading state (`isLoading`)
- Manages error state (`error`)
- Manages local component-level data state
- Exposes clean, shaped data to the page
- Never contains raw database calls

### Page.jsx Responsibilities
- Calls hooks
- Handles layout
- Passes data and callbacks to child components
- Never contains database calls
- Never contains complex business logic

### Example
```js
// tasks.service.js
export const tasksService = {
  getAll: async (userId) => {
    const local = await db.tasks.where('userId').equals(userId).toArray()
    return local
  },
  add: async (task) => {
    const id = await db.tasks.add(task)
    syncToCloud('tasks', task) // background, non-blocking
    return id
  }
}

// tasks.hooks.js
export const useTasks = () => {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await tasksService.getAll(user.id)
        setTasks(data)
      } catch {
        showToast({ message: 'Could not load tasks', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user.id])

  const addTask = async (task) => {
    await tasksService.add({ ...task, userId: user.id })
    setTasks(prev => [...prev, task])
  }

  return { tasks, isLoading, addTask }
}

// TasksPage.jsx
export default function TasksPage() {
  const { tasks, isLoading, addTask } = useTasks()
  return (
    <PageWrapper>
      {isLoading ? <Spinner /> : tasks.map(task => <TaskItem key={task.id} task={task} />)}
    </PageWrapper>
  )
}
```

---

## 7. STATE MANAGEMENT RULES

### When to Use What
| Situation | Use |
|---|---|
| UI state (open/closed, focused) | `useState` in that component |
| Page-level data (tasks list, form values) | `useState` in Page + custom hook |
| Auth state (current user, session) | Zustand global store |
| Sync state (online/offline, pending) | Zustand global store |
| Cross-page shared data | Zustand global store |
| Server/DB data | Custom hook via service |

### Rules
- Do not put everything in global state. Default to local state first.
- Global state (Zustand) is only for data that genuinely needs to be shared across multiple unrelated pages.
- Never derive state from state. Compute derived values from existing state on the fly.
- Never duplicate state. If tasks exist in the hook, do not also store them in a global store.

---

## 8. IMPORTS & DEPENDENCIES

### Import Order — Always This Sequence
```js
// 1. React and React-related
import { useState, useEffect } from 'react'

// 2. External libraries
import { format } from 'date-fns'
import { Trash2, Plus } from 'lucide-react'

// 3. Internal components
import { Button, Card, Modal } from '@/components/ui'
import Header from '@/components/layout/Header'

// 4. Hooks, services, utils
import { useTasks } from './tasks.hooks'
import { formatDate } from '@/utils/formatters'
import { theme } from '@/styles/theme'
```

### Dependencies
- Do not install a new library to solve a problem that can be solved with 10 lines of code.
- Do not install two libraries that do the same thing.
- Every new library must be flagged and justified before installation.
- Check bundle size impact before installing anything.
- Prefer libraries already in the project over adding new ones.

---

## 9. THEME & STYLING RULES

### The Single Source of Truth
All visual values — colors, font sizes, font weights, spacing, border radius — live in one file: `theme.js`.

Nothing is hardcoded anywhere else. Ever.

### theme.js Must Contain
- Font family
- Font size scale
- Font weight scale
- Color palette (with semantic names)
- Spacing scale
- Border radius scale
- Shadow scale
- Z-index scale
- Transition duration and easing

### Tailwind
- Use Tailwind utility classes for all styling.
- Map Tailwind classes to theme values — do not use arbitrary values like `w-[347px]` or `text-[13px]`.
- If you find yourself using an arbitrary value, add it to the theme scale instead.
- No custom CSS files unless absolutely unavoidable (e.g. a third-party library override).
- No inline `style={{}}` attributes. If you are using inline styles, you are doing it wrong.

### Dark Mode
- If the project supports dark mode, define both light and dark values in theme.js.
- Use Tailwind's `dark:` prefix consistently — never conditional inline styles for dark mode.

---

## 10. UNIFORMITY RULES

The user experience must feel like one single product, not a collection of pages built by different people at different times.

### The Test
Before shipping any UI, ask: if someone landed on this page without context, would it feel like it belongs to the same app as every other page? If the answer is uncertain, something is not uniform.

### What Must Be Uniform Across Every Page
- Font family — one, always
- Page padding — same left and right on every page
- Header — same component, same height, same structure
- Bottom navigation — same component, always visible
- Card style — same border radius, same shadow, same padding
- Button style — same for same action type across all pages
- Icon size — same for equivalent contexts across all pages
- Empty state — same component, same visual style
- Loading state — same skeleton/spinner pattern
- Error feedback — same toast style
- Success feedback — same toast style
- Section spacing — same gap between sections on all pages
- Form layout — same structure on all pages

---

## 11. TYPOGRAPHY RULES

Up to **two** font families: one body sans + (optionally) one display serif. Both defined once in theme.js. Never override anywhere else. Never add a third family.

### Type Scale — Use Only These Roles
| Role | Size (default) | Weight | Family | Usage |
|---|---|---|---|---|
| display | 32-48px | Bold | Display | Page titles, hero numbers (calorie ring, weight, streak) |
| heading | 24-32px | Bold | Display | Section titles inside cards |
| subheading | 18px | Medium | Body | Card titles, list group headers |
| body | 16px | Regular | Body | All content, descriptions, paragraphs |
| label | 14px | Medium | Body | Form labels, captions, secondary info |
| micro | 12px | Regular | Body | Timestamps, hints, badges |

### Rules
- Never use a font size outside this scale.
- Never use a font weight outside Regular / Medium / Bold.
- Display family is restricted to `display` and `heading` roles only — body family for everything else.
- If a project chooses to use only one family, body family is used everywhere.
- Never use italic unless it is for a specific semantic purpose (e.g. quotes).
- Never use ALL CAPS for anything other than badge labels.
- Line height: 1.5 for body text, 1.2 for headings. Do not change these.
- Letter spacing: default for body, slightly wider for micro text only.

---

## 12. COLOR RULES

Colors communicate meaning. They are never used for decoration or variety.

### Required Semantic Colors
| Name | Meaning | Never Use For |
|---|---|---|
| primary | Main actions, active states, key progress | Backgrounds, large areas |
| success | Completion, positive outcomes | Warnings, errors |
| warning | Attention needed, at risk | Errors, completion |
| danger | Destructive actions, errors, negative | General UI |
| background | Page background | Cards, interactive elements |
| surface | Cards, modals, sheets | Page background |
| text | Primary content text | Muted content |
| muted | Secondary text, placeholders, inactive | Primary content |
| border | Dividers, input borders | Text, backgrounds |

### Rules
- Every color used in the app must come from the semantic palette above.
- Do not add colors to make a page "more interesting." Use layout and typography for that.
- Do not use the primary color as a background for large areas.
- Danger color is only for destructive actions and errors — never for emphasis.
- Opacity variants of semantic colors are allowed (e.g. primary at 10% opacity for a subtle background).

---

## 13. SPACING & LAYOUT RULES

### Spacing Scale — Use Only These Values
| Token | Value | Usage |
|---|---|---|
| xs | 4px | Tight gaps between related elements |
| sm | 8px | Gaps between list items, icon + label |
| md | 16px | Internal card padding, section gaps |
| lg | 24px | Page horizontal padding, section spacing |
| xl | 32px | Major section breaks |
| 2xl | 48px | Hero spacing, large empty areas |

### Page Layout Rules
- Every page has the same horizontal padding — defined once in PageWrapper.jsx.
- Every page has the same top padding below the header.
- Never hardcode pixel values for spacing — always use the scale.
- Content never touches the edges of the screen.
- Bottom navigation always has safe-area padding on iOS.

### Grid & Alignment
- Prefer flexbox for component-level layout, CSS grid for page-level layout.
- Align everything to the spacing grid — nothing should feel randomly placed.
- Consistent alignment: text left-aligned in lists, centered in empty states and confirmation modals.

---

## 14. INTERACTION & UX RULES

Every user action maps to exactly one interaction pattern. This mapping never changes.

### Interaction Map
| User Action | Always Use | Never Use |
|---|---|---|
| Add a new item | BottomSheet slides up | Full page, Modal |
| Edit an existing item | Same BottomSheet, pre-filled | Inline editing (unless explicitly defined per project) |
| Delete an item | Modal with confirm button | Instant delete, swipe-only |
| Toggle a setting on/off | Toggle switch, instant, no confirm | Modal, BottomSheet |
| Submit a form | Primary Button at bottom of form | Floating button, auto-submit |
| Dismiss / cancel | Tap outside or X icon top-right | Back button only |
| Acknowledge success | Toast, auto-dismiss after 2s | Modal, alert, inline message |
| Acknowledge error | Toast, red, auto-dismiss after 3s | Modal (unless error requires action) |
| Confirm destructive action | Modal with clearly labelled danger button | Toast, auto-confirm |
| View item details | BottomSheet or new page (per project spec) | Inline expand |

### Feedback Rules
- Every user action must produce visible feedback within 100ms.
- Never leave the user wondering if their action was registered.
- Disable buttons while their action is processing — always.
- Re-enable and show result (success toast or error toast) when done.
- Never show a success message before the action is confirmed complete.

### Touch Targets
- Minimum touch target size: 44x44px — no exceptions.
- Spacing between adjacent touch targets: minimum 8px.
- Never place destructive actions adjacent to frequently used actions.

---

## 15. NAVIGATION RULES

### Bottom Navigation
- Always visible — never hidden on scroll.
- Maximum 5 tabs.
- Tapping an active tab scrolls the page to top.

Two acceptable styles — pick one per project, do not mix:

**Standard tab bar** *(default)*
- Full-width, fixed to the bottom edge.
- Active tab: filled icon + primary color label.
- Inactive tab: outline icon + muted color label.
- Icon + label always — never icon alone in this style.

**Pill dock** *(modern alternative)*
- Floating: pill-shaped, centered, hovering 8-16px above the bottom safe-area inset.
- Icon-only — no labels (acceptable in this style only).
- Active tab: primary-color background fill behind the icon (or icon swap to filled variant).
- Inactive tab: muted icon, transparent background.
- Use only when the project visual language is intentionally playful / modern (not for utilitarian apps).

**Wheel dock** *(radial alternative)*
- Floating circular widget — icons arranged on the circumference of a circle.
- Active tab is positioned at the top (12 o'clock).
- Tapping a non-active icon rotates the wheel so the tapped icon moves to the top, AND triggers the project's defined page transition (see §19).
- Icon-only; same rules as pill dock about no labels.
- Most expressive of the three — use only when the project explicitly opts in to a non-utilitarian visual language and has defined a page transition.

### Header
- Every page uses the same Header component.
- Title: left-aligned, heading size, bold.
- Optional single action: right-aligned icon button.
- Never more than one action in the header.
- Never put navigation elements in the header (back button is automatic on sub-pages).

### Sub-pages (detail views, settings sub-sections)
- Back button: top left, always a chevron-left icon.
- Page title: centered or left-aligned — consistent per project.
- Never use a different back button style on different pages.

### Transitions
- Page transitions: instant by default. A project may opt-in to ONE consistent page-transition pattern (e.g., a circular reveal from the tap origin) and apply it uniformly across every navigation. Per-page custom transitions remain forbidden.
- BottomSheet: slides up, same easing and duration always.
- Modal: fades in, same easing and duration always.
- Do not add custom transitions to individual pages.

---

## 16. FORMS RULES

Every form in the application follows this structure exactly.

### Layout
1. Form title (if inside a BottomSheet — subheading size)
2. Fields in logical order (most important first)
3. Primary action button at the bottom
4. Optional cancel / secondary action below primary button

### Individual Fields
- Label always above the input — never placeholder-only
- Placeholder text always in muted color
- Error message always below the input in danger color
- Required fields always marked with an asterisk after the label
- Input height consistent across all forms
- Input border: default muted, focused primary, error danger

### Behaviour
- Validate on submit, not on every keystroke (unless real-time feedback is clearly needed)
- Show all errors at once after failed submit — do not reveal one at a time
- Disable submit button while submitting
- After successful submit: dismiss form + show success toast
- After failed submit: keep form open + show error toast + highlight field errors
- Keyboard opens: form scrolls up so active input is visible
- Auto-focus first input when form opens

### Never
- Submit a form on Enter without a submit button
- Clear a form silently on error
- Show a success message while the form is still visible

---

## 17. LOADING & ERROR STATES

Every data-dependent view must handle three states: loading, error, and empty.

### Loading
| Context | Pattern |
|---|---|
| Full page first load | Skeleton screen that matches the layout |
| List refreshing | Subtle indicator, does not block content |
| Button action | Spinner inside the button, button disabled |
| Chart loading | Skeleton that matches chart dimensions |
| Image loading | Blurred placeholder or skeleton |

### Error States
- Network error: Toast + retry option where appropriate
- Auth error: Redirect to login
- Not found: EmptyState with clear message
- Validation error: Inline field error + form-level toast
- Never show raw error messages to the user — always translate to plain language

### Empty States
- Every list, chart, and calendar view must have an empty state
- Empty state always uses the EmptyState component — never ad hoc text
- Empty state includes: icon, title, description, optional action button
- Empty state copy should be helpful — tell the user what to do, not just that nothing is there

---

## 18. ICONS RULES

### Library
- One icon library per project — defined in AI_CONTEXT.md.
- Never mix icon libraries.
- Never use emoji as icons in UI.
- Never use custom SVG icons unless the required icon genuinely does not exist in the library.

### Sizes
| Context | Size |
|---|---|
| Bottom navigation | 24px |
| Header action | 22px |
| Inline with text | 18px |
| Inside badge or tag | 14px |
| Micro / hint | 12px |

### Semantic Consistency
The same icon always means the same thing. Never reuse an icon for two different meanings.

| Action | Icon (Lucide) |
|---|---|
| Add / create | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Close / dismiss | `X` |
| Back | `ChevronLeft` |
| Forward | `ChevronRight` |
| Settings | `Settings` |
| Done / confirm | `Check` |
| Warning | `AlertTriangle` |
| Info | `Info` |
| Search | `Search` |
| Filter | `SlidersHorizontal` |
| Calendar | `Calendar` |
| User / profile | `User` |

---

## 19. ANIMATION & TRANSITIONS

### Rules
- Animation has a purpose — it communicates state change, not decoration.
- One easing curve and one base duration for the entire app — defined in theme.js.
- BottomSheet always slides up from the bottom, same speed every time.
- Modal always fades in, same speed every time.
- Never add unique animations to individual pages or components.
- Page navigation is instant — no slide or fade transitions between pages.
- Skeleton screens fade in content smoothly — no jarring appearance.

### Acceptable Uses
- BottomSheet open/close
- Modal appear/dismiss
- Toast appear/dismiss
- Progress bar fill
- Toggle switch state change
- Skeleton to content transition

### Never
- Spin elements for decoration
- Animate list items on scroll
- Use bounce or elastic easing
- Add parallax effects
- Auto-play any animation that the user did not trigger

---

## 20. DATA FORMATTING RULES

All data formatting is centralised. Never format data inline inside a component.

### formatters.js Must Handle
- Date formatting — one format per context, consistent everywhere
- Time formatting
- Number formatting (with locale)
- Weight with unit (from user settings)
- Distance with unit
- Percentage display
- Currency (if applicable)
- Relative time ("2 hours ago", "yesterday")
- Duration (minutes to "1h 30m")

### Rules
```js
// WRONG — inline formatting
<p>{new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>

// CORRECT — through formatters
import { formatDate } from '@/utils/formatters'
<p>{formatDate(task.createdAt)}</p>
```

### Date Formats — Pick One Per Context, Never Deviate
| Context | Format | Example |
|---|---|---|
| Short date | DD Mon | 5 May |
| Full date | Day, DD Mon YYYY | Mon, 5 May 2025 |
| Time | HH:MM | 14:30 |
| Relative | Natural language | 2 hours ago |
| Calendar label | Mon DD | Mon 5 |

---

## 21. COMMENTS & DOCUMENTATION

### When to Comment
- Non-obvious business logic that would take more than 30 seconds to understand
- A deliberate workaround for a known bug or limitation
- Complex algorithm or calculation
- A decision that might seem wrong but is intentional

### When NOT to Comment
- Obvious code
- What the code does (the code says what — comments say why)
- Every function by default
- TODO comments (fix it now or create a ticket)

### Comment Style
```js
// WRONG — states the obvious
// Get all tasks
const tasks = await tasksService.getAll(userId)

// WRONG — vague
// Fix for weird bug
setTimeout(() => setVisible(true), 100)

// CORRECT — explains the why
// Supabase RLS requires user_id on insert even though it's in the JWT.
// Omitting it causes a policy violation on the server.
const task = { ...newTask, user_id: user.id }

// CORRECT — explains the non-obvious decision
// Delay gives the BottomSheet animation time to complete before
// focusing the input, preventing a scroll jump on iOS.
setTimeout(() => inputRef.current?.focus(), 300)
```

---

## 22. HOW AI SHOULD BEHAVE

This section defines how an AI assistant must operate when working on any codebase that uses this standards file.

### Before Any Change
1. Read `AI_CONTEXT.md` for project-specific rules.
2. Read this file (`CODING_STANDARDS.md`) for universal rules.
3. Identify the exact file(s) that need to change.
4. State which file you are editing and why before writing any code.
5. Check if a component, hook, or utility already exists before creating a new one.
6. Confirm the change does not violate any rule in either document.

### Making the Change
- Change only what was asked. Nothing more.
- One file at a time. Label each file clearly before showing its code.
- Follow all naming conventions without exception.
- Reuse existing components — never create a parallel version.
- Follow the data flow: service → hook → page → component.
- All values through theme.js — no hardcoded colours, sizes, or spacing.
- Do not add comments to lines that are already obvious.
- Do not refactor unrelated code while making a change.

### After the Change
- State exactly what was changed and in which file.
- State if any other files need to be updated as a consequence.
- Tell the user specifically what to test to verify the change is working.
- If the change has a visual effect, describe what it should look like.

### When Unsure
- Do not guess. Do not invent a pattern. Ask first.
- If two rules seem to conflict, flag it — do not resolve it unilaterally.
- If the request would require violating a rule in this document, say so and propose an alternative.

### Absolute Prohibitions
- Never touch files unrelated to the request.
- Never install a new library without flagging it and getting confirmation.
- Never create a component that already exists under a different name.
- Never put data logic inside a UI component.
- Never hardcode a value that belongs in theme.js.
- Never invent a new interaction pattern not defined in this document or AI_CONTEXT.md.
- Never leave console.log, commented-out code, or unused imports in committed code.
- Never show a raw database error message to the user.
- Never assume. State what you are about to do, do it, then report what you did.

---

*This file is the universal development constitution.
It does not change per project.
It is the baseline every project inherits.*
