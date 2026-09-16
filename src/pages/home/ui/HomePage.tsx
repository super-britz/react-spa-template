import { useState } from 'react'
import { useDocumentTitle } from '@/shared/lib'
import { PostListWidget } from '@/widgets/post-list'

import heroImg from './hero.png'
import reactLogo from './react.svg'
import viteLogo from './vite.svg'

const links = [
  {
    href: 'https://vite.dev/',
    label: 'Explore Vite',
    img: viteLogo,
  },
  {
    href: 'https://react.dev/',
    label: 'Learn React',
    img: reactLogo,
  },
]

const socials = [
  { href: 'https://github.com/vitejs/vite', label: 'GitHub' },
  { href: 'https://chat.vite.dev/', label: 'Discord' },
  { href: 'https://x.com/vite_js', label: 'X.com' },
  { href: 'https://bsky.app/profile/vite.dev', label: 'Bluesky' },
]

export function HomePage() {
  const [count, setCount] = useState(0)
  useDocumentTitle('React SPA Template')

  return (
    <main className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-6 px-5 py-8">
      <div className="relative">
        <img
          src={heroImg}
          alt=""
          className="relative z-0 mx-auto w-[170px]"
          width="170"
          height="179"
        />
        <img
          src={reactLogo}
          alt="React logo"
          className="absolute top-[34px] left-1/2 z-10 h-7 -translate-x-1/2 [transform:perspective(2000px)_rotateZ(300deg)_rotateX(44deg)_rotateY(39deg)_scale(1.4)]"
        />
        <img
          src={viteLogo}
          alt="Vite logo"
          className="absolute top-[107px] left-1/2 z-0 h-6.5 -translate-x-1/2 [transform:perspective(2000px)_rotateZ(300deg)_rotateX(40deg)_rotateY(39deg)_scale(0.8)]"
        />
      </div>

      <div>
        <h1 className="my-8 font-medium text-4xl text-gray-900 tracking-tight md:my-5 dark:text-gray-100">
          React SPA Template
        </h1>
        <p>
          Edit{' '}
          <code className="rounded bg-gray-100 px-2 py-1 font-mono text-[15px] text-gray-900 dark:bg-gray-800 dark:text-gray-100">
            src/pages/home/ui/HomePage.tsx
          </code>{' '}
          and save to test{' '}
          <code className="rounded bg-gray-100 px-2 py-1 font-mono text-[15px] text-gray-900 dark:bg-gray-800 dark:text-gray-100">
            HMR
          </code>
        </p>
      </div>

      <button
        type="button"
        className="mb-6 rounded-md border-2 border-transparent bg-accent-soft px-2.5 py-1.5 font-mono text-accent text-base transition-colors duration-300 hover:border-accent-strong focus-visible:outline-2 focus-visible:outline-accent"
        onClick={() => setCount((currentCount) => currentCount + 1)}
      >
        Count is {count}
      </button>

      <section className="flex w-full flex-1 flex-col border-gray-200 border-t text-left md:flex-row dark:border-gray-700">
        <div className="flex-1 p-8 max-md:text-center">
          <svg className="mb-4 size-5.5 max-md:mx-auto" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon" />
          </svg>
          <h2 className="mb-2 font-medium text-2xl text-gray-900 dark:text-gray-100">
            Documentation
          </h2>
          <p>Your questions, answered</p>
          <ul className="mt-8 flex list-none flex-wrap gap-2 p-0">
            {links.map((link) => (
              <li key={link.href} className="flex basis-full md:basis-auto">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-100/50 px-3 py-1.5 text-base text-gray-900 no-underline transition-shadow duration-300 hover:shadow-lg md:w-auto dark:bg-gray-800/50 dark:text-gray-100"
                >
                  <img src={link.img} alt="" className="h-4.5" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 border-gray-200 border-t p-8 max-md:text-center md:border-t-0 md:border-l dark:border-gray-700">
          <svg className="mb-4 size-5.5 max-md:mx-auto" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon" />
          </svg>
          <h2 className="mb-2 font-medium text-2xl text-gray-900 dark:text-gray-100">
            Connect with us
          </h2>
          <p>Join the Vite community</p>
          <ul className="mt-8 flex list-none flex-wrap justify-center gap-2 p-0 md:justify-start">
            {socials.map((social) => (
              <li key={social.href} className="flex basis-[calc(50%-8px)] md:basis-auto">
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-100/50 px-3 py-1.5 text-base text-gray-900 no-underline transition-shadow duration-300 hover:shadow-lg md:w-auto dark:bg-gray-800/50 dark:text-gray-100"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex w-full flex-col gap-4 border-gray-200 border-t p-8 text-left dark:border-gray-700">
        <h2 className="font-medium text-gray-900 text-lg dark:text-gray-100">最新文章</h2>
        <p className="text-gray-400 text-xs">
          widgets/post-list 在首页与 /posts 两处复用——widget 层存在的意义。
        </p>
        <PostListWidget />
      </section>
    </main>
  )
}
