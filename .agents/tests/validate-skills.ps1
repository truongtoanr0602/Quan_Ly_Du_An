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

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { [Console]::Error.WriteLine($_) }
    exit 1
}

Write-Output "Validated $($expectedSkills.Count) project skills."
