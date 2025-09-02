import Link from 'next/link'
import Logo from '../ui/Logo'

const navigation = {
  main: [
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Newsletter', href: '/newsletter' },
    { name: 'Privacy', href: '/privacy' },
  ],
  categories: [
    { name: 'Sleep', href: '/blog?category=sleep' },
    { name: 'Energy', href: '/blog?category=energy' },
    { name: 'Focus', href: '/blog?category=focus' },
    { name: 'Libido', href: '/blog?category=libido' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-brand-navy" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="text-white">
              <Logo className="text-white hover:text-brand-amber" />
            </div>
            <p className="text-sm leading-6 text-brand-gray-300 max-w-md">
              Most men drift through life accepting mediocrity as inevitable. Feel Sharper rejects this. 
              We believe peak performance isn't about hacks or shortcuts—it's about understanding your body's fundamentals.
            </p>
            <div className="flex space-x-6">
              {/* Social links would go here if needed */}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Navigate</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.main.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 text-brand-gray-300 hover:text-brand-amber transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Categories</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.categories.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 text-brand-gray-300 hover:text-brand-amber transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-brand-gray-700 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-xs leading-5 text-brand-gray-400">
              &copy; {new Date().getFullYear()} Feel Sharper. Built for men who refuse mediocrity.
            </p>
            <p className="mt-4 md:mt-0 text-xs leading-5 text-brand-gray-400">
              No fluff. No hype. Just results.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
