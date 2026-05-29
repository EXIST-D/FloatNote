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
    try {
      Remove-Item -LiteralPath $resolved -Recurse -Force
    } catch {
      Write-Warning "Skipped locked or protected path: $resolved"
    }
  } else {
    try {
      Remove-Item -LiteralPath $resolved -Force
    } catch {
      Write-Warning "Skipped locked or protected file: $resolved"
    }
  }
}

Remove-InProject "dist" -Recurse
Remove-InProject ".tmp" -Recurse
Remove-InProject ".superpowers" -Recurse
Remove-InProject "src-tauri\gen" -Recurse

$targetCacheDirs = @(
  "src-tauri\target\debug",
  "src-tauri\target\release\.fingerprint",
  "src-tauri\target\release\build",
  "src-tauri\target\release\deps",
  "src-tauri\target\release\examples",
  "src-tauri\target\release\incremental"
)

foreach ($path in $targetCacheDirs) {
  Remove-InProject $path -Recurse
}

$targetCacheFiles = @(
  "src-tauri\target\.rustc_info.json",
  "src-tauri\target\CACHEDIR.TAG",
  "src-tauri\target\release\desktop_note.d",
  "src-tauri\target\release\desktop_note.pdb"
)

foreach ($path in $targetCacheFiles) {
  Remove-InProject $path
}

Write-Output "Cleaned generated files under $rootPath"
