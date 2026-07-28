$csvPath = "c:\Users\theet\OneDrive\Documents\RecruitFlow\data\HRDataset_v14.csv"
$jsPath = "c:\Users\theet\OneDrive\Documents\RecruitFlow\js\hr-data.js"

$lines = [System.IO.File]::ReadAllLines($csvPath)
$header = $lines[0].Trim()

# Parse header to find column indices
function ParseCSVLine($text) {
    $ret = @()
    $inQuote = $false
    $value = ""
    for ($i = 0; $i -lt $text.Length; $i++) {
        $char = $text[$i]
        if ($inQuote) {
            if ($char -eq '"') {
                if ($i -lt $text.Length - 1 -and $text[$i+1] -eq '"') {
                    $value += '"'
                    $i++
                } else {
                    $inQuote = $false
                }
            } else {
                $value += $char
            }
        } else {
            if ($char -eq '"') {
                $inQuote = $true
            } elseif ($char -eq ',') {
                $ret += $value
                $value = ""
            } else {
                $value += $char
            }
        }
    }
    $ret += $value
    return $ret
}

$headers = ParseCSVLine $header

# Find indices
$srcIdx = [Array]::IndexOf($headers, "RecruitmentSource")
$engIdx = [Array]::IndexOf($headers, "EngagementSurvey")
$termIdx = [Array]::IndexOf($headers, "Termd")
$satIdx = [Array]::IndexOf($headers, "EmpSatisfaction")
$perfIdx = [Array]::IndexOf($headers, "PerformanceScore")
$deptIdx = [Array]::IndexOf($headers, "Department")
$mgrIdx = [Array]::IndexOf($headers, "ManagerName")

Write-Host "Columns found: src=$srcIdx eng=$engIdx term=$termIdx sat=$satIdx perf=$perfIdx dept=$deptIdx mgr=$mgrIdx"

# Build aggregated stats per source
$sourceStats = @{}

for ($i = 1; $i -lt $lines.Count; $i++) {
    $line = $lines[$i].Trim()
    if ($line -eq "") { continue }
    
    $cells = ParseCSVLine $line
    $src = $cells[$srcIdx].Trim()
    if ($src -eq "") { continue }
    
    if (-not $sourceStats.ContainsKey($src)) {
        $sourceStats[$src] = @{
            count = 0
            engagementSum = 0.0
            termCount = 0
            satisfactionSum = 0.0
        }
    }
    
    $sourceStats[$src].count++
    $eng = 0.0
    if ([double]::TryParse($cells[$engIdx].Trim(), [ref]$eng)) {
        $sourceStats[$src].engagementSum += $eng
    }
    $term = 0
    if ([int]::TryParse($cells[$termIdx].Trim(), [ref]$term)) {
        $sourceStats[$src].termCount += $term
    }
    $sat = 0.0
    if ([double]::TryParse($cells[$satIdx].Trim(), [ref]$sat)) {
        $sourceStats[$src].satisfactionSum += $sat
    }
}

# Build JS output
$js = "// Auto-generated from HRDataset_v14.csv`n"
$js += "// Source-level predictive analytics`n"
$js += "var HR_SOURCE_STATS = {`n"

$keys = @($sourceStats.Keys)
for ($k = 0; $k -lt $keys.Count; $k++) {
    $src = $keys[$k]
    $s = $sourceStats[$src]
    $avgEng = if ($s.count -gt 0) { [math]::Round($s.engagementSum / $s.count, 2) } else { 0 }
    $avgSat = if ($s.count -gt 0) { [math]::Round($s.satisfactionSum / $s.count, 2) } else { 0 }
    $turnover = if ($s.count -gt 0) { [math]::Round(($s.termCount / $s.count) * 100, 1) } else { 0 }
    
    $escapedSrc = $src -replace "'", "\'"
    $comma = if ($k -lt $keys.Count - 1) { "," } else { "" }
    $js += "  '$escapedSrc': { count: $($s.count), avgEngagement: $avgEng, avgSatisfaction: $avgSat, turnoverPct: $turnover, terminated: $($s.termCount) }$comma`n"
}

$js += "};`n"

[System.IO.File]::WriteAllText($jsPath, $js)
Write-Host "Generated $jsPath with $($keys.Count) sources"
