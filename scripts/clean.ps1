$ErrorActionPreference = "Stop"

$root = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$rootPath = $root.Path

function Remove-InProject {
  param(
    [Parameter(Mandatory = $true)]
    [string]$RelativePath,
    [switch]$Recurse
  )

  $target = Join-Path $rootPath $RelativePath
  if (-not (Test-Path -LiteralPath $target)) {
    return
  }

  $resolved = (Resolve-Path -LiteralPath $target).Path
  if (-not $resolved.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove outside project root: $resolved"
  }

  if ($Recurse) {
    Remove-Item -LiteralPath $resolved -Recurse -Force
  } else {
    Remove-Item -LiteralPath $resolved -Force
  }
}

Remove-InProject "dist" -Recurse
Remove-InProject ".superpowers" -Recurse
Remove-InProject "src-tauri\gen" -Recurse

$releaseCacheDirs = @(
  "src-tauri\target\release\.fingerprint",
  "src-tauri\target\release\deps",
  "src-tauri\target\release\build",
  "src-tauri\target\release\incremental",
  "src-tauri\target\release\examples"
)

foreach ($path in $releaseCacheDirs) {
  Remove-InProject $path -Recurse
}

$releaseCacheFiles = @(
  "src-tauri\target\release\desktop_note.pdb",
  "src-tauri\target\release\desktop_note.d"
)

foreach ($path in $releaseCacheFiles) {
  Remove-InProject $path
}

Write-Output "Cleaned generated files under $rootPath"
