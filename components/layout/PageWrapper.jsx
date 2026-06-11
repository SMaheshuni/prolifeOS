// Page wrapper — horizontal padding, bottom-nav clearance, and enough
// top padding to clear the fixed 44 px TopBar plus iOS safe-area inset.
// Every authenticated page renders inside this.

export default function PageWrapper({ children }) {
  return (
    <main className="page-clear-top mx-auto flex w-full max-w-md flex-1 flex-col px-lg pb-32">
      {children}
    </main>
  )
}
