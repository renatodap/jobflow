import Link from 'next/link';

export default function SimpleHeader() {
  return (
    <header className="bg-bg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-text-primary">Feel</span>
            <span className="text-xl font-bold text-navy ml-1">Sharper</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/today" className="text-text-secondary hover:text-text-primary transition-colors">
              Today
            </Link>
            <Link href="/food" className="text-text-secondary hover:text-text-primary transition-colors">
              Food
            </Link>
            <Link href="/workouts" className="text-text-secondary hover:text-text-primary transition-colors">
              Workouts
            </Link>
            <Link href="/weight" className="text-text-secondary hover:text-text-primary transition-colors">
              Weight
            </Link>
            <Link href="/insights" className="text-text-secondary hover:text-text-primary transition-colors">
              Insights
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              href="/sign-in" 
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}