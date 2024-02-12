import React from 'react'
import { CodeBlock } from './CodeBlock'

export function Basic() {
  return <CodeBlock source="./counter/useCounter.ts" />
}

export function Ordered() {
  return (
    <>
      <CodeBlock filename="01.example.ts" value="const a = 1;" />
      <CodeBlock filename="02.example.ts" value="const a = 1; const b = 2;" />
    </>
  )
}
