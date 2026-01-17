$file1 = 'public\js\zahlungsinformationen.js'
$file2 = 'public\js\fahrzeuge.js'

$content1 = [System.IO.File]::ReadAllText($file1, [System.Text.Encoding]::UTF8)
$content2 = [System.IO.File]::ReadAllText($file2, [System.Text.Encoding]::UTF8)

$content1 = $content1 -replace 'T[^\x00-\x7F]ren', 'Türen'
$content2 = $content2 -replace 'T[^\x00-\x7F]ren', 'Türen'

[System.IO.File]::WriteAllText($file1, $content1, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($file2, $content2, [System.Text.Encoding]::UTF8)

Write-Output "Dosyalar düzeltildi"

