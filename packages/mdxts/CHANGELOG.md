# mdxts

## 1.0.0

### Major Changes

- 05d31e7: MDXTS v1 is released! 🎉 Check out the [announcement post](https://www.mdxts.dev/blog/introducing-mdxts) for more details.

### Patch Changes

- 15ffbfb: Configure plain markdown files in addition to mdx files for loader.
- 76ede2b: Treat `diff` as `plaintext` when attempting to tokenize.
- dfc73a1: Removes code blocks before searching for headings when calculating the data item title to prevent bad heading parsing.

## 0.19.0

### Minor Changes

- 00f6547: Uses a slightly smaller filename font size for the `CodeBlock` toolbar by default.
- 87ee6c4: Adds `Copyright` component to render copyright notices.
- 8558c3f: Adds `GitProviderLink` and `GitProviderLogo` components to render links and graphics for the configured git provider.
- 999446c: Adds MDXTS assets for linking back to the MDXTS site:

  ```jsx
  import { BuiltWithMdxts } from "mdxts/assets";

  export function Footer() {
    return (
      <footer>
        <BuiltWithMdxts />
      </footer>
    );
  }
  ```

- b7c7f0d: Removes default vertical padding for `CodeInline` component.
- fcb0a03: Now infers `gitSource` and `siteUrl` in `mdxts/next` using [Vercel environment variables](https://vercel.com/docs/projects/environment-variables/system-environment-variables) if available.

### Patch Changes

- 9a9d33a: Fixes using the initial value rather than the possibly transformed value in `CodeBlock`.
- de7bad8: Fixes line numbers highlight styles.
- 759bb79: Fixes interaction when copy button covers code block text by hiding the copy button on the first pointer down until entering the code block area again.
- 2e384bb: Closes symbol popover on pointer down to allow selecting code block text.
- ef4b03a: Fixes unnecessarily rendering token when it is whitespace.
- 308c709: Normalizes `CopyButton` sizes across code components.

## 0.18.0

### Minor Changes

- b796c3f: Removes `LineHighlights` component in favor of simpler CSS approach for highlighting lines.
- cccf278: Renames `CodeBlock` `lineHighlights` prop to `highlightedLines`.

  ### Breaking Changes

  - `CodeBlock` `lineHighlights` prop has been renamed to `highlightedLines`.

- 044d1ca: Renames `CodeBlock` `toolbar` prop to `showToolbar`.

  ### Breaking Changes

  - `CodeBlock` `toolbar` prop has been renamed to `showToolbar`.

- dfa9384: Fixes `CodeBlock` accessibility and markup by swapping `div`s with `span`s and using a `code` element around tokens.
- 564806a: Renames `CodeBlock` `lineNumbers` prop to `showLineNumbers`.

  ### Breaking Changes

  - `CodeBlock` `lineNumbers` prop has been renamed to `showLineNumbers`.

- bd646c4: Adds `focusedLines` and `unfocusedLinesOpacity` props to the `CodeBlock` component to control focusing a set of lines and dimming the other lines. It uses an image mask to dim out the lines which can be controlled using `unfocusedLinesOpacity`:

  ````mdx
  ```tsx focusedLines="3-4"
  const a = 1;
  const b = 2;
  const result = a + b;
  console.log(result); // 3
  ```
  ````

  ```tsx
  <CodeBlock
    value={`const a = 1;\nconst b = 2;\n\nconst add = a + b\nconst subtract = a - b`}
    focusedLines="2, 4"
  />
  ```

### Patch Changes

- a02b1d8: Fixes copy button overlapping `CodeBlock` content by only showing the button when hovering the code block. The button now also sticks to the top right of the code block when scrolling.

## 0.17.0

### Minor Changes

- e493fbd: Refines `paths` returned from `createSource` and `mergeSources`. Based on the glob pattern provided, either a one-dimensional or two-dimensional array of paths will be returned:

  ```ts
  import { createSource, mergeSources } from "mdxts";

  const allPosts = createSource("posts/*.mdx").paths(); // string[]
  const allDocs = createSource("docs/**/*.mdx").paths(); // string[][]
  const allPaths = mergeSources(allDocs, allPosts).paths(); // string[] | string[][]
  ```

  Likewise the `get` method will be narrowed to only accept a single pathname or an array of pathname segments:

  ```ts
  allPosts.get("building-a-button-component-in-react");
  allDocs.get(["examples", "authoring"]);
  ```

  ### Breaking Changes

  - The `paths` method now returns a one-dimensional array of paths for a single glob pattern and a two-dimensional array of paths for multiple glob patterns.
  - The `get` method now only accepts a single pathname or an array of pathname segments.

  You may need to update your code to accommodate these changes:

  ```diff
  export function generateStaticParams() {
  --  return allPosts.paths().map((pathname) => ({ slug: pathname.at(-1) }))
  ++  return allPosts.paths().map((pathname) => ({ slug: pathname }))
  }
  ```

- 7444586: Now `createSource.get` attempts to prepend the incoming pathname with `basePathname` if defined and no data was found.

### Patch Changes

- 6d338a6: Handles null values and throws an error for undefined values when formatting front matter for type checking.

## 0.16.0

### Minor Changes

- 469b021: Enables type-checking for the `CodeBlock` component. To opt-out of type-checking, use the `allowErrors` prop on the code block:

  ```tsx allowErrors
  const a = 1;
  a + b;
  ```

  This will disable type-checking for the code block and prevent erroring. To show the errors, usually for educational purposes, use the `showErrors` prop:

  ```tsx allowErrors showErrors
  const a = 1;
  a + b;
  ```

  ### Breaking Changes

  `CodeBlock` now throws an error if the code block is not valid TypeScript. This is to ensure that all code blocks are type-checked and work as expected.

- bb372a8: Normalizes passing `CodeBlock` and `CodeInline` props to `pre` and `code` elements in the rehype plugin.
- 0f49ee9: Adds `previous` and `next` examples metadata to data source.
- f05b552: Normalizes the internal `getEntrySourceFiles` utility that is responsible for determining what TypeScript data sources are public based on `package.json` exports, index files, and top-level directories.

  To determine what source files should be considered public when dealing with package exports, `createSource` gets two new options used to remap `package.json` exports to their original source files:

  ```ts
  import { createSource } from "mdxts";

  const allPackages = createSource("../packages/mdxts/src/**/*.{ts,tsx}", {
    sourceDirectory: "src",
    outputDirectory: "dist",
  });
  ```

  Using a subset of the `mdxts` `package.json` exports as an example:

  ```json
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "import": "./dist/src/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./components": {
      "types": "./dist/src/components/index.d.ts",
      "import": "./dist/src/components/index.js",
      "require": "./dist/cjs/components/index.js"
    },
  },
  ```

  These would be remapped to their original source files, filtering out any paths gathered from the `createSource` pattern not explicitly exported:

  ```json
  [
    "../packages/mdxts/src/index.ts",
    "../packages/mdxts/src/components/index.ts"
  ]
  ```

- 0a4bde2: Moves `CodeBlock:sourcePath` to a public prop and adds `sourcePath` to the code meta in the remark plugin.
- 9cf1577: Cleans up type errors to be more understandable and adds a configuration to highlight errors in the terminal:

  ```ts
  import { createMdxtsPlugin } from "mdxts";

  const withMdxtsPlugin = createMdxtsPlugin({ highlightErrors: true });

  export default withMdxtsPlugin();
  ```

- 2af35d0: Converts theme to object syntax and moves colors to top-level:

  `theme.colors['panel.border']` -> `theme.panel.border`

- 7726268: Adds a new `sort` option to `createSource`:

  ```tsx
  import { createSource } from "mdxts";

  const allPosts = createSource<{ frontMatter: { date: Date } }>("**/*.mdx", {
    sort: (a, b) => a.frontMatter.date - b.frontMatter.date,
  });
  ```

- c42eb88: Removes panel border modifications which decreased the alpha channel of the `panel.border` theme color. This should now be modified in a custom theme.
- 2af35d0: Rewrites the `CodeBlock` component to use the latest version of [shiki](https://shiki.style/) as well as allows for better composition using newly exposed `Tokens`, `Toolbar`, `LineNumbers`, and `LineHighlights` components:

  ```tsx
  import { getTheme } from "mdxts";
  import { CodeBlock, Toolbar, Tokens } from "mdxts/components";

  function CodeBlockWithToolbar() {
    const theme = getTheme();

    return (
      <CodeBlock source="./counter/Counter.tsx">
        <div
          style={{
            backgroundColor: theme.background,
            color: theme.foreground,
          }}
        >
          <Toolbar allowCopy style={{ padding: "0.5rem 1rem" }} />
          <pre
            style={{
              whiteSpace: "pre",
              wordWrap: "break-word",
              overflow: "auto",
            }}
          >
            <Tokens />
          </pre>
        </div>
      </CodeBlock>
    );
  }
  ```

  Individual `CodeBlock` elements can be styled now for simple overriding:

  ```tsx
  <CodeBlock
    className={{
      container: GeistMono.className,
    }}
    style={{
      container: {
        fontSize: "var(--font-size-body-2)",
        lineHeight: "var(--line-height-body-2)",
        padding: "1rem",
      },
      toolbar: {
        padding: "0.5rem 1rem",
      },
    }}
    language="tsx"
    value="..."
  />
  ```

  ### Breaking Changes

  `CodeBlock` now uses a keyed `className` and `style` object to allow for more granular control over the styling of the `CodeBlock` components. To upgrade, move the `className` and `style` definitions to target the `container`:

  ```diff
  <CodeBlock
  --  className={GeistMono.className}
  ++  className={{ container: GeistMono.className }}
  style={{
  ++    container: {
             padding: '1rem'
  ++    },
    }}
  ```

- 0b80bf5: Adds a `fixImports` prop to `CodeBlock` to allow fixing imports when the source code references files outside the project and can't resolve correctly:

  ```tsx
  import { CodeBlock } from "mdxts/components";

  const source = `
  import { Button } from './Button'
  
  export function BasicUsage() {
    return <Button>Click Me</Button>
  }
  `;

  export default function Page() {
    return <CodeBlock fixImports value={source} />;
  }
  ```

  An example of this is when rendering a source file that imports a module from a package that is not in the immediate project. The `fixImports` prop will attempt to fix these broken imports using installed packages if a match is found:

  ```diff
  --import { Button } from './Button'
  ++import { Button } from 'design-system'

  export function BasicUsage() {
    return <Button>Click Me</Button>
  }
  ```

- 2af35d0: Rewrites relative import specifiers pointing outside of the project to use the package name if possible:

  `import { getTheme } from '../../mdxts/src/components'` -> `import { getTheme } from 'mdxts/components'`

- 0e2cc45: Adds a `renumberFilenames` option to the next plugin for configuring whether or not to renumber filenames when adding/removing/modifying ordered content.
- ad8b17f: ### Breaking Changes

  The `CodeBlock` `highlight` prop has been renamed to `lineHighlights` to better match the `LineHighlights` component nomenclature.

- 7c5df2f: Fixes data source ordering to use strings instead of `parseInt` to ensure that the items are always ordered correctly.

  ### Breaking Changes

  The `order` property for a data source item is now a padded string instead of a number.

### Patch Changes

- 8802a57: Fixes hardcoded CSS properties in `Toolbar` copy button by using `em` values and `currentColor`.
- 91e87c4: Renames `getTheme` utility to `getThemeColors`.
- 85722e3: Fixes MDX code block meta values with an equals sign from being parsed incorrectly.
- f21cf8d: Allows omitting `CodeBlock` filename extension and uses `language` if provided.
- 2af35d0: Fixes splitting tokens when multiple symbols exist in a single token.
- 58b9bd3: Fixes source links to direct line and column in GitHub.
- 885a6cc: Fixes polluting `CodeBlock` globals by always adding a `export { }` declaration to the AST and only removing it from the rendered tokens.
- c57b51f: Speeds up build by lazily executing dynamic imports.

## 0.15.3

### Patch Changes

- 31c1dbc: Handle monorepos when checking if git repository in `getGitMetadata`.

## 0.15.2

### Patch Changes

- d3520da: Prevent fatal git error in console by checking for `.git` directory in `getGitMetadata`.

## 0.15.1

### Patch Changes

- bf65891: Fixes inferred front matter for `createSource.get` method.
- 94fd7fe: Silence `jju` warnings used by `@manypkg/find-root`.
- a79d453: Handles nested fields when type checking front matter.
- 635de6c: Bail early if not a git repository to avoid printing git errors when not initialized yet.

## 0.15.0

### Minor Changes

- 435c5e8: Allow overriding `frontMatter` type through `createSource` generic.

  ```ts
  import { createSource } from "mdxts";

  export const allDocs = createSource<{
    frontMatter: {
      title: string;
      description: string;
      date: string;
      tags?: string[];
    };
  }>("docs/*.mdx");
  ```

- fac626b: Adds front matter type validation using the generic passed to `createSource`:

  ```ts
  import { createSource } from "mdxts";

  export const allPosts = createSource<{
    frontMatter: {
      title: string;
      date: Date;
      summary: string;
      tags?: string[];
    };
  }>("posts/**/*.mdx", { baseDirectory: "posts" });
  ```

  ```posts/markdown-guide.mdx
  ---
  title: Hello World
  date: 2021-01-01
  ---

  # Hello World

  This is a post.
  ```

  Results in the following type error:

  ```
  Error: Front matter data is incorrect or missing
  [/posts/markdown-guide.mdx] Type '{}' does not satisfy the expected type 'frontMatter'.
  Type '{}' is missing the following properties from type 'frontMatter': summary
  ```

### Patch Changes

- 7327000: Fixes WebSocket error during local development when first loading the page:

  ```
  InvalidStateError: Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.
  ```

## 0.14.0

### Minor Changes

- 32c9686: Removes private `Editor` and `Preview` components and related dependencies to reduce bundle size.
- 6fcd390: Adds initial support for Next.js [Turbopack](https://nextjs.org/docs/app/api-reference/next-config-js/turbo) locally.

### Patch Changes

- 9feac19: Removes processing MDX files with Webpack loader since it is now handled through remark and `getAllData`.

## 0.13.0

### Minor Changes

- 88b9e10: Simplify `MDXContent` to not include plugins by default and instead expose new `remarkPlugins`, `rehypePlugins`, and `baseUrl` props.
- ad09ddb: Moves `frontMatter` from Webpack loader to static `getAllData` utility so front matter metadata is available when using the `createSource.all` method.
- b42a275: Removes `ShouldRenderTitle` transformation from Webpack loader and now adds it through a remark plugin.

### Patch Changes

- e76e18e: Fixes headings getting incremented ids when duplicates do not exist.

## 0.12.1

### Patch Changes

- f35df99: Fixes the `getGitMetadata` utility erroring when running MDXTS in a project that does not have git instantiated.
- fa4d329: Fixes the Webpack loader not updating dynamic imports when the `createSource` file pattern directory changes.
- d651cd0: Filter empty lines from git log to avoid `getGitMetadata` erroring related to #81.
- d3fc5ac: Throw more helpful error if MDX code block is empty.

## 0.12.0

### Minor Changes

- a7bae02: Reformat `createSource.all` method to return an array instead of an object.

  ```diff
  const allDocs = createSource('docs/*.mdx')
  ---Object.values(allDocs.all()).map((doc) => ...)
  +++allDocs.all().map((doc) => ...)
  ```

- 7942259: Move source item `gitMetadata` to top-level fields.

  ```diff
  import { MetadataRoute } from 'next'
  import { allData } from 'data'

  export default function sitemap(): MetadataRoute.Sitemap {
    return Object.values(allData.all()).map((data) => ({
      url: `https://mdxts.dev/${data.pathname}`,
  ---    lastModified: data.gitMetadata.updatedAt,
  +++    lastModified: data.updatedAt,
    }))
  }
  ```

- 305d1a4: Throw error if attempting to use git metadata and repo is shallowly cloned.
- ba37a05: Adds `url` field to source item that concatenates `siteUrl` with `pathname`.
- e487e1f: Adds a remark plugin to transform relative ordered links:

  ```diff
  --- [./02.rendering.mdx]
  +++ [./rendering]
  ```

### Patch Changes

- fc74fb9: Fixes `CodeBlock` `allowCopy` prop still showing copy button when set to `false`.
- b7da458: Fixes code blocks being transformed when wrapping headings in `ShouldRenderTitle`.

## 0.11.0

### Minor Changes

- 90863ba: Adds RSS feed helper for `createSource` and `mergeSources`:

  ```js
  // app/rss.xml/route.js
  import { allData } from "data";

  export async function GET() {
    const feed = allData.rss({
      title: "MDXTS - The Content & Documentation SDK for React",
      description: "Type-safe content and documentation.",
      copyright: `©${new Date().getFullYear()} @souporserious`,
    });
    return new Response(feed, {
      headers: {
        "Content-Type": "application/rss+xml",
      },
    });
  }
  ```

- 4121eb9: Replaces `remark-typography` with the more popular `remark-smartypants` package.
- 7367b1d: Adds ISO 8601 duration to `readingTime` metadata for easier use with `time` HTML element.
- e04f4f6: Adds `createdAt`, `updatedAt`, and `authors` fields to `createSource` item. This implementation is inspired by [unified-infer-git-meta](https://github.com/unifiedjs/unified-infer-git-meta).
- 9c6d65a: Adds `readingTime` field to `createSource` item using [rehype-infer-reading-time-meta](https://github.com/rehypejs/rehype-infer-reading-time-meta).
- fb0299d: Adds support for Codesandbox embeds in MDX.

### Patch Changes

- 6e68e11: Fixes an issue where saving content did not trigger a fast refresh locally. This adds a web socket server component to the Content component to ensure a refresh is always triggered.
- fafdcc6: Adds default `feedLinks.rss` option when creating rss feeds.
- df41a98: Fixes empty `createSource` when targeting JavaScript/TypeScript without an `index` file.

## 0.10.1

### Patch Changes

- d16f84d: Reverts 06e5c20 which merged default `MDXComponents` into `MDXContent` components as it causes an infinite loop.

## 0.10.0

### Minor Changes

- 2b60fa0: Add same `remark` and `rehype` plugins used in `mdxts/next` to `MDXContent` component.
- 06e5c20: Merge default `MDXComponents` into `MDXContent` components.
- 2bf8b02: Allow passing a language to inline code in MDX like `js const a = '1'`.

### Patch Changes

- ae3d6a3: Fix metadata analysis to account for MDX syntax.
- 1b2b057: Fix example names not being parsed as a title.
- 4b9314c: Fix missing theme for `MDXContent` in examples.

## 0.9.1

### Patch Changes

- 29a923d: Fixes heading level one not being rendered as markdown.
- 16eabd2: Fix remark plugins not being initialized correctly.
- 05106f3: Merge data title into metadata if not explicitly defined.

## 0.9.0

### Minor Changes

- 16031d0: Adds a `renderTitle` prop to the `Content` component returned from `createSource` to allow overriding the default title for an MDX file.
- 5707439: Add `className` and `style` to `CopyButton`.
- c673a16: Add `fontSize` and `lineHeight` props to `CodeBlock`.
- 849dd1c: Replace `isServerOnly` field with `executionEnvironment` that can be either `server`, `client`, or `isomorphic`.
- 87026e9: Only use inferred description from MDX for metadata.
- 78fbfbb: Add separate `PackageStylesAndScript` component for `PackageInstallClient` styles and local storage hydration.
- 758ab24: Sync package manager state across other component instances and windows.

### Patch Changes

- c753d53: Fix headings below level one getting wrapped with `ShouldRenderTitle`.
- ddf8870: Add `name` support for type aliases, interfaces, and enum declarations.
- 000acf3: Fix default `Symbol` highlight color to be a transparent version of the theme `hoverHighlightBackground`.
- 71f5545: Fix `isMainExport` field for `exportedTypes` to correctly interpret which export declaration is the main export based on a matching name.
- 65824b9: Fix JavaScript code blocks erroring with `cannot read undefined reading flags, escapedName` by setting ts-morph project config to `allowJs`.

## 0.8.2

### Patch Changes

- 5fd018d: Use better theme variables that work across various themes for `CodeBlock` component.
- 50e47bc: Fix `@internal` JSDoc tag analysis for variable declarations.
- 23e6ab9: Add `workingDirectory` prop through loader if `CodeBlock`, `CodeInline`, or `ExportedTypes` are imported.
- 8efe0e0: Clean up `ExportedTypes` declaration type default value.
- 4a5aa29: Add theme container styles to `CodeInline`.

## 0.8.1

### Patch Changes

- 57f1e39: Fix `QuickInfo` font-family and foreground color styles.
- d34d877: Fix multline jsx only code blocks.
- a761181: Fix devtools server action from erroring when using static export.
- c261e18: Allow default MDX components to be overridden at the component level.
- 3a86f90: Move theme configuration to the end of the source in the webpack loader to avoid overwriting `use client` directives.
- 1963ce6: Fix incorrect jsx-only code block token start/end positions.

## 0.8.0

### Minor Changes

- 69e8dc8: Don't remove level one heading from content.

### Patch Changes

- 9379847: Gracefully handle undefined `gitSource` option.

## 0.7.0

### Minor Changes

- 19d82bd: Move `gitSource` url codemod to the CLI and add support for other git providers.

### Patch Changes

- ba56adc: Add try/catch around CodeBlock `createSourceFile` as temporary fix when virtual files cannot be created.
- 2b1628c: Fixes load order for MDX components to load before the `@mdx-js/react` package.`

## 0.6.2

### Patch Changes

- 71f9cc2: Remove `@typescript/ata` since it isn't currently being used and causes package version issues with newer TypeScript versions.
- 9a0ed54: Move `prettier` and `shiki` to peer dependencies.

## 0.6.1

### Patch Changes

- 577d4b7: Remove public files in `mdxts/next` for now. These are generated for syntax highlighting and type checking on the client for the unreleased `Editor` component.

## 0.6.0

### Minor Changes

- dfea828: Use stable generated filename based on Code value.
- 47c8ee1: Replaces `summary` export from remark plugin with `description` which is now used to calculate data `description` field.
- b2d9324: Account for standard `@internal` JSDoc tag instead of `@private` in `getExportedSourceFiles`.
- d7ac97a: Pass processed entry declarations to determine implicit internal exports in `getAllData`.
- e89116e: Reduces the number of times the shiki highlighter is initialized to prevent `memory access out of bounds` errors.
- 4303ce5: Add support for `examples` directory.
- 3fff302: Add default MDX components to `next` plugin for `code` and `pre` elements.
- f66aaa2: Adds `ExportedTypes` component for gathering types from a file or source code.
- 3a6fe9b: Add support for following index file exports when gathering exported types.
- 8671ff8: Add global timer to `QuickInfo` for better hover interactions.
- 66edade: Add support for ordered `Code` blocks using a numbered filename prefix.
- 57d8a29: Rename `MDX` to `MDXContent` and `mdxComponents` to `MDXComponents`.
- f66aaa2: Use smaller generated `filename` for `CodeBlock`. Using `Buffer.from(props.value).toString('base64')` was causing an `ENAMETOOLONG` error.
- e5fe316: Fixes `QuickInfo` tooltip by keeping it in view and accounting for scroll offset.
- 97c0861: Introduces preconfigured examples starting with a blog example.
- 3109b2d: Remove `PackageExports` component, this information is accessible from the data returned in `createSource`.
- b948305: Split up `Code` component into `CodeBlock` and `CodeInline` components.
- cc3b831: Add `style` prop to `PackageInstall`.
- 5c0c635: Account for `@internal` JSDoc tag in `getExportedTypes`.
- 8c13479: Always split highlighter tokens by identifier.

### Patch Changes

- 1f3875d: Fix `Symbol` highlighted state when hovering `QuickInfo`.
- 3dd1cf3: Fix `QuickInfo` paragraph color.
- 0465092: Fix relative `createSource` paths by using absolute paths for imports and adding webpack file dependencies.
- 204bba5: Use cross-platform file path separator in `Code`.
- 1f45a78: Fix `QuickInfo` erroring when parsing documentation by handling links properly.
- a272add: Fix `CodeBlock` filename label when complex filename. The regex was only accounting for strings that begin with numbers.
- daf9550: Handle all exported declarations in `getExportedTypes`.
- eac632c: Add text-wrap pretty to `QuickInfo` paragraphs.
- f9d8e48: Compute `Module` type so quick info is cleaner.
- 1fd91d3: Fix metadata erroring when front matter is available.

## 0.5.0

### Minor Changes

- f8b71d6: Implement specific allowed errors.
- 2f1cdbe: Add `toolbar` prop to `Code` for controlling rendering of toolbar.
- 63939ac: Improve `Navigation` `renderItem` prop types.
- 20182d4: Default to common root for now when no exports field found.
- 0d91905: Add `style` prop to `Code`.
- 515d727: Add diagnostic error code in `QuickInfo` tooltip.
- bfc8b40: Add plaintext language option to highlighter.
- b501e32: Add example source text to examples metadata.
- 86c32e3: Rename `getMetadataFromClassName` -> `getClassNameMetadata`.
- ad4fd02: Use package json path when calculating entry source files.
- 61e72cd: Add `MDX` component for rendering mdx source code.
- d77a29a: Use box shadow instead of border in `Code` to prevent adding to layout.
- 606c25d: Render quick info documentation text as MDX.
- 50dc93d: Only require working directory in `Code` when using relative paths.
- 79e7e5d: Fix file path to pathname slugs for all caps e.g. `MDX.tsx` -> `mdx`
  and `MDXProvider.tsx` -> `mdx-provider`.
- ffd4512: Add exhaustive type documentation generation accounting for template literal and call expressions.

### Patch Changes

- cf73027: Fix navigation order by filtering out private files.
- 5f30ed1: Collapse `Code` toolbar grid row when not used.
- a4cc4c3: Fixes code blocks being treated as global scope when no imports or exports are present.
- 2876946: Improve quick info tooltip type wrapping instead of overflowing.
- e392e3c: Infer `Code` language from filename if provided.
- 42eea84: Fix parsing directory base name to title.

## 0.4.1

### Patch Changes

- 6c64d70: Throw error when no files found for `createSource` file pattern.

## 0.4.0

### Minor Changes

- 913fc68: Add Node polyfill plugin for Editor.
- e3ed63f: Rename `createDataSource` -> `createSource` and `mergeDataSources` -> `mergeSources`
- 4bbb048: Add `allowCopy` `Code` prop for controlling the rendering of the copy button.
- cb95470: Add cli tool to scaffold initial project.

### Patch Changes

- 576b808: Fix loading shiki themes.

## 0.3.0

### Minor Changes

- 7b3a555: Fix data source item order not taking directory into account.
- 329ed73: Add `depth` property to data item.
- 3fb551f: Fix <Code inline /> hydration issue by rendering spans instead of divs.
- 3e7e3a4: Use a root relative pathname as the data key.
- 445c961: Link to the first immediate page with data in `tree` utility.
- 038ac17: Add `mergeDataSources` function to merge multiple sources returned from `createDataSource`.
- c17d469: Fix previous/next sort order.
- df9c8ee: Adds a `getExample` helper attached to the data source.
- 10d66a4: Add support for examples extension.
- 3d4105a: Add pathname and slug to example items.
- e4a68eb: Pass `workingDirectory` to Code component used in examples.

### Patch Changes

- 6fe9356: Fix type table of contents slug.
- e15d50e: Expand type documentation if it is not publicly linkable.
- 53cbf75: Fix `createDataSource` loader transform not working when other imports are present.
- 500d3ca: Remove leading numbers from title generated from filename.
- 66b8629: Fix camel case filename to pathname conversion.

## 0.2.0

### Minor Changes

- 070c2f2: Partial rewrite to remove the `bundle` package in favor of the framework's bundler.

### Patch Changes

- 353140d: Add Editor based on starry-night highlighter.
- cc81cfb: Add remark-typography plugin.
- 27366fd: Replace starry-night with shiki.
- d435839: Adds initial format handling using dprint-node on the server and prettier on the client. The different formatters is required until prettier works with Server Components.

## 0.1.5

### Patch Changes

- 27fa51d: Use config theme for shiki highlighting.
- e4ba8ba: Initial Editor component.
- 3d536d7: Transform code when JavaScript or TypeScript code block.
- 33f93b9: Fix multiple watchers being created.
- a63b352: Better error message for meta props transform.
- f0ca3b7: Load theme through next config.
- 0a5de46: Fix meta props.

## 0.1.4

### Patch Changes

- 4ee1325: Map meta string to props.

## 0.1.3

### Patch Changes

- ac2703b: Initial Example component implementation.
- 6aeba9c: Fix symbolic links transform cutting off content.
- 32ac2bb: Change `getExamplesFromDirectory` signature to accept a directory.
- e86ce2b: Remove @mdx-js/react and ts-morph peer dependencies.

## 0.1.2

### Patch Changes

- ae87fdc: Fix bundling JavaScript/TypeScript files.
- ae87fdc: Render index pages.
- a5ef955: Add data from source files automatically and make loader optional.
- ae87fdc: Pass `Project` to loader.
- 714df88: Ignore build files in watcher.

## 0.1.1

### Patch Changes

- a37c08e: Fix types

## 0.1.0

### Minor Changes

- 56fca96: Initial release
