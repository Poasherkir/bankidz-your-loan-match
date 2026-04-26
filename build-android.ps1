# build-android.ps1 — BankiDZ full Android build from PowerShell
#
# PREREQUISITES (install before first run):
#   1. Node.js 18+          https://nodejs.org
#   2. JDK 17+              https://adoptium.net
#   3. Android SDK          Install via Android Studio, then set:
#                           $env:ANDROID_HOME = "C:\Users\<you>\AppData\Local\Android\Sdk"
#
# USAGE:
#   .\build-android.ps1             # debug APK (default)
#   .\build-android.ps1 -Release    # release APK (unsigned)

param(
    [switch]$Release
)

$BuildType = if ($Release) { "release" } else { "debug" }
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

function Step($n, $total, $msg) {
    Write-Host ""
    Write-Host "  [$n/$total] $msg" -ForegroundColor Cyan
}

function OK($msg)   { Write-Host "        $msg" -ForegroundColor Green }
function WARN($msg) { Write-Host "        $msg" -ForegroundColor Yellow }
function FAIL($msg) { throw $msg }

Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Blue
Write-Host "    BankiDZ Android Build  [$BuildType]     " -ForegroundColor Blue
Write-Host "  ==========================================" -ForegroundColor Blue

Set-Location $Root

# ─── 0. Prerequisite checks ──────────────────────────────────────────────────
Step 0 5 "Checking prerequisites..."

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    FAIL "Node.js not found. Install from https://nodejs.org"
}
OK "Node.js $(node --version)"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    FAIL "npm not found. Re-install Node.js from https://nodejs.org"
}
OK "npm $(npm --version)"

if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
    WARN "ANDROID_HOME is not set — Gradle may fail."
    WARN "Set it before running, e.g.:"
    WARN '  $env:ANDROID_HOME = "C:\Users\<you>\AppData\Local\Android\Sdk"'
} else {
    $sdkPath = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { $env:ANDROID_SDK_ROOT }
    OK "Android SDK: $sdkPath"
}

# ─── 1. Install npm dependencies ─────────────────────────────────────────────
Step 1 5 "Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { FAIL "npm install failed" }
OK "Dependencies installed."

# ─── 2. Build web app (SPA for Capacitor) ────────────────────────────────────
Step 2 5 "Building web app (SPA)..."
npm run build
if ($LASTEXITCODE -ne 0) { FAIL "npm run build failed" }
OK "Web build complete → dist/"

# ─── 3. Add Android platform (first time) / sync ─────────────────────────────
Step 3 5 "Syncing Capacitor → Android..."
if (-not (Test-Path "$Root\android")) {
    WARN "Android platform not found — adding it now (this takes a minute)..."
    npx cap add android
    if ($LASTEXITCODE -ne 0) { FAIL "cap add android failed" }
} else {
    OK "Android platform already present."
}
npx cap sync android
if ($LASTEXITCODE -ne 0) { FAIL "cap sync failed" }
OK "Assets synced to android/."

# ─── 4. Apply app icon ───────────────────────────────────────────────────────
Step 4 5 "Applying app icon..."
$logo = "$Root\public\logo.png"
if (Test-Path $logo) {
    $mipmaps = @("mipmap-mdpi","mipmap-hdpi","mipmap-xhdpi","mipmap-xxhdpi","mipmap-xxxhdpi")
    foreach ($m in $mipmaps) {
        $dir = "$Root\android\app\src\main\res\$m"
        if (Test-Path $dir) {
            Copy-Item $logo "$dir\ic_launcher.png"       -Force
            Copy-Item $logo "$dir\ic_launcher_round.png" -Force
        }
    }
    OK "Icon applied from public\logo.png"
} else {
    WARN "public\logo.png not found — using default Capacitor icon."
    WARN "Save your logo there and re-run to apply it."
}

# ─── 5. Gradle build ─────────────────────────────────────────────────────────
Step 5 5 "Building Android APK with Gradle ($BuildType)..."
Push-Location "$Root\android"
try {
    $task = if ($Release) { "assembleRelease" } else { "assembleDebug" }
    .\gradlew.bat $task --no-daemon
    if ($LASTEXITCODE -ne 0) { FAIL "Gradle build failed (task: $task)" }
} finally {
    Pop-Location
}

# ─── Done — locate and copy APK ──────────────────────────────────────────────
$apkGlob = if ($Release) {
    "$Root\android\app\build\outputs\apk\release\*.apk"
} else {
    "$Root\android\app\build\outputs\apk\debug\*.apk"
}

$apk = Get-ChildItem $apkGlob -ErrorAction SilentlyContinue | Select-Object -First 1
if ($apk) {
    $dest = "$Root\BankiDZ-$BuildType.apk"
    Copy-Item $apk.FullName $dest -Force
    Write-Host ""
    Write-Host "  ==========================================" -ForegroundColor Green
    Write-Host "    BUILD SUCCESS!" -ForegroundColor Green
    Write-Host "    APK: $dest" -ForegroundColor Green
    Write-Host "  ==========================================" -ForegroundColor Green
} else {
    WARN "Build finished but APK not found at: $apkGlob"
}
