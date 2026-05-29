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
Remove-InProject "src-tauri\target" -Recurse

Write-Output "Cleaned generated files under $rootPath"
