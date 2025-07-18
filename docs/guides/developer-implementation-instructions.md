# Developer Agent Implementation Instructions
*For Trauma-Healing Personal Brand Business*

## 🎯 **Mission**
Implement the BMAD-METHOD framework for the trauma-healing personal brand business following the YouTube tutorial workflow.

## 📋 **Current Status**
- ✅ BMAD-METHOD already installed in project
- ✅ Custom trauma-healing agents available
- ✅ Architecture document created
- ❌ Need to complete full BMAD workflow implementation

## 🚀 **Implementation Plan**

### **STEP 1: Verify Current Installation**
```bash
# Check current BMAD installation
ls -la .bmad-core/
ls -la .claude/
ls -la .cursor/
```

**Expected Output:**
- `.bmad-core/` - Core agents and workflows
- `.claude/` - Claude Code integration  
- `.cursor/` - Cursor IDE integration

### **STEP 2: Create Documentation Structure**
```bash
# Create docs folder if not exists
mkdir -p docs

# Copy existing architecture document
cp trauma-healing-architecture-audit.md docs/architecture.md

# Verify structure
ls -la docs/
```

### **STEP 3: Generate PRD (Product Requirements Document)**

**Method: Use Web UI with Gemini/ChatGPT**

1. **Get Team Fullstack File:**
   ```bash
   # Copy the team file content
   cat BMAD-METHOD/dist/teams/team-fullstack.txt
   ```

2. **Create AI Agent:**
   - Go to [Google Gems](https://gemini.google.com/gems/view) or ChatGPT
   - Create new Gem/CustomGPT
   - Upload team-fullstack.txt content
   - Set instructions: "Your critical operating instructions are attached, do not break character as directed"

3. **Generate PRD:**
   ```
   *brainstorm
   ```
   **Describe:** "Trauma healing personal brand business with AI-powered content generation, client management, and affiliate marketing"
   
   **Features to include:**
   - Content management system for healing prompts
   - Client portal with session tracking
   - Payment processing with Stripe
   - Social media automation
   - AI-powered content generation
   - Affiliate marketing tracking
   
   ```
   *pm
   *create-doc
   ```
   Follow the 5-stage PRD workflow
   Download as `docs/prd.md`

### **STEP 4: Generate Architecture Document**

**In the same AI agent:**
```
*architect
*create-doc
```
- Use fullstack architecture template
- Generate complete technical architecture
- Download as `docs/architecture.md`

### **STEP 5: Document Sharding**

**In your IDE (Cursor/Claude Code):**

1. **Initialize PO Agent:**
   - Type "PO" and select the agent
   - Use `*shard-doc` command:
   ```bash
   *shard-doc docs/prd.md docs/prd
   *shard-doc docs/architecture.md docs/architecture
   ```

### **STEP 6: Epic and Story Generation**

**Initialize Scrum Master Agent:**
- Type "SM" and select
- Use `*draft` method
- Agent will detect missing epics and offer to generate them
- Select option 1 to auto-generate epics
- This creates 4 epics with 16 total stories

**Expected Epics:**
- Epic 1: Core Infrastructure & Authentication
- Epic 2: Content Management System
- Epic 3: Client Portal & Session Management
- Epic 4: Payment Processing & Analytics

### **STEP 7: Development Implementation**

**For each story (start with Story 1.1):**

1. **Initialize Dev Agent in NEW CHAT:**
   - Type "dev" and select
   - Agent asks which story to implement
   - Select story (e.g., "1.1" for first story)

2. **Implementation Process:**
   - Agent follows story exactly with subtasks
   - Implement code according to story requirements
   - Status changes to "ready for review"

3. **Testing Phase (NEW CHAT):**
   - Initialize QA Agent
   - Use `*review` method
   - Agent checks implementation against requirements
   - Status changes to "done" after approval

### **STEP 8: Story Implementation Order**

**Epic 1: Core Infrastructure**
- Story 1.1: Basic authentication system
- Story 1.2: User management and profiles
- Story 1.3: Database setup and models
- Story 1.4: API foundation

**Epic 2: Content Management**
- Story 2.1: Content creation interface
- Story 2.2: Content storage and retrieval
- Story 2.3: Content versioning system
- Story 2.4: AI content generation integration

**Epic 3: Client Portal**
- Story 3.1: Client dashboard
- Story 3.2: Session tracking
- Story 3.3: Progress monitoring
- Story 3.4: Client communication system

**Epic 4: Business Features**
- Story 4.1: Payment processing setup
- Story 4.2: Subscription management
- Story 4.3: Analytics and reporting
- Story 4.4: Social media automation

## 🔧 **Technical Implementation Details**

### **Technology Stack (From Architecture)**
- **Frontend:** Next.js 14 + Tailwind CSS + Zustand
- **Backend:** Node.js + Express + PostgreSQL + Redis
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **Deployment:** Vercel

### **Custom Agents Integration**
Your project has specialized agents that can be integrated:
- **Trauma Healing Specialist (Aletheia)** - Content generation
- **Business Strategist (Kairos)** - Business logic
- **SEO & Social Media Automation Specialist (Eidolon)** - Marketing features
- **AI Copy Humanizer** - Content optimization

### **File Structure After Implementation**
```
trauma-healing-business/
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── prd/ (sharded files)
│   └── architecture/ (sharded files)
├── stories/
│   ├── epic-1/
│   ├── epic-2/
│   ├── epic-3/
│   └── epic-4/
├── apps/
│   ├── web/ (Next.js frontend)
│   └── api/ (Express backend)
└── packages/
    ├── shared/ (TypeScript types)
    └── ui/ (Reusable components)
```

## ⚠️ **Critical Workflow Rules**

### **Agent Management**
- **ALWAYS start each agent in a NEW CHAT**
- **Clean handoffs** between agents
- **Status tracking** ensures proper workflow
- **Context length management** is crucial

### **Story Lifecycle**
1. **Draft** → Created by Scrum Master
2. **Approved** → Manual approval required (change status in file)
3. **Ready for Review** → Development complete
4. **Done** → QA approved

### **Quality Assurance**
- QA agent scans codebase for specific requirements
- Auto-fixes repetitive code with refactoring
- Only marks complete after verification
- Follows real agile development practices

## 🎯 **Success Criteria**

### **Phase 1 Complete When:**
- ✅ BMAD-METHOD fully installed and configured
- ✅ PRD and architecture documents generated
- ✅ Development workflow established

### **Phase 2 Complete When:**
- ✅ Document sharding completed
- ✅ Epics and stories created
- ✅ Development ready to begin

### **Phase 3 Complete When:**
- ✅ Fullstack trauma-healing application built
- ✅ All 16 stories implemented and tested
- ✅ Production-ready software delivered

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**
1. **IDE restart required** after installation
2. **Context length issues** - always use new chats for agents
3. **Status management** - ensure stories are properly approved
4. **File paths** - verify correct project directory

### **Support Resources**
- BMAD-METHOD GitHub repository
- YouTube channel: BMadCode
- Discord community for help and support

## 🎬 **Next Action**

**Ready to begin? Start with STEP 1 and follow the workflow systematically.**

**Remember:** This is a production-ready implementation following real agile development practices. Each step builds upon the previous one, ensuring a solid foundation for your trauma-healing business platform. 