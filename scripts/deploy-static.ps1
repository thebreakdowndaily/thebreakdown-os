param(
    [string]$Dist = "dist-static"
)

Write-Host "=== Static Deployment: The Breakdown OS ===" -ForegroundColor Cyan

# 1. Clean and create dist directory
if (Test-Path -LiteralPath $Dist) { Remove-Item -Recurse -Force -LiteralPath $Dist }
New-Item -ItemType Directory -Path $Dist | Out-Null
Write-Host "Created $Dist directory" -ForegroundColor Green

# 2. Copy HTML files as directories with index.html for clean URLs
$sourceRoot = ".next/server/app"
$htmlFiles = Get-ChildItem -Recurse -Filter "*.html" -LiteralPath $sourceRoot
$sourceRootFull = (Get-Item -LiteralPath $sourceRoot).FullName

foreach ($htmlFile in $htmlFiles) {
    $relPath = $htmlFile.FullName.Substring($sourceRootFull.Length + 1)
    # e.g. "story/mgnrega-reform.html" or "index.html"
    
    if ($relPath -eq "index.html") {
        # Root page: dist/index.html
        $destPath = Join-Path -Path $Dist -ChildPath "index.html"
        Copy-Item -LiteralPath $htmlFile.FullName -Destination $destPath
    } elseif ($relPath -eq "_not-found.html") {
        # Also serve as the route _not-found/index.html
        $notFoundDir = Join-Path -Path $Dist -ChildPath "_not-found"
        New-Item -ItemType Directory -Path $notFoundDir -Force | Out-Null
        Copy-Item -LiteralPath $htmlFile.FullName -Destination (Join-Path -Path $notFoundDir -ChildPath "index.html")
        # 404 page: dist/404.html (Cloudflare convention for custom 404)
        $destPath = Join-Path -Path $Dist -ChildPath "404.html"
        Copy-Item -LiteralPath $htmlFile.FullName -Destination $destPath
    } else {
        # Other pages: create directory + index.html
        # "story/mgnrega-reform.html" -> dist/story/mgnrega-reform/index.html
        $dirPath = $relPath -replace '\.html$', ''
        $destDir = Join-Path -Path $Dist -ChildPath $dirPath
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        $destPath = Join-Path -Path $destDir -ChildPath "index.html"
        Copy-Item -LiteralPath $htmlFile.FullName -Destination $destPath
    }
}

# 2.5 Copy Route Handler body files
$bodyFiles = Get-ChildItem -Recurse -Filter "*.body" -LiteralPath $sourceRoot -ErrorAction SilentlyContinue
foreach ($bodyFile in $bodyFiles) {
    $relPath = $bodyFile.FullName.Substring($sourceRootFull.Length + 1)
    $baseName = $relPath -replace '\.body$', ''
    # If the base name contains a file extension (e.g. sitemap.xml, robots.txt, rss),
    # copy the body as the file itself; otherwise create directory/index.html
    if ($baseName -match '\.\w+$') {
        $destPath = Join-Path -Path $Dist -ChildPath $baseName
        Copy-Item -LiteralPath $bodyFile.FullName -Destination $destPath
        Write-Host "Copied $baseName to dist-static" -ForegroundColor Green
    } else {
        $destDir = Join-Path -Path $Dist -ChildPath $baseName
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item -LiteralPath $bodyFile.FullName -Destination (Join-Path -Path $destDir -ChildPath "index.html")
    }
}

# 3. Copy static assets
$staticSource = ".next/static"
if (Test-Path -LiteralPath $staticSource) {
    $staticDest = Join-Path -Path $Dist -ChildPath "_next\static"
    Copy-Item -Recurse -LiteralPath $staticSource -Destination $staticDest
    Write-Host "Copied .next/static/ -> _next/static/" -ForegroundColor Green
}

# 4. Copy public/ assets
$publicDir = "public"
if (Test-Path -LiteralPath $publicDir) {
    Get-ChildItem -LiteralPath $publicDir | ForEach-Object {
        $dest = Join-Path -Path $Dist -ChildPath $_.Name
        if ($_.PSIsContainer) {
            Copy-Item -Recurse -LiteralPath $_.FullName -Destination $dest
        } else {
            Copy-Item -LiteralPath $_.FullName -Destination $dest
        }
    }
    Write-Host "Copied public/" -ForegroundColor Green
}

# 5. Generate _headers for cache control + CSP
$headers = @(
    "# HTML pages: short CDN cache so updates appear immediately",
    "#",
    "/",
    "  Cache-Control: public, max-age=0, must-revalidate",
    "  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://thebreakdown.in https://www.googletagmanager.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://thebreakdown.in https://placehold.co; font-src 'self' data:; connect-src 'self' https://thebreakdown.in https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com https://o*.ingest.sentry.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    "/*",
    "  Cache-Control: public, max-age=0, must-revalidate",
    "  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://thebreakdown.in https://www.googletagmanager.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://thebreakdown.in https://placehold.co; font-src 'self' data:; connect-src 'self' https://thebreakdown.in https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com https://o*.ingest.sentry.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    "",
    "# Static assets: long cache with immutable",
    "/_next/static/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "# images: medium cache",
    "/*.svg",
    "  Cache-Control: public, max-age=86400",
    "/*.png",
    "  Cache-Control: public, max-age=86400",
    "/*.jpg",
    "  Cache-Control: public, max-age=86400",
    "/*.jpeg",
    "  Cache-Control: public, max-age=86400",
    "/*.webp",
    "  Cache-Control: public, max-age=86400",
    "/*.ico",
    "  Cache-Control: public, max-age=86400",
    "",
    "# Fonts",
    "/_next/static/media/*",
    "  Cache-Control: public, max-age=31536000, immutable"
)
Set-Content -Path (Join-Path -Path $Dist -ChildPath "_headers") -Value ($headers -join "`n")
Write-Host "Generated _headers with cache control" -ForegroundColor Green

# 6. Generate _redirects - Cloudflare handles directory/index.html routing natively
# But we need one to handle the root / -> index.html cleanly
$redirects = @(
    "/ /index.html 200"
)
Set-Content -Path (Join-Path -Path $Dist -ChildPath "_redirects") -Value ($redirects -join "`n")
Write-Host "Generated minimal _redirects" -ForegroundColor Green

# 7. Generate _routes.json
$routesJson = @{
    version = 1
    include = @("/*")
    exclude = @("/cdn-cgi/*")
} | ConvertTo-Json
Set-Content -Path (Join-Path -Path $Dist -ChildPath "_routes.json") -Value $routesJson

# Count pages
$pageCount = (Get-ChildItem -Recurse -Filter "index.html" -LiteralPath $Dist | Measure-Object).Count
Write-Host "=== Done: $pageCount pages in $Dist ===" -ForegroundColor Cyan
