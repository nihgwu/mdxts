import { execSync } from 'node:child_process'

/** Returns aggregated metadata about multiple files from git history. */
export function getGitMetadata(filePaths: string[]) {
  const authorContributions = new Map<
    string,
    { name: string; commitCount: number; lastCommitDate: Date }
  >()
  let firstCommitDate: Date | undefined = undefined
  let lastCommitDate: Date | undefined = undefined

  for (
    let filePathIndex = 0;
    filePathIndex < filePaths.length;
    filePathIndex++
  ) {
    const filePath = filePaths[filePathIndex]
    const stdout = execSync(
      `git log --all --follow --format="%aN|%aE|%cD" -- "${filePath}"`
    )
    const lines = stdout.toString().trim().split('\n')

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      const [name, email, dateString] = line.split('|')
      const date = new Date(dateString)

      if (!authorContributions.has(email)) {
        authorContributions.set(email, {
          name,
          commitCount: 1,
          lastCommitDate: date,
        })
      } else {
        const author = authorContributions.get(email)!
        author.commitCount += 1
        if (author.lastCommitDate < date) {
          author.lastCommitDate = date
          author.name = name
        }
      }

      if (firstCommitDate === undefined || date < firstCommitDate) {
        firstCommitDate = date
      }
      if (lastCommitDate === undefined || date > lastCommitDate) {
        lastCommitDate = date
      }
    }
  }

  const sortedAuthors = Array.from(authorContributions.values()).sort(
    (a, b) =>
      b.commitCount - a.commitCount ||
      b.lastCommitDate.getTime() - a.lastCommitDate.getTime()
  )

  return {
    authors: sortedAuthors.map((author) => author.name),
    createdAt: firstCommitDate?.toISOString(),
    updatedAt: lastCommitDate?.toISOString(),
  }
}
