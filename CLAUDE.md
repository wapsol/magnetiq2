- After implementing new code, always update the related parts of the spec at docs/spec_v2/.  Be thorough, and list which parts of the spec you have updated. Check for inconsistencies in the whole specification, and flag them.
- Respect the configurations in site.conf
- Our container repo is at https://crepo.re-cloud.io. The project is called "magnetiq" and we are using the repository magnetiq/v2

## Knowledge Base Management (kb.md)

### Purpose
The `kb.md` file is a living knowledge base that captures all learnings, decisions, gotchas, and insights discovered during the development of this project. It serves as the institutional memory of the project, progressively built by Claude Code throughout the development lifecycle.

### When to Update kb.md
Update kb.md whenever:
- The user explicitly says "add that to kb" or similar phrases ("document this", "remember this", "note this down")
- Important architectural decisions are made or discovered
- Non-obvious system behaviors are identified
- Bug fixes reveal underlying system quirks
- Integration patterns or gotchas are documented
- Performance considerations are discovered
- Deployment lessons are learned
- Configuration nuances are identified

### Structure and Content
- **Progressive Building**: kb.md grows organically as the project evolves
- **Actionable Insights**: Focus on practical knowledge that helps future development
- **Context Matters**: Include enough context so entries make sense months later
- **Categories**: Organize by topic (Architecture, Deployment, Development, Debugging, etc.)

### Value Proposition
At any point in the project lifecycle, summarizing kb.md provides:
- A comprehensive overview of all project learnings
- Quick reference for common issues and solutions
- Onboarding documentation for new team members or AI-coder instances
- Historical context for architectural decisions
- Lessons learned that can be applied to future projects

### Location
The knowledge base should be maintained at: `docs/kb.md`

### Example Entry Format
```markdown
## [Topic/Category]
**Date**: YYYY-MM-DD
**Context**: Brief description of the situation
**Finding**: What was discovered
**Impact**: Why this matters
**Action**: What to do about it
```

**Remember**: When the user asks to add something to the knowledge base, always append to kb.md and confirm what was added.
- learn the above