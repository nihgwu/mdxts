import { notFound } from 'next/navigation'
import { SiblingNavigation } from 'mdxts/components'
import { allDocs } from 'data'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return Object.values(allDocs).map((doc) => ({
    slug: doc.pathname.split('/').slice(1), // trim "docs" segment
  }))
}

export default function Page({ params }) {
  const doc = allDocs[`docs/${params.slug.join('/')}`]

  if (doc == undefined) {
    return notFound()
  }

  const { Component } = doc

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 160px',
          gap: '1rem',
        }}
      >
        <div>
          <Component />
        </div>
        <nav>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              margin: 0,
              marginTop: 'calc(var(--font-size-heading-1) + 1rem)',
              position: 'sticky',
              top: '2rem',
            }}
          >
            {doc.headings?.map(({ text, depth, id }) =>
              depth > 1 ? (
                <li
                  key={id}
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.25rem 0',
                    paddingLeft: (depth - 1) * 0.5 + 'rem',
                  }}
                >
                  <a href={`#${id}`}>{text}</a>
                </li>
              ) : null
            )}
          </ul>
        </nav>
      </div>
      <SiblingNavigation data={allDocs} pathname={params.slug} />
    </>
  )
}
