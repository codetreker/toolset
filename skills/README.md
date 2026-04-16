# Skills

OpenClaw skills for multi-agent engineering teams.

Public repo — no private info allowed.

## Skills

### Team Management
| Skill | Description |
|-------|------------|
| `team-lead` | Team lead / engineering manager workflow |
| `delegate-not-do` | Work delegation — main session dispatches, subagents execute |
| `project-ops` | Project channel lifecycle, project memory, context loading |

### Team Crew
| Skill | Description |
|-------|------------|
| `arch-crew` | Architect — design docs, tech decisions, code review |
| `dev-crew` | Developer — coding, testing, PRs |
| `pm-crew` | Product Manager — product definition, requirements, PRDs |
| `qa-crew` | QA — acceptance testing, e2e verification, quality standards |

### Knowledge
| Skill | Description |
|-------|------------|
| `something-worth-wiki` | Guide for what's worth writing to a wiki and how to write it |
| `messaging` | Cross-platform messaging rules (mentions, channels, formatting) |

## Install

Copy the skill folder to your OpenClaw skills directory:

```bash
# Global (all agents)
cp -r <skill-name> ~/.openclaw/skills/

# Per-agent (workspace-specific)
cp -r <skill-name> ~/.openclaw/workspace/skills/       # main agent
cp -r <skill-name> ~/.openclaw/workspace-<id>/skills/  # other agents
```

Note: OpenClaw does not follow symlinks. Use copies.

## License

MIT
