$ErrorActionPreference = 'Stop'

$expectedSkills = @(
    'project-context',
    'architecture',
    'backend',
    'frontend',
    'database',
    'git-workflow',
    'scrum'
)

$skillsRoot = Join-Path $PSScriptRoot '..\skills'
$failures = [System.Collections.Generic.List[string]]::new()

foreach ($skillName in $expectedSkills) {
    $skillFile = Join-Path $skillsRoot "$skillName\SKILL.md"

    if (-not (Test-Path -LiteralPath $skillFile -PathType Leaf)) {
        $failures.Add("Missing skill file: $skillFile")
        continue
    }

    $content = Get-Content -Raw -LiteralPath $skillFile
    $frontmatter = [regex]::Match($content, '(?s)\A---\r?\n(?<yaml>.*?)\r?\n---')

    if (-not $frontmatter.Success) {
        $failures.Add("Invalid YAML frontmatter: $skillFile")
        continue
    }

    $yaml = $frontmatter.Groups['yaml'].Value
    $nameMatch = [regex]::Match($yaml, '(?m)^name:\s*(?<value>[^\r\n]+)\s*$')
    $descriptionMatch = [regex]::Match($yaml, '(?m)^description:\s*(?<value>[^\r\n]+)\s*$')

    if (-not $nameMatch.Success) {
        $failures.Add("Missing name: $skillFile")
    } elseif ($nameMatch.Groups['value'].Value.Trim() -ne $skillName) {
        $failures.Add("Skill name must match directory '$skillName': $skillFile")
    }

    if (-not $descriptionMatch.Success) {
        $failures.Add("Missing description: $skillFile")
    } elseif (-not $descriptionMatch.Groups['value'].Value.Trim().StartsWith('Use when')) {
        $failures.Add("Description must start with 'Use when': $skillFile")
    }

    if ($content -match '(?im)\b(TBD|TODO|FIXME)\b') {
        $failures.Add("Unfinished placeholder found: $skillFile")
    }
}

$repositoryRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$agentsFile = Join-Path $repositoryRoot 'AGENTS.md'
$projectContextFile = Join-Path $skillsRoot 'project-context\SKILL.md'
$activeSprintFiles = @($agentsFile, $projectContextFile)

foreach ($file in $activeSprintFiles) {
    $content = Get-Content -Raw -LiteralPath $file

    foreach ($required in @('Sprint 2', 'US-9', 'US-12', 'US-13', 'US-14', 'US-15')) {
        if ($content -notmatch [regex]::Escape($required)) {
            $failures.Add("Active Sprint context is missing '$required': $file")
        }
    }

    foreach ($excluded in @(
        'order cancellation',
        'admin order management',
        'inventory administration',
        'reporting',
        'password recovery'
    )) {
        if ($content -notmatch [regex]::Escape($excluded)) {
            $failures.Add("Sprint 3 exclusion is missing '$excluded': $file")
        }
    }
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { [Console]::Error.WriteLine($_) }
    exit 1
}

Write-Output "Validated $($expectedSkills.Count) project skills."
