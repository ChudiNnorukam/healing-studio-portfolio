# BMAD-METHOD Implementation Guide
*Based on YouTube Tutorial: "Agile Coding Is HERE… 90% AI Coding Is Already Done With This"*

## Overview
This guide implements the BMAD-METHOD (Breakthrough Method for Agile AI-Driven Development) framework for the trauma-healing personal brand business project.

## Prerequisites
- Node.js installed
- Terminal access in your IDE (Cursor, Claude Code, or Windsurf)
- GitHub repository access

## Implementation Steps

### Phase 1: Initial Setup and Planning

#### Step 1: Install BMAD-METHOD Core System
```bash
# Navigate to your project directory
cd "/Users/chudinnorukam/Documents/Chudi's Prompt Engineering Portfolio"

# Run the BMAD installer
npx bmad-method install
```

**Installation Options:**
- Select: "Install BMAD agile core system"
- PRD sharding: **YES** (split into multiple files)
- Architecture sharding: **YES** (split into multiple files)
- IDE selection: **Cursor, Claude Code, Windsurf**
- Web bundles: **NO** (we'll follow the method shown in the video)

#### Step 2: Verify Installation
After installation, verify these folders are created:
- `.bmad-core/` - Core agents and workflows
- `.claude/` - Claude Code integration
- `.cursor/` - Cursor IDE integration
- `docs/` - Documentation folder (create manually)

#### Step 3: Create Documentation Structure
```bash
# Create docs folder
mkdir -p docs

# Place your existing architecture document
cp trauma-healing-architecture-audit.md docs/architecture.md
```

### Phase 2: Planning with AI Agents (Web UI)

#### Step 4: Get Team Fullstack File
1. Navigate to `BMAD-METHOD/dist/teams/`
2. Copy `team-fullstack.txt` content
3. Create new Gemini Gem or CustomGPT
4. Upload file with instructions: "Your critical operating instructions are attached, do not break character as directed"
5. Type `/help` to see available commands

#### Step 5: Generate PRD and Architecture
**Using the AI Team:**

1. **Brainstorm Phase:**
   - Use `*brainstorm` command
   - Describe: "Trauma healing personal brand business with AI-powered content generation, client management, and affiliate marketing"
   - Specify features: content management, client portal, payment processing, social media automation

2. **Product Manager Phase:**
   - Use `*pm` command
   - Use `*create-doc` command
   - Follow 5-stage PRD workflow
   - Download final PRD as `docs/prd.md`

3. **Architect Phase:**
   - Use `*architect` command
   - Use `*create-doc` command
   - Generate full architecture plan
   - Download as `docs/architecture.md`

### Phase 3: IDE Implementation

#### Step 6: Document Sharding
**In your IDE (Cursor/Claude Code):**

1. **Initialize PO Agent:**
   ```bash
   # In Cursor: Type "PO" and select the agent
   # In Claude Code: Use slash command
   ```

2. **Shard Documents:**
   ```bash
   *shard-doc docs/prd.md docs/prd
   *shard-doc docs/architecture.md docs/architecture
   ```

#### Step 7: Epic and Story Generation
**Initialize Scrum Master Agent:**
```bash
# In Cursor: Type "SM" and select
# In Claude Code: Use slash command
```

**Generate Epics:**
- Use `*draft` method
- Agent will detect missing epics and offer to generate them
- Select option 1 to auto-generate epics
- This creates 4 epics with 16 total stories

**Story Status Management:**
- Change story status from "draft" to "approved" manually
- Stories need approval before development can begin

#### Step 8: Development Implementation
**For each story (start with Story 1.1):**

1. **Initialize Dev Agent:**
   ```bash
   # In Cursor: Type "dev" and select
   # In Claude Code: Use slash command
   ```

2. **Implement Story:**
   - Agent asks which story to implement
   - Select story (e.g., "1.1" for first story)
   - Agent follows story exactly with subtasks
   - Status changes to "ready for review"

3. **Testing Phase:**
   - Initialize QA Agent in new chat
   - Use `*review` method
   - Agent checks implementation against requirements
   - Status changes to "done" after approval

#### Step 9: Iterative Development
**Repeat for all stories:**
- Story 1.1: Basic task creation and storage
- Story 1.2: Task list display and basic organization
- Continue through all 16 stories across 4 epics

## Key Workflow Principles

### Agent Management
- **Start each agent in a new chat** to avoid context issues
- **Clean handoffs** between agents
- **Status tracking** ensures proper workflow

### Story Lifecycle
1. **Draft** → Created by Scrum Master
2. **Approved** → Manual approval required
3. **Ready for Review** → Development complete
4. **Done** → QA approved

### Quality Assurance
- QA agent scans codebase for specific requirements
- Auto-fixes repetitive code with refactoring
- Only marks complete after verification

## Integration with Trauma-Healing Business

### Custom Agents Available
Your project already has specialized agents:
- **Trauma Healing Specialist (Aletheia)**
- **Business Strategist (Kairos)**
- **SEO & Social Media Automation Specialist (Eidolon)**
- **AI Copy Humanizer**

### Implementation Strategy
1. **Use existing BMAD core** for development workflow
2. **Integrate custom agents** for trauma-healing specific features
3. **Leverage existing content assets** in the development process
4. **Maintain agile methodology** for iterative improvement

## Expected Outcomes

### Phase 1 Results
- BMAD-METHOD fully installed and configured
- PRD and architecture documents generated
- Development workflow established

### Phase 2 Results
- Document sharding completed
- Epics and stories created
- Development ready to begin

### Phase 3 Results
- Fullstack trauma-healing application built
- All 16 stories implemented and tested
- Production-ready software delivered

## Next Steps

1. **Begin with Step 1** - Install BMAD-METHOD core system
2. **Follow the workflow** step-by-step as outlined
3. **Use existing agents** for specialized trauma-healing features
4. **Maintain agile process** throughout development

## Troubleshooting

### Common Issues
- **IDE restart required** after installation
- **Context length issues** - always use new chats for agents
- **Status management** - ensure stories are properly approved
- **File paths** - verify correct project directory

### Support Resources
- BMAD-METHOD GitHub repository
- YouTube channel: BMadCode
- Discord community for help and support

---

**Ready to begin implementation? Start with Step 1 and follow the workflow systematically.** 