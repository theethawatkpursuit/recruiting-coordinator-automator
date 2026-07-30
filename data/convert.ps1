# Define the input CSV (HR dataset) and output JS file paths.
$csvPath = "c:\Users\theet\OneDrive\Documents\RecruitFlow\data\HRDataset_v14.csv"
$jsPath = "c:\Users\theet\OneDrive\Documents\RecruitFlow\js\hr-data.js"

# Read all lines from the CSV file and grab the first line as the header row.
$lines = [System.IO.File]::ReadAllLines($csvPath)
$header = $lines[0].Trim()

# Parse a single CSV line into an array of field values, handling quoted fields
# and escaped double-quotes ("") inside quoted values.
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

# Parse the header row into column names.
$headers = ParseCSVLine $header

# Find the column index for each field we need from the HR dataset.
$srcIdx = [Array]::IndexOf($headers, "RecruitmentSource")
$engIdx = [Array]::IndexOf($headers, "EngagementSurvey")
$termIdx = [Array]::IndexOf($headers, "Termd")
$satIdx = [Array]::IndexOf($headers, "EmpSatisfaction")
$perfIdx = [Array]::IndexOf($headers, "PerformanceScore")
$deptIdx = [Array]::IndexOf($headers, "Department")
$mgrIdx = [Array]::IndexOf($headers, "ManagerName")

# Print the found column indices for debugging/verification.
Write-Host "Columns found: src=$srcIdx eng=$engIdx term=$termIdx sat=$satIdx perf=$perfIdx dept=$deptIdx mgr=$mgrIdx"

# Build aggregated stats per recruitment source: count, engagement sum,
# termination count, and satisfaction sum.
$sourceStats = @{}

# Loop through every data row (skip the header at index 0).
for ($i = 1; $i -lt $lines.Count; $i++) {
    $line = $lines[$i].Trim()
    if ($line -eq "") { continue }
    
    # Parse the row and extract the recruitment source; skip if empty.
    $cells = ParseCSVLine $line
    $src = $cells[$srcIdx].Trim()
    if ($src -eq "") { continue }
    
    # Initialize the accumulator for this source on first encounter.
    if (-not $sourceStats.ContainsKey($src)) {
        $sourceStats[$src] = @{
            count = 0
            engagementSum = 0.0
            termCount = 0
            satisfactionSum = 0.0
        }
    }
    
    # Increment the count and accumulate engagement, termination, and satisfaction values.
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

# Build the JavaScript output file from the aggregated stats.
$js = "// Auto-generated from HRDataset_v14.csv`n"
$js += "// Source-level predictive analytics`n"
$js += "var HR_SOURCE_STATS = {`n"

# Loop through each source and write its stats as a JS object property.
$keys = @($sourceStats.Keys)
for ($k = 0; $k -lt $keys.Count; $k++) {
    $src = $keys[$k]
    $s = $sourceStats[$src]
    $avgEng = if ($s.count -gt 0) { [math]::Round($s.engagementSum / $s.count, 2) } else { 0 }
    $avgSat = if ($s.count -gt 0) { [math]::Round($s.satisfactionSum / $s.count, 2) } else { 0 }
    $turnover = if ($s.count -gt 0) { [math]::Round(($s.termCount / $s.count) * 100, 1) } else { 0 }
    
    # Escape single quotes in the source name and add a comma between entries (not after the last).
    $escapedSrc = $src -replace "'", "\'"
    $comma = if ($k -lt $keys.Count - 1) { "," } else { "" }
    $js += "  '$escapedSrc': { count: $($s.count), avgEngagement: $avgEng, avgSatisfaction: $avgSat, turnoverPct: $turnover, terminated: $($s.termCount) }$comma`n"
}

# Close the JS object.
$js += "};`n"

# Write the generated JavaScript to the output file and print a confirmation message.
[System.IO.File]::WriteAllText($jsPath, $js)
Write-Host "Generated $jsPath with $($keys.Count) sources"
