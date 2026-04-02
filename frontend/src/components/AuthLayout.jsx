function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <h1 className="font-display text-2xl font-bold text-ink-900">{title}</h1>
        <p className="mb-6 mt-1 text-ink-500">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;