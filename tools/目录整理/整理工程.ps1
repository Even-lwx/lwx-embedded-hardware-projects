param([switch]$VerifyOnly)
$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath('D:\lwx\lwx-project').TrimEnd('\')
$projects = @('AD7682','ADS124S08_RTD_Acq','HookWeightModule','QI5W-R-Ver2.0','QiRec-5-R','QiRec-5-T','STM32F103RCT6最小系统板','Triple 1S Battery Charger','UML244R')
$gitExe = 'C:\Users\嵌入式软件实习生电脑02\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
$actions = [Collections.Generic.List[object]]::new()
$tracked = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($project in $projects) {
    $projectRoot = Join-Path $workspace $project
    foreach ($file in (& $gitExe -c core.quotepath=false -C $projectRoot ls-files)) {
        [void]$tracked.Add([IO.Path]::GetFullPath((Join-Path $projectRoot $file)))
    }
}
function Assert-WorkspacePath([string]$Target) {
    $absolute = [IO.Path]::GetFullPath($Target)
    if (-not $absolute.StartsWith($workspace + '\', [StringComparison]::OrdinalIgnoreCase)) { throw "路径超出工作目录：$absolute" }
    return $absolute
}
function Get-SafeTree([string]$Directory) {
    foreach ($item in (Get-ChildItem -LiteralPath $Directory -Force)) {
        if ($item.Name -eq '.git' -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) { continue }
        $item
        if ($item.PSIsContainer) { Get-SafeTree $item.FullName }
    }
}
function Move-Safely([string]$Source, [string]$Destination, [string]$Reason) {
    $src = Assert-WorkspacePath $Source
    $dst = Assert-WorkspacePath $Destination
    if (-not (Test-Path -LiteralPath $src)) {
        if (Test-Path -LiteralPath $dst) { $actions.Add([pscustomobject]@{操作='已归档';原路径=$src;新路径=$dst;原因=$Reason}) }
        return
    }
    if ((Get-Item -LiteralPath $src -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "不移动链接目录：$src" }
    $files = if ((Get-Item -LiteralPath $src -Force).PSIsContainer) { @(Get-SafeTree $src | Where-Object {-not $_.PSIsContainer}) } else { @(Get-Item -LiteralPath $src) }
    if (Test-Path -LiteralPath $dst) {
        if ($files.Count -eq 0) { $actions.Add([pscustomobject]@{操作='保留空目录';原路径=$src;新路径=$dst;原因='文件已归档，原空目录被其他进程占用'}); return }
        throw "目标已存在，停止覆盖：$dst"
    }
    $hashes = @($files | ForEach-Object { [pscustomobject]@{ Tail = $_.FullName.Substring($src.Length); Hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash } })
    New-Item -ItemType Directory -Path (Split-Path -Parent $dst) -Force | Out-Null
    Move-Item -LiteralPath $src -Destination $dst
    foreach ($entry in $hashes) {
        $newFile = $dst + $entry.Tail
        if ((Get-FileHash -LiteralPath $newFile -Algorithm SHA256).Hash -ne $entry.Hash) { throw "移动后内容校验失败：$newFile" }
    }
    $actions.Add([pscustomobject]@{操作='移动';原路径=$src;新路径=$dst;原因=$Reason;校验文件数=$files.Count})
}
function Remove-Generated([string]$Target, [string]$Reason) {
    $absolute = Assert-WorkspacePath $Target
    if (-not (Test-Path -LiteralPath $absolute)) { return }
    $item = Get-Item -LiteralPath $absolute -Force
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "不递归删除链接：$absolute" }
    foreach ($file in $tracked) {
        if ($file -eq $absolute -or $file.StartsWith($absolute+'\',[StringComparison]::OrdinalIgnoreCase)) {
            $actions.Add([pscustomobject]@{操作='保留';原路径=$absolute;新路径='';原因='目录包含原工程已跟踪的文件，保留以避免误删'})
            return
        }
    }
    if ($item.PSIsContainer -and @(Get-ChildItem -LiteralPath $absolute -Recurse -Force | Where-Object {$_.Attributes -band [IO.FileAttributes]::ReparsePoint}).Count) { throw "删除目标内含链接：$absolute" }
    Remove-Item -LiteralPath $absolute -Recurse -Force
    $actions.Add([pscustomobject]@{操作='删除';原路径=$absolute;新路径='';原因=$Reason})
}

# 固件、硬件设计、器件资料与测量原始数据在整理前后应保持逐字节一致。
$protected = @{}
foreach ($project in $projects) {
    foreach ($directory in @('code','pcb','doc')) {
        $sourceRoot = Join-Path (Join-Path $workspace $project) $directory
        if (-not (Test-Path -LiteralPath $sourceRoot)) { continue }
        foreach ($file in (Get-SafeTree $sourceRoot | Where-Object {-not $_.PSIsContainer -and $_.FullName -notmatch '\\(__pycache__|__Previews|Project Logs[^\\]*)\\' -and $_.Extension -match '^\.(c|h|ioc|uvprojx|prjpcb|pcbdoc|schdoc|pcblib|schlib|pdf|csv)$'})) {
            $protected[$file.FullName] = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
        }
    }
}
if ($VerifyOnly) { Write-Output "已检查 $($protected.Count) 个关键文件。"; exit }

# 删除 Python 字节码、Altium 预览与运行日志；保留历史备份和生产输出。
foreach ($project in $projects) {
    $candidates = @(Get-SafeTree (Join-Path $workspace $project) | Where-Object {$_.PSIsContainer -and ($_.Name -in @('__pycache__','__Previews') -or $_.Name -like 'Project Logs*')} | Sort-Object {$_.FullName.Length} -Descending)
    foreach ($item in $candidates) { Remove-Generated $item.FullName '可由工具重新生成的缓存、预览或运行日志' }
}

$ad = Join-Path $workspace 'AD7682'
# 只移除依赖链接本身，不进入或删除共享运行时。
foreach ($junction in @((Join-Path $workspace 'sheet_build\node_modules'), (Join-Path $ad '.codex-build\node_modules'))) {
    if (Test-Path -LiteralPath $junction) {
        $checked = Assert-WorkspacePath $junction
        if (-not ((Get-Item -LiteralPath $checked -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "预期为依赖链接：$checked" }
        Remove-Item -LiteralPath $checked -Force
        $actions.Add([pscustomobject]@{操作='移除依赖链接';原路径=$checked;新路径='';原因='共享依赖本体保留'})
    }
}
Move-Safely (Join-Path $workspace 'sheet_build') (Join-Path $workspace 'tools\工程清单') '保留工作簿生成脚本与预览，集中放入工具目录'
Move-Safely (Join-Path $ad '.codex-build') (Join-Path $workspace '资料归档\其他资料\周小闹课程汇报\构建') '与电子工程无关的课程汇报，保留源脚本和候选演示文稿'
Move-Safely (Join-Path $ad '.codex-finalizer') (Join-Path $workspace '资料归档\其他资料\周小闹课程汇报\校验') '课程汇报校验记录'
Move-Safely (Join-Path $ad 'assets') (Join-Path $workspace '资料归档\其他资料\周小闹课程汇报\素材') '课程汇报图片素材'

# 根目录散落的分析程序归入工具目录，测量表格与旧代码包独立归档。
foreach ($name in @('analyze.py','append_pressure.py','compare.py','fit.py','inspect_csv.py','rebuild_report.py','seg.py')) {
    Move-Safely (Join-Path $ad $name) (Join-Path $ad ('tools\analysis\'+$name)) '历史测量分析与报告生成脚本'
}
Move-Safely (Join-Path $ad 'LP5907_3-2V电压变化.xlsx') (Join-Path $ad 'data\measurements\LP5907_3-2V电压变化.xlsx') '保留原始测量工作簿'
Move-Safely (Join-Path $ad 'AD7682_code.zip') (Join-Path $ad 'archive\source_snapshots\AD7682_code.zip') '保留旧版源码快照，不将压缩包视为当前开发源码'

# 原 output 中所有报告及发布包均保留，仅按用途分组。
foreach ($item in @(Get-ChildItem -LiteralPath (Join-Path $ad 'output') -Force | Where-Object {$_.Name -notin @('reports','releases')})) {
    $group = if ($item.Name -like 'AD7682Host*') { 'releases' } else { 'reports' }
    Move-Safely $item.FullName (Join-Path $ad ('output\'+$group+'\'+$item.Name)) '按上位机发布包与实验报告分类'
}

# tmp 内有独有报告生成代码；先清理编译产物，再整体保留为历史分析工作区。
Remove-Generated (Join-Path $ad 'tmp\host-build') 'PyInstaller 可重新生成的构建缓存，发布包已保留'
foreach ($item in @(Get-SafeTree (Join-Path $ad 'tmp') | Where-Object {-not $_.PSIsContainer -and ($_.Extension -in @('.axf','.o','.pyc','.log'))})) {
    Remove-Generated $item.FullName '临时编译目标文件、字节码或构建日志'
}
Move-Safely (Join-Path $ad 'tmp') (Join-Path $ad 'tools\analysis\workspace') '保留历史分析脚本、测试桩、报告依赖与参考材料'

# 两个原理图文本是解析结果；保留便于复核，归入分析目录而非根目录。
foreach ($name in @('sch.txt','sch_latest.txt')) {
    Move-Safely (Join-Path $workspace ('ADS124S08_RTD_Acq\'+$name)) (Join-Path $workspace ('ADS124S08_RTD_Acq\analysis\schematic\'+$name)) '原理图解析结果集中归档'
}
foreach ($item in @(Get-ChildItem -LiteralPath (Join-Path $workspace 'HookWeightModule') -Directory | Where-Object {$_.Name -like 'analysis_output*'})) {
    Move-Safely $item.FullName (Join-Path $workspace ('HookWeightModule\output\reports\'+$item.Name)) '保留称重实验分析结果，集中存放'
}

# 原始 PDF 已存在时，其提取文本、页面截图及 OLE 解包数据可重新生成。
foreach ($name in @('ad7682.txt','Components6_Data.bin','Nets6_Data.bin','Pads6_Data.bin','sch_fileheader.bin','stream_0.bin','stream_1.bin','stream_2.bin','p300-25.png','page-24.png','page-25.png','page26.png','page-29.png','page-30.png','tmp_page-24.png')) {
    Remove-Generated (Join-Path $ad $name) '由器件 PDF 或 Altium 源文件提取的页面、文本或二进制中间数据'
}
# 临时下载文件保留进参考资料，避免将不完整下载与正式数据手册混淆。
foreach ($name in @('tmp_bq24040.pdf','tmp_bq24040.txt','tmp_lps22hh.pdf')) {
    Move-Safely (Join-Path $ad $name) (Join-Path $ad ('archive\reference_downloads\'+$name)) '保留历史下载，仅作参考；使用前核对文件完整性'
}

foreach ($file in $protected.Keys) {
    if (-not (Test-Path -LiteralPath $file) -or (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $protected[$file]) { throw "关键文件变化：$file" }
}
$report = [pscustomobject]@{整理时间=(Get-Date -Format 'yyyy-MM-dd HH:mm:ss');关键文件校验数=$protected.Count;关键文件校验='通过';操作记录=$actions}
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $PSScriptRoot '整理记录.json') -Encoding utf8
Write-Output "整理完成：$($actions.Count) 项操作，$($protected.Count) 个关键文件内容保持一致。"
