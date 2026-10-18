param([switch]$BuildOnly, [int]$Port = 4000)

$ErrorActionPreference = 'Stop'
$blogRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$toolsRoot = Join-Path (Split-Path $blogRoot -Parent) '.tools'
$originalPath = $env:PATH
$originalBundlePath = $env:BUNDLE_PATH
$originalMsysPath = $env:MSYS2_PATH

try {
    # Prefer the caller's Ruby; otherwise reuse this workspace's portable tools.
    if (-not (Get-Command bundle -ErrorAction SilentlyContinue)) {
        $portableRuby = Get-ChildItem -LiteralPath $toolsRoot -Directory -Filter 'rubyinstaller-*-x64' -ErrorAction SilentlyContinue |
            Where-Object { Test-Path (Join-Path $_.FullName 'bin\ruby.exe') } |
            Sort-Object Name -Descending | Select-Object -First 1
        if (-not $portableRuby) { throw 'Install Ruby with DevKit and run bundle install first. See README.md.' }
        $env:PATH = (Join-Path $portableRuby.FullName 'bin') + ';' + $env:PATH
        $env:BUNDLE_PATH = Join-Path $toolsRoot 'gems'
        $env:MSYS2_PATH = Join-Path $toolsRoot 'msys64'
    }
    Push-Location $blogRoot
    try {
        if ($BuildOnly) { & bundle exec jekyll build }
        else { & bundle exec jekyll serve --host 127.0.0.1 --port $Port --no-watch }
        if ($LASTEXITCODE -ne 0) { throw "Jekyll exited with code $LASTEXITCODE" }
    } finally { Pop-Location }
} finally {
    $env:PATH = $originalPath
    $env:BUNDLE_PATH = $originalBundlePath
    $env:MSYS2_PATH = $originalMsysPath
}
