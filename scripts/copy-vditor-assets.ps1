$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $projectRoot "node_modules\vditor\dist"
$vendorRoot = Join-Path $projectRoot "public\vendor\vditor"
$target = Join-Path $vendorRoot "dist"

if (-not (Test-Path -LiteralPath $source)) {
  throw "Vditor dist directory not found: $source. Run npm install first."
}

if (Test-Path -LiteralPath $vendorRoot) {
  Remove-Item -LiteralPath $vendorRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $target -Force | Out-Null
Copy-Item -Path (Join-Path $source "*") -Destination $target -Recurse -Force

Write-Output "Copied Vditor assets to $target"
