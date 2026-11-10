try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/checkout?type=robux&amount=1000' -UseBasicParsing -TimeoutSec 15
    Write-Output "STATUS: $($r.StatusCode)"
    $content = $r.Content
    if ($content.Length -gt 3000) { $content = $content.Substring(0, 3000) }
    Write-Output $content
} catch {
    Write-Output "ERROR: $_"
}