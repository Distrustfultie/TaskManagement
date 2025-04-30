export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-secondary/10 to-primary/10">
      <div className="text-center max-w-2xl p-8">
        <h1 className="text-4xl font-bold text-dark mb-4">
          Welcome to Efes Manager
        </h1>
        <p className="text-lg text-accent mb-8">
          Your ultimate task management solution with smart organization and tracking features.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="px-8 py-3 border-2 border-primary text-primary rounded-lg hover:border-accent hover:text-accent transition-colors"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
}