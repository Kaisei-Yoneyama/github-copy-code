/** `/{owner}/{repo}/commit/{commit_sha}` */
export const commitPathRegex =
  /^\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/commit\/(?<commit_sha>[0-9a-f]{40})(?:\/*)$/

/** `/{owner}/{repo}/pull/{pull_number}/files` */
export const pullFilesPathRegex =
  /^\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/pull\/(?<pull_number>\d+)\/files(?:\/*)$/

/** `/{owner}/{repo}/pull/{pull_number}/commits/{commit_sha}` */
export const pullCommitsPathRegex =
  /^\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/pull\/(?<pull_number>\d+)\/commits\/(?<commit_sha>[0-9a-f]{40})(?:\/*)$/

/**
 * コミットやプルリクエストのページに対応する diff ページのパスを返す
 * 変換できない場合は `null` を返す
 *
 * | 対象ページ | diff ページ |
 * | :--- | :--- |
 * | `/{owner}/{repo}/commit/{commit_sha}` | `/{owner}/{repo}/commit/{commit_sha}.diff` |
 * | `/{owner}/{repo}/pull/{pull_number}/files` | `/{owner}/{repo}/pull/{pull_number}.diff` |
 * | `/{owner}/{repo}/pull/{pull_number}/commits/{commit_sha}` | `/{owner}/{repo}/pull/{pull_number}/commits/{commit_sha}.diff` |
 *
 * @param pathname コミットやプルリクエストのページのパス
 * @returns コミットやプルリクエストのページに対応する diff ページのパス
 */
export const toDiffPath = (pathname: string) => {
  const commitPathMatch = pathname.match(commitPathRegex)

  if (commitPathMatch?.groups) {
    const { owner, repo, commit_sha } = commitPathMatch.groups
    return `/${owner}/${repo}/commit/${commit_sha}.diff`
  }

  const pullFilesPathMatch = pathname.match(pullFilesPathRegex)

  if (pullFilesPathMatch?.groups) {
    const { owner, repo, pull_number } = pullFilesPathMatch.groups
    return `/${owner}/${repo}/pull/${pull_number}.diff`
  }

  const pullCommitsPathMatch = pathname.match(pullCommitsPathRegex)

  if (pullCommitsPathMatch?.groups) {
    const { owner, repo, pull_number, commit_sha } = pullCommitsPathMatch.groups
    return `/${owner}/${repo}/pull/${pull_number}/commits/${commit_sha}.diff`
  }

  return null
}

/**
 * 差分ページのパスをもとに Raw ファイルのパスを返す
 * 変換できない場合は `null` を返す
 * @param pathname 差分ページのパス
 * @param filePath ファイルのパス
 * @returns Raw ファイルのパス
 */
export const toRawContentPath = (pathname: string, filePath: string) => {
  const commitPathMatch = pathname.match(commitPathRegex)

  if (commitPathMatch?.groups) {
    const { owner, repo, commit_sha } = commitPathMatch.groups
    return `/${owner}/${repo}/raw/${commit_sha}/${filePath}`
  }

  const pullCommitsPathMatch = pathname.match(pullCommitsPathRegex)

  if (pullCommitsPathMatch?.groups) {
    const { owner, repo, commit_sha } = pullCommitsPathMatch.groups
    return `/${owner}/${repo}/raw/${commit_sha}/${filePath}`
  }

  return null
}
