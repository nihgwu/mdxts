import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useId,
  useState,
} from 'react'
import type { Diagnostic, SourceFile } from 'ts-morph'
import { getDiagnosticMessageText } from '../diagnostics'
import type { Highlighter, Theme, Tokens } from '../highlighter'
import { getHighlighter } from '../highlighter'
import { project, languageService } from '../project'

const isClient = typeof document !== 'undefined'
const canvas = isClient ? document.createElement('canvas') : null
const context = canvas?.getContext('2d')
let fetchPromise = isClient ? fetch('/_next/static/mdxts/types.json') : null

if (context) {
  context.font = '14px monospace'
}

export type EditorProps = {
  /** Default value of the editor. */
  defaultValue?: string

  /** Controlled value of the editor. */
  value?: string

  /** Name of the file. */
  filename?: string

  /** Language of the code snippet. */
  language?: string

  /** VS Code-based theme for highlighting. */
  theme?: Theme

  /** Callback when the editor value changes. */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const languageMap = {
  shell: 'shellscript',
  bash: 'shellscript',
}

/** Code editor with syntax highlighting. */
export function Editor({
  language: languageProp,
  defaultValue,
  value,
  filename: filenameProp,
  onChange,
  theme,
  children,
}: EditorProps & { children?: React.ReactNode }) {
  const filenameId = useId()
  const filename = filenameProp || `index-${filenameId.slice(1, -1)}.tsx`
  const language = languageMap[languageProp] || languageProp
  const [stateValue, setStateValue] = useState(defaultValue)
  const [tokens, setTokens] = useState<Tokens[]>([])
  const [row, setRow] = useState(null)
  const [column, setColumn] = useState(null)
  const [sourceFile, setSourceFile] = useState<SourceFile | null>(null)
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([])
  const [suggestions, setSuggestions] = useState([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [hoverInfo, setHoverInfo] = useState<React.ReactNode | null>(null)
  const [hoverPosition, setHoverPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null)
  const ctrlKeyRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const nextCursorPositionRef = useRef(null)
  const resolvedValue = value ?? stateValue
  const isJavaScriptBasedLanguage = [
    'javascript',
    'js',
    'jsx',
    'typescript',
    'ts',
    'tsx',
  ].some((languageToCompare) => languageToCompare === language)

  useLayoutEffect(() => {
    // Editor currently only supports highlighting JavaScript-based languages
    if (!isJavaScriptBasedLanguage) {
      return
    }

    async function init() {
      // Wait for the types to be fetched before creating declaration source files
      if (fetchPromise) {
        const response = await fetchPromise
        const typeDeclarations = await response.clone().json()

        typeDeclarations.forEach(({ path, code }) => {
          project.createSourceFile(path, code, { overwrite: true })
        })

        fetchPromise = null
      }

      const highlighter = await getHighlighter({
        theme,
        langs: [
          'javascript',
          'js',
          'jsx',
          'typescript',
          'ts',
          'tsx',
          'css',
          'json',
          'shellscript',
        ],
        paths: {
          languages: '/_next/static/mdxts',
          wasm: '/_next/static/mdxts',
        },
      })

      setHighlighter(() => highlighter)
    }
    init()
  }, [])

  useLayoutEffect(() => {
    if (highlighter === null) {
      return
    }

    const nextSourceFile = project.createSourceFile(filename, resolvedValue, {
      overwrite: true,
    })
    setSourceFile(nextSourceFile)

    if (isJavaScriptBasedLanguage) {
      const diagnostics = nextSourceFile.getPreEmitDiagnostics()
      setDiagnostics(diagnostics)

      if (highlighter) {
        const tokens = highlighter(resolvedValue, language, sourceFile)
        setTokens(tokens)
      }
    } else if (highlighter) {
      const tokens = highlighter(resolvedValue, language)
      setTokens(tokens)
    }
  }, [resolvedValue, highlighter])

  useEffect(() => {
    if (nextCursorPositionRef.current) {
      textareaRef.current.selectionStart = nextCursorPositionRef.current
      textareaRef.current.selectionEnd = nextCursorPositionRef.current
      nextCursorPositionRef.current = null
    }
  }, [stateValue])

  function getAutocompletions(position) {
    const completions = languageService.getCompletionsAtPosition(
      filename,
      position,
      {
        includeCompletionsForModuleExports: false,
        includeCompletionsWithInsertText: false,
        includeCompletionsWithSnippetText: false,
        includeInsertTextCompletions: false,
        includeExternalModuleExports: false,
        providePrefixAndSuffixTextForRename: false,
        triggerCharacter: '.',
      }
    )
    return completions ? completions.entries : []
  }

  function selectSuggestion(suggestion) {
    const currentPosition = textareaRef.current?.selectionStart || 0
    const beforeCursor = resolvedValue.substring(0, currentPosition)
    const match = beforeCursor.match(/[a-zA-Z_]+$/)
    const prefix = match ? match[0] : ''

    for (let index = 0; index < prefix.length; index++) {
      document.execCommand('delete', false)
    }

    document.execCommand('insertText', false, suggestion.name)
    setIsDropdownOpen(false)
    setHighlightedIndex(0)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!isDropdownOpen) {
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      let nextIndex = highlightedIndex - 1
      if (nextIndex < 0) {
        nextIndex = suggestions.length - 1
      }
      setHighlightedIndex(nextIndex)
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      let nextIndex = highlightedIndex + 1
      if (nextIndex >= suggestions.length) {
        nextIndex = 0
      }
      setHighlightedIndex(nextIndex)
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      selectSuggestion(suggestions[highlightedIndex])
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setIsDropdownOpen(false)
      setHighlightedIndex(0)
    }

    ctrlKeyRef.current = event.ctrlKey
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      /^[a-zA-Z.]$/.test(event.key) ||
      event.key === 'Backspace' ||
      (event.key === ' ' && ctrlKeyRef.current)
    ) {
      const cursorPosition = textareaRef.current?.selectionStart || 0
      const lastChar = resolvedValue.at(-1)
      const lines = resolvedValue.substring(0, cursorPosition).split('\n')
      setRow(lines.length - 1)
      setColumn(lines.at(-1).length)

      // don't trigger suggestions if there is space before the cursor
      if (!/^[a-zA-Z.]$/.test(lastChar) || ['\n', ' '].includes(lastChar)) {
        setIsDropdownOpen(false)
      } else {
        const currentSuggestions = getAutocompletions(cursorPosition)
        setSuggestions(currentSuggestions)
        setIsDropdownOpen(currentSuggestions.length > 0)
      }
    }
  }

  function handlePointerMove(
    event: React.MouseEvent<HTMLTextAreaElement, MouseEvent>
  ) {
    const rect = event.currentTarget.getBoundingClientRect()
    const cursorX = event.clientX - rect.left
    const cursorY = event.clientY - rect.top
    const row = Math.floor(cursorY / 20)
    const lineText = resolvedValue.split('\n')[row] || ''
    const column = Math.min(
      Math.floor(cursorX / context?.measureText(' ').width),
      lineText.length
    )
    const linesBeforeCursor = resolvedValue.split('\n').slice(0, row)
    const charsBeforeCurrentRow = linesBeforeCursor.reduce(
      (total, line) => total + line.length + 1,
      0
    )
    const position = charsBeforeCurrentRow + column
    const node = sourceFile?.getDescendantAtPos(position)

    if (!node) {
      setHoverInfo(null)
      setHoverPosition(null)
      return
    }

    const nodeStartLineContent = resolvedValue.substring(
      charsBeforeCurrentRow,
      node.getStart()
    )
    const nodeVisualStart = context?.measureText(nodeStartLineContent).width

    try {
      const quickInfo = languageService.getQuickInfoAtPosition(
        filename,
        position
      )

      if (quickInfo) {
        const displayParts = quickInfo.displayParts || []
        const documentation = quickInfo.documentation || []
        const displayText = displayParts.map((part) => part.text).join('')
        const docText = documentation.map((part) => part.text).join('')
        const displayTextTokens = highlighter(displayText, language)

        setHoverInfo(
          <div>
            {displayTextTokens.map((line, index) => {
              return (
                <div key={index}>
                  {line.map((token, index) => {
                    return (
                      <span key={index} style={{ color: token.color }}>
                        {token.content}
                      </span>
                    )
                  })}
                </div>
              )
            })}
            {docText ? <p style={{ margin: 0 }}>{docText}</p> : null}
          </div>
        )

        const xOffset = scrollRef.current?.scrollLeft ?? 0
        const yOffset = scrollRef.current?.scrollTop ?? 0

        setHoverPosition({
          x: nodeVisualStart - context?.measureText(' ').width - xOffset,
          y: row * 20 - 10 - yOffset,
        })
      } else {
        setHoverInfo(null)
        setHoverPosition(null)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const sharedStyle = {
    gridArea: '1 / 1',
    whiteSpace: 'pre',
    wordWrap: 'break-word',
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: '20px',
    letterSpacing: '0px',
    tabSize: 4,
    padding: '1rem',
    borderRadius: 4,
  } satisfies React.CSSProperties

  return (
    <div style={{ position: 'relative' }}>
      <div ref={scrollRef} style={{ display: 'grid', overflow: 'auto' }}>
        <div
          style={{
            ...sharedStyle,
            color: theme.colors['editor.color'],
            backgroundColor: theme.colors['editor.background'],
          }}
        >
          {stateValue === defaultValue && children
            ? children
            : tokens.map((line, lineIndex) => {
                return (
                  <div key={lineIndex} style={{ height: 20 }}>
                    {line.map((token, tokenIndex) => {
                      return (
                        <span
                          key={tokenIndex}
                          style={{
                            ...token.fontStyle,
                            color: token.color,
                            textDecoration: token.hasError
                              ? 'red wavy underline'
                              : 'none',
                          }}
                        >
                          {token.content}
                        </span>
                      )
                    })}
                  </div>
                )
              })}
        </div>
        <textarea
          ref={textareaRef}
          onPointerMove={
            isJavaScriptBasedLanguage ? handlePointerMove : undefined
          }
          onPointerLeave={() => {
            setHoverInfo(null)
            setHoverPosition(null)
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={isJavaScriptBasedLanguage ? handleKeyUp : undefined}
          onBlur={() => setIsDropdownOpen(false)}
          onChange={
            defaultValue
              ? (event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setStateValue(event.target.value)
                  onChange?.(event)
                }
              : onChange
          }
          spellCheck="false"
          className="write"
          value={resolvedValue}
          rows={resolvedValue.split('\n').length + 1}
          style={{
            ...sharedStyle,
            border: 0,
            backgroundColor: 'transparent',
            color: 'transparent',
            resize: 'none',
            outline: 'none',
            overflow: 'visible',
            caretColor: theme.colors['editorCursor.foreground'],
          }}
        />
      </div>

      {isDropdownOpen && (
        <ul
          style={{
            listStyle: 'none',
            fontSize: 14,
            width: 200,
            maxHeight: 340,
            padding: 0,
            margin: 0,
            overflow: 'auto',
            position: 'absolute',
            top: row * 20 + 20,
            left: column * context?.measureText(' ').width,
            zIndex: 1000,
            borderRadius: 3,
            border: `1px solid ${theme.colors['editorHoverWidget.border']}`,
            backgroundColor: theme.colors['editorHoverWidget.background'],
          }}
        >
          {suggestions.map((suggestion, index) => {
            const isHighlighted = index === highlightedIndex
            return (
              <Suggestion
                key={suggestion.name}
                onClick={() => selectSuggestion(suggestion)}
                isHighlighted={isHighlighted}
                suggestion={suggestion}
              />
            )
          })}
        </ul>
      )}

      {hoverInfo && hoverPosition && (
        <div
          style={{
            position: 'absolute',
            left: hoverPosition.x + 10,
            top: hoverPosition.y + 10,
            translate: '0px -100%',
            fontSize: 14,
            padding: '5px 8px',
            zIndex: 1000,
            borderRadius: 3,
            border: `1px solid ${theme.colors['editorHoverWidget.border']}`,
            backgroundColor: theme.colors['editorHoverWidget.background'],
          }}
        >
          {hoverInfo}
        </div>
      )}

      {diagnostics.length > 0 ? (
        <ul
          style={{
            listStyle: 'none',
            fontSize: '0.8rem',
            padding: '0.6rem',
            margin: 0,
            backgroundColor: 'red',
          }}
        >
          {diagnostics.map((diagnostic, index) => (
            <li key={index}>
              {getDiagnosticMessageText(diagnostic.getMessageText())}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function Suggestion({
  suggestion,
  isHighlighted,
  onClick,
}: {
  suggestion: any
  isHighlighted: boolean
  onClick: () => void
}) {
  const ref = useRef<HTMLLIElement>(null)

  useLayoutEffect(() => {
    if (isHighlighted) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isHighlighted])

  return (
    <li
      ref={ref}
      onClick={onClick}
      style={{
        padding: 2,
        backgroundColor: isHighlighted ? '#0086ffbd' : 'transparent',
      }}
    >
      {suggestion.name}
    </li>
  )
}
