import * as React from 'react'
import { CodeBlock, type CodeBlockProps, MDXComponents } from 'mdxts/components'
import { PackageInstall } from 'mdxts/components/PackageInstall'
import { GeistMono } from 'geist/font/mono'

const codeBlockStyles = {
  container: {
    fontSize: 'var(--font-size-code)',
    lineHeight: 'var(--line-height-code)',
    width: 'calc(100% + 2rem)',
    padding: '1rem',
    margin: '0 -1rem',
  },
  toolbar: {
    padding: '0.8rem 1rem',
  },
} satisfies CodeBlockProps['style']

export function useMDXComponents() {
  return {
    PackageInstall,
    CodeBlock: (props) => (
      <CodeBlock
        className={{
          container: GeistMono.className,
        }}
        style={codeBlockStyles}
        {...props}
      />
    ),
    Example: (props) => <div {...props} />,
    Playground: ({ codeBlock, ...props }) => {
      return (
        <div style={{ display: 'flex' }}>
          <CodeBlock
            className={{
              container: GeistMono.className,
            }}
            style={{
              container: {
                fontSize: 'var(--font-size-body-2)',
                lineHeight: 'var(--line-height-body-2)',
              },
            }}
            language="tsx"
            value={codeBlock}
          />
          <div {...props} />
        </div>
      )
    },
    Editor: (props) => <div {...props} />,
    Error: (props) => <div {...props} />,
    Outline: (props) => <div {...props} />,
    References: (props) => <div {...props} />,
    Note: ({ children, ...props }) => (
      <div
        style={{
          fontSize: 'var(--font-size-body-2)',
          lineHeight: 'var(--line-height-body-2)',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          padding: '1em',
          margin: '0 -1rem',
          gap: '0.75rem',
          border: '1px solid var(--color-separator)',
          borderRadius: '0.5rem',
          backgroundColor: 'var(--color-surface-2)',
        }}
        {...props}
      >
        <svg
          fill="none"
          stroke="var(--color-foreground-secondary)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          width="1rem"
          height="1rem"
          viewBox="0 0 24 24"
          style={{ marginTop: '0.25rem' }}
        >
          <path d="M7.06883 21.6H16.219C18.7973 21.6 20.8879 19.5093 20.8879 16.9312V5.86885C20.8879 3.29074 18.7973 1.20001 16.219 1.20001H7.06883C4.49072 1.20001 2.39999 3.29074 2.39999 5.86885V16.9312C2.39999 19.5093 4.49072 21.6 7.06883 21.6Z" />
          <path d="M15.3946 15.842H7.89178M15.3946 11.245H7.89178M10.755 6.6586H7.89232" />
        </svg>
        <div>{children}</div>
      </div>
    ),
    a: (props) => {
      const isExternal = props.href.startsWith('http')
      return (
        <a
          {...props}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25em',
          }}
        >
          {props.children}
          {isExternal ? (
            <svg
              fill="none"
              stroke="var(--color-foreground-interactive)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              style={{
                width: 'max(1rem, 0.8em)',
                height: 'max(1rem, 0.8em)',
              }}
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
              <path d="M15 3h6v6"></path>
              <path d="M10 14L21 3"></path>
            </svg>
          ) : null}
        </a>
      )
    },
    ul: (props) => (
      <ul
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '0 0 0 1.4rem',
          gap: '1rem',
          fontSize: 'var(--font-size-body-2)',
        }}
        {...props}
      />
    ),
    code: (props) => (
      <MDXComponents.code className={GeistMono.className} {...props} />
    ),
    pre: (props) => (
      <MDXComponents.pre
        className={{
          container: GeistMono.className,
        }}
        style={codeBlockStyles}
        {...props}
      />
    ),
  } satisfies MDXComponents
}
