# Auto-run build.sh whenever a module .css changes, so theme.css stays current.
# Leave it running:  powershell -ExecutionPolicy Bypass -File .\watch.ps1
$dir = $PSScriptRoot
& bash "$dir/build.sh"
$fsw = New-Object IO.FileSystemWatcher $dir, '*.css'
Write-Host "Watching $dir for changes... (Ctrl+C to stop)"
while ($true) {
  $c = $fsw.WaitForChanged([IO.WatcherChangeTypes]::All, 1000)
  if ($c.TimedOut -or $c.Name -eq 'theme.css') { continue }  # skip our own output
  Start-Sleep -Milliseconds 150                              # let the editor finish writing
  & bash "$dir/build.sh"
}
