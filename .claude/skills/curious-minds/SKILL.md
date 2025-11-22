---
name: curious-minds
description: Generate interesting daily-life questions and answers with multiple choice format, inspired by "十万个为什么" (One Hundred Thousand Whys)
---

# Daily Life Q&A Generator Skill

## Purpose
This skill helps create engaging, educational questions and answers about everyday phenomena that people encounter in daily life. Questions should spark curiosity and provide clear, accessible explanations that anyone can understand.

## Quick Reference Guide

**Content Limits (Mobile-Optimized for iOS & Android):**
```
Question EN:    ≤45 characters  (fits 1-2 lines on iPhone SE)
Question CN:    ≤25 characters
Choice EN:      ≤35 characters  (fits 1 line per choice)
Choice CN:      ≤15 characters
Explanation EN: ≤400 characters (4-6 sentences, minimal scroll)
Explanation CN: ≤180 characters

Reading Times:
  Question:     3 seconds to grab attention
  Choices:      5-8 seconds to scan all 4
  Explanation:  30-40 seconds to read fully
  Total:        ~60 seconds per question
```

**Critical Requirements:**
- ✅ Scientifically accurate (Review Agent validates ALL content)
- ✅ Mobile-first (works on 320px width phones)
- ✅ Bilingual (Chinese and English equivalent quality)
- ✅ Self-contained (no context needed)
- ✅ One-handed readable (portrait mode)

## Timing Requirements
The app is designed for quick, bite-sized learning:
- **Question + 4 Choices**: 20 seconds to read and select
- **Explanation**: 30-40 seconds to read and understand
- **Total per question**: ~60 seconds

This timing constraint influences content length and complexity.

## Content Review & Validation Protocol

**CRITICAL**: All Q&A content MUST be scientifically accurate and factually correct. This skill includes a built-in review agent that validates all content before finalization.

### Review Agent Process

When generating new questions, you MUST follow this process:

#### Step 1: Generate Initial Content
- Create the question, choices, and explanation following all guidelines

#### Step 2: Fact-Checking Review
**Before accepting any content, activate the Review Agent to verify:**

1. **Scientific Accuracy Check**
   - Verify all scientific claims against established knowledge
   - Check physical laws, chemical processes, biological mechanisms
   - Confirm numerical values (speeds, distances, percentages, etc.)
   - Validate cause-and-effect relationships

2. **Correct Answer Validation**
   - Verify the marked correct answer is definitively correct
   - Ensure wrong answers are actually incorrect
   - Check for any ambiguity or multiple possible correct answers

3. **Explanation Verification**
   - Confirm explanation accurately answers the question
   - Verify all facts and mechanisms described
   - Check for oversimplification that leads to inaccuracy
   - Ensure no contradictions with current scientific understanding

4. **Common Misconception Check**
   - Identify if content might reinforce misconceptions
   - Verify explanations correct common misunderstandings
   - Check that simplification doesn't create new misconceptions

#### Step 3: Self-Correction Loop
If the Review Agent finds issues:

```
ISSUE DETECTED → RESEARCH → CORRECT → RE-REVIEW → ACCEPT or REPEAT
```

**Required Actions:**
- Document what was incorrect
- Research the correct information
- Revise the content
- Re-run the review process
- Only finalize when all checks pass

#### Step 4: Confidence Assessment
Before finalizing, rate confidence in accuracy:
- ✅ **High Confidence**: Established scientific consensus, verified facts
- ⚠️ **Medium Confidence**: Generally accepted but may have nuances
- ❌ **Low Confidence**: Uncertain or controversial → DO NOT USE

**Only accept High Confidence content.**

### Fact-Checking Requirements

For each question, verify:

| Topic Area | What to Verify | Resources |
|------------|----------------|-----------|
| **Astronomy** | Orbital periods, distances, phenomena | NASA data, astronomical databases |
| **Physics** | Laws, formulas, speeds, forces | Physics textbooks, verified sources |
| **Chemistry** | Chemical reactions, compounds, properties | Chemistry references |
| **Biology** | Body functions, processes, mechanisms | Medical/biology textbooks |
| **Psychology** | Theories, research findings, mechanisms | Peer-reviewed psychology research |
| **Weather** | Atmospheric processes, phenomena | Meteorological sources |
| **Economics** | Economic principles, mechanisms | Economics textbooks |
| **Technology** | How things work, specifications | Technical documentation |

### Review Agent Checklist

Before finalizing ANY question, confirm:

- [ ] **Correct answer is definitively correct** (no ambiguity)
- [ ] **All wrong answers are actually wrong** (no correct alternatives)
- [ ] **Scientific facts are accurate** (verified against sources)
- [ ] **Numbers/percentages are correct** (if mentioned)
- [ ] **Causal relationships are accurate** (A actually causes B)
- [ ] **No oversimplification** (that creates inaccuracy)
- [ ] **No common misconceptions reinforced**
- [ ] **Current scientific understanding** (not outdated)
- [ ] **Chinese translation is accurate** (scientifically equivalent)
- [ ] **No contradictions** (within the content)

### Common Accuracy Pitfalls to Avoid

1. **Oversimplification Errors**
   - ❌ "We yawn to get more oxygen" (outdated theory)
   - ✅ "Recent research suggests yawning cools the brain"

2. **Incomplete Causation**
   - ❌ "The sky is blue because of the ocean" (wrong)
   - ✅ "Air molecules scatter blue light more than other colors"

3. **Outdated Science**
   - ❌ Using theories that have been superseded
   - ✅ Use current scientific consensus

4. **Misleading Simplification**
   - ❌ "Antibiotics kill all germs" (too broad, wrong)
   - ✅ "Antibiotics kill bacteria but not viruses"

5. **False Precision**
   - ❌ Making up specific numbers
   - ✅ Use verified data or say "approximately"

### Self-Correction Examples

**Example 1: Correcting Scientific Inaccuracy**

❌ **Initial (INCORRECT)**:
```
Question: "Why do we see lightning before hearing thunder?"
Correct Answer: "Light is faster than electricity"
```

**Review Agent detects**: Lightning IS electricity, this is wrong!

✅ **Corrected**:
```
Correct Answer: "Light travels faster than sound"
Explanation: "Lightning and thunder happen simultaneously, but light travels
at 300,000 km/s while sound only travels at 0.3 km/s..."
```

**Example 2: Correcting Misconception**

❌ **Initial (MISLEADING)**:
```
Question: "Why is it colder in winter?"
Correct Answer: "Earth is farther from the Sun"
```

**Review Agent detects**: This is a common misconception! Distance changes minimally.

✅ **Corrected**:
```
Correct Answer: "Earth's axis is tilted away from the Sun"
Explanation: "Winter happens due to Earth's tilt, not distance. When your
hemisphere tilts away, sunlight hits at a lower angle..."
```

**Example 3: Correcting Ambiguity**

❌ **Initial (AMBIGUOUS)**:
```
Question: "Why do things fall down?"
Correct Answer: "Because of gravity"
Wrong Answer: "Because of Earth's pull"
```

**Review Agent detects**: "Earth's pull" IS gravity! Two correct answers!

✅ **Corrected**:
```
Correct Answer: "Earth's gravity pulls them toward center"
Wrong Answer: "Air pressure pushes them down"
```

## Instructions

When using this skill, you will generate Q&A content in the following format:

### 1. Question Generation
- Create an intriguing question about a common daily-life phenomenon
- Topics can include: nature, science, human behavior, economics, technology, astronomy, biology, physics, chemistry, psychology, etc.
- Questions should be relatable and something many people have wondered about
- Make the question engaging and curiosity-sparking
- **Length limit**: Max 20 words (English) / 25 characters (Chinese)

### 2. Multiple Choice Answers
- Provide exactly 4 answer choices
- Only ONE answer is correct
- The other 3 should be plausible but incorrect
- Mix obvious wrong answers with subtly incorrect ones to make it educational
- Avoid making wrong answers too silly or too obvious
- **Length limit per choice**: Max 12 words (English) / 15 characters (Chinese)
- Keep all choices grammatically parallel and concise

### 3. Explanation
- Write a clear, easy-to-understand explanation
- Use plain language suitable for a general audience
- Include interesting facts or additional context
- Make it educational yet entertaining
- **Length**: 100-120 words (English) / 150-180 characters (Chinese)
- Structure: Main answer (2-3 sentences) + Interesting fact (1 sentence)
- Remove unnecessary details, keep it focused and punchy

### 4. Bilingual Format
- Provide BOTH Chinese and English versions
- Ensure cultural appropriateness for both languages
- Maintain the same educational value in both versions

## File Structure

Questions are organized by topic in separate JSON files:

```
aigneous_millionwhys/
├── .claude/skills/curious-minds/
│   └── SKILL.md (this file)
├── src/
│   └── data/questions/          ← Next.js optimized location
│       ├── astronomy.json
│       ├── weather.json
│       ├── human-biology.json
│       ├── physics.json
│       ├── chemistry.json
│       ├── animals.json
│       ├── plants.json
│       ├── psychology.json
│       ├── economics.json
│       └── technology.json
├── scripts/                      ← Simplified (no /validation subdirectory)
│   ├── add_questions.py          ← Main CLI for adding questions
│   ├── question_builder_v3.py    ← DeepSeek translation + timestamps
│   ├── auto_validate.py          ← Layer 1: Format validation
│   ├── validate_facts.py         ← Layer 2: Rule-based fact checking
│   ├── install_git_hook.sh
│   └── utils/
│       ├── validation.py         ← 2-layer validation runner
│       ├── id_manager.py
│       └── master_list.py
└── docs/
    └── CLAUDE_CODE_WORKFLOW_GUIDE.md  ← V3 workflow documentation
```

Each JSON file contains multiple questions for that category, with both English and Chinese versions in the same file. This keeps translations paired and prevents sync issues.

## Output Format

Each topic JSON file follows this structure:

```json
{
  "category_en": "Astronomy & Space",
  "category_zh": "天文与太空",
  "questions": [
    {
      "id": "astro_001",
      "question_en": "Why can we only see one side of the Moon?",
      "question_zh": "为什么我们只能看到月球的一面？",
      "choices_en": [
        "The Moon doesn't rotate",
        "Its rotation matches its orbit",
        "Earth's gravity stops rotation",
        "The far side is always dark"
      ],
      "choices_zh": [
        "月球不会自转",
        "自转周期等于公转周期",
        "地球引力阻止自转",
        "背面永远是黑暗的"
      ],
      "correct_answer": 1,
      "explanations_en": [
        "Wrong. The Moon does rotate on its axis. If it didn't rotate at all, we would see all sides of it over time as it orbits Earth.",
        "Correct! This is called 'tidal locking.' The Moon's rotation period (27.3 days) equals its orbital period, so the same side always faces Earth.",
        "Wrong. Earth's gravity doesn't stop the Moon's rotation. Instead, it caused tidal locking over millions of years, synchronizing the rotation with the orbit.",
        "Wrong. The far side receives sunlight just like the near side. We call it the 'far side,' not the 'dark side' - it's only dark when the near side is lit."
      ],
      "explanations_zh": [
        "错误。月球确实会自转。如果它完全不自转，随着它绕地球公转，我们会看到它的各个面。",
        "正确！这叫做潮汐锁定。月球的自转周期（27.3天）等于公转周期，所以同一面总是朝向地球。",
        "错误。地球引力并没有阻止月球自转。相反，它在数百万年的作用下导致了潮汐锁定，使自转与公转同步。",
        "错误。月球背面也会接收到阳光，就像正面一样。我们称它为'背面'而不是'暗面' - 只有当正面被照亮时它才是暗的。"
      ],
      "difficulty": "medium"
    }
  ]
}
```

**Field Descriptions:**
- `id`: Unique identifier (format: `category_###`)
- `question_en/zh`: Question text (max 45 chars EN / 25 chars CN) [Mobile optimized]
- `choices_en/zh`: Array of 4 choices (max 35 chars EN / 15 chars CN each) [Mobile optimized]
- `correct_answer`: Index (0-3) of correct choice
- `explanations_en/zh`: Array of 4 explanations matching the 4 choices
  - Each explains why that choice is correct or incorrect
  - Correct answer explanation: 2-3 sentences explaining the concept
  - Wrong answer explanations: 1-2 sentences explaining why it's incorrect
  - Total combined length: ~400 chars EN / ~180 chars CN [Mobile optimized]
- `difficulty`: "easy", "medium", or "hard"

**All fields are REQUIRED for new questions.**

### Guidelines for Writing Explanations

**When creating explanations for each choice:**

**For the CORRECT answer (index matches `correct_answer`):**
- Start with "Correct!" to clearly mark it
- Explain WHY this is the right answer (2-3 sentences)
- Include the key concept or mechanism
- Keep it educational and satisfying
- Length: ~100-120 words (EN) / ~60-80 chars (CN)

**For WRONG answers:**
- Start with "Wrong." to clearly mark it
- Explain WHY this choice is incorrect (1-2 sentences)
- Help users understand the misconception
- Keep it concise and clear
- Length: ~40-60 words each (EN) / ~30-50 chars each (CN)

**Example workflow:**
1. Write the question and 4 choices
2. Identify the correct answer
3. Write a full explanation for the correct answer
4. For each wrong answer, explain what makes it incorrect
5. Verify total length fits mobile constraints (~400 chars EN / ~180 chars CN)

## Categories to Cover

1. **Astronomy & Space** (天文与太空)
   - Planetary motion, stars, moon phases, eclipses

2. **Weather & Climate** (天气与气候)
   - Clouds, rain, rainbows, seasons, wind

3. **Human Biology** (人体生物学)
   - Sleep, hunger, emotions, growth, senses

4. **Physics in Daily Life** (日常物理)
   - Sound, light, electricity, magnetism, motion

5. **Chemistry Around Us** (身边的化学)
   - Cooking, cleaning, colors, materials

6. **Animal Behavior** (动物行为)
   - Migration, hibernation, communication

7. **Plant Science** (植物科学)
   - Growth, photosynthesis, seasons, flowers

8. **Psychology & Behavior** (心理与行为)
   - Habits, learning, memory, emotions

9. **Economics & Money** (经济与金融)
   - Prices, markets, trade, value

10. **Technology** (技术)
    - Internet, phones, computers, inventions

## Quality Guidelines

### Good Questions:
- ✅ "Why do we yawn when we're tired?"
- ✅ "Why is the sky blue during the day but red at sunset?"
- ✅ "Why do babies cry so much?"
- ✅ "Why do stock prices go up and down?"

### Avoid:
- ❌ Overly technical or academic questions
- ❌ Questions requiring specialized knowledge
- ❌ Controversial or sensitive topics
- ❌ Questions with subjective answers

## Difficulty Levels

- **Easy**: Common observations, simple concepts
- **Medium**: Requires some thought, intermediate concepts
- **Hard**: Less obvious phenomena, complex mechanisms

## Examples

### Example 1: Easy Level (Chemistry)

```json
{
  "id": "chem_001",
  "question_en": "Why do onions make us cry?",
  "question_zh": "为什么切洋葱会流泪？",
  "choices_en": [
    "They contain spicy chemicals",
    "They release gas forming acid",
    "The smell triggers tears",
    "Tiny particles irritate eyes"
  ],
  "choices_zh": [
    "含有辛辣化学物质",
    "释放气体形成酸",
    "气味刺激泪腺",
    "微粒刺激眼睛"
  ],
  "correct_answer": 1,
  "explanations_en": [
    "Wrong. While onions do have strong compounds, it's not just 'spiciness' causing tears. The specific mechanism involves a chemical reaction that produces sulfuric acid in your eyes.",
    "Correct! When you cut onions, enzymes are released that react with sulfur compounds to create a gas. This gas reaches your eyes and reacts with your tears to form sulfuric acid. Your eyes produce more tears to wash away the irritation. Chilling onions helps reduce this reaction!",
    "Wrong. It's not the smell that triggers tears. The gas from onions chemically reacts with the moisture in your eyes to form acid, which causes the irritation and tearing.",
    "Wrong. There are no particles from onions irritating your eyes. It's actually a gas (propanethial S-oxide) that reaches your eyes and forms sulfuric acid when it mixes with tears."
  ],
  "explanations_zh": [
    "错误。虽然洋葱确实含有强烈的化合物，但引起流泪的不仅仅是"辛辣"。具体机制涉及在眼睛中产生硫酸的化学反应。",
    "正确！切洋葱时释放的酶与硫化合物反应产生气体。这种气体到达眼睛后与泪液反应形成硫酸。眼睛产生更多泪水来冲洗刺激物。冷藏洋葱有助于减少这种反应！",
    "错误。不是气味引发流泪。洋葱释放的气体与眼睛中的水分发生化学反应形成酸，从而引起刺激和流泪。",
    "错误。不是洋葱的微粒刺激眼睛。实际上是一种气体（丙硫醛S-氧化物）到达眼睛后与泪液混合形成硫酸。"
  ],
  "difficulty": "easy"
}
```

### Example 2: Medium Level (Weather)

```json
{
  "id": "weather_001",
  "question_en": "Why are clouds white but rain clouds dark?",
  "question_zh": "为什么云是白色雨云是黑色？",
  "choices_en": [
    "Rain clouds have dirty water",
    "Rain clouds are thicker",
    "Different cloud materials",
    "Rain clouds cast shadows"
  ],
  "choices_zh": [
    "雨云含有脏水",
    "雨云更厚",
    "云的物质不同",
    "雨云产生阴影"
  ],
  "correct_answer": 1,
  "explanations_en": [
    "Wrong. Rain clouds aren't dark because of dirty water. Both white clouds and rain clouds are made of the same clean water droplets. The darkness comes from the cloud's thickness, not dirt.",
    "Correct! All clouds scatter sunlight, appearing white. But rain clouds are much thicker and denser with more water droplets. As light passes through, most gets absorbed before reaching the bottom. Less light escapes, making them appear dark gray. The darker the cloud, the more water it holds!",
    "Wrong. All clouds are made of the same material: tiny water droplets or ice crystals. The difference isn't what they're made of, but how thick and dense they are.",
    "Wrong. Rain clouds don't appear dark because they cast shadows. They look dark because they're so thick that light can't pass through them easily. The darkness is in the cloud itself."
  ],
  "explanations_zh": [
    "错误。雨云不是因为含有脏水而变黑。白云和雨云都是由相同的干净水滴组成的。黑暗来自云的厚度，而不是污垢。",
    "正确！所有云都会散射阳光，呈现白色。但雨云更厚更密，含有更多水滴。光线穿过时，大部分在到达底部前被吸收。透出的光线少，看起来就是深灰色。云越黑，含水越多！",
    "错误。所有云都是由相同的物质组成的：微小的水滴或冰晶。区别不在于它们的成分，而在于它们的厚度和密度。",
    "错误。雨云看起来不黑是因为它们投下阴影。它们看起来黑是因为太厚，光线无法轻易穿过。黑暗在云本身。"
  ],
  "difficulty": "medium"
}
```

### Example 3: Hard Level (Psychology)

```json
{
  "id": "psych_001",
  "question_en": "Why does time feel faster as we age?",
  "question_zh": "为什么年纪越大时间过得越快？",
  "choices_en": [
    "Our brain slows down",
    "Each year is smaller portion of life",
    "We have fewer memories",
    "We sleep less as we age"
  ],
  "choices_zh": [
    "大脑运转变慢",
    "每年占生命比例更小",
    "记忆变少了",
    "睡眠时间减少"
  ],
  "correct_answer": 1,
  "explanations_en": [
    "Wrong. While brain processing does change with age, it doesn't slow down in a way that makes time feel faster. The perception is more about proportional time and memorable experiences.",
    "Correct! At age 5, one year represents 20% of your entire life. At 50, it's only 2%. This proportional difference affects perception. Additionally, children experience many 'firsts' creating detailed memories that make time feel longer. Adults have routine lives with fewer novel experiences, so time seems to fly.",
    "Wrong. Adults actually have more total memories than children. The issue is that we form fewer new, vivid memories due to routine. It's the lack of novel experiences, not fewer memories overall.",
    "Wrong. Sleep patterns do change with age, but this doesn't explain why time feels faster. The perception is related to how we experience and remember new events, not sleep duration."
  ],
  "explanations_zh": [
    "错误。虽然大脑处理能力确实会随年龄变化，但它不会以让时间感觉更快的方式变慢。这种感知更多与比例时间和难忘经历有关。",
    "正确！5岁时，一年占整个生命的20%。50岁时只占2%。这种比例差异影响感知。此外，儿童经历许多"第一次"，创造详细记忆，使时间感觉更长。成年人生活常规化，新鲜体验少，时间似乎飞逝。",
    "错误。成年人实际上比儿童拥有更多的总记忆。问题在于我们由于常规生活形成的新鲜、生动记忆较少。是缺乏新奇体验，而不是记忆总体减少。",
    "错误。睡眠模式确实会随年龄变化，但这不能解释为什么时间感觉更快。这种感知与我们如何体验和记住新事件有关，而不是睡眠时长。"
  ],
  "difficulty": "hard"
}
```

## Usage Instructions

### Generating New Questions (V3 Workflow)

When invoked, this skill will follow this **Claude Code interactive workflow**:

**Phase 1: Planning**
1. User specifies topic category (or browse existing topics)
2. User specifies difficulty level (easy/medium/hard)
3. User specifies how many questions to generate

**Phase 2: Generation & Fact-Checking (Claude Code)**
4. Generate question, choices, and explanations (4 explanations: 1 correct, 3 wrong)
5. **Claude Code fact-checks all content** in conversation:
   - Verify scientific accuracy against established knowledge
   - Validate correct answer is definitively correct
   - Verify wrong answer explanations are accurate
   - Ensure no misconceptions are reinforced
   - Self-correct any issues found
6. Check character limits (mobile-optimized: 45 chars EN question, 35 chars EN choices)
7. Only accept "High Confidence" content

**Phase 3: Save to YAML Draft**
8. User saves fact-checked content to YAML file:
   ```yaml
   category: Animals
   questions:
     - question_en: "Why do cats purr?"
       correct_answer: 1
       choices_en: [...]
       explanations_en: [...]  # Required - fact-checked by Claude Code
       difficulty: medium
   ```

**Phase 4: Run Automated Script**
9. Run: `python scripts/add_questions.py --draft questions/drafts/my_questions.yaml`
10. Script automatically:
    - ✅ Translates to Chinese (DeepSeek API)
    - ✅ Adds timestamps (created_at, last_modified_at)
    - ✅ Runs 2-layer validation
    - ✅ Updates JSON file
    - ✅ Updates master list
    - **No confirmations needed**

**Phase 5: 2-Layer Validation (Automatic)**
11. **Layer 1: Format Validation** (auto_validate.py)
    - JSON structure and format
    - All required fields present
    - Character limits for mobile
    - Explanation format (Correct!/Wrong. prefixes)
    - Logical consistency
12. **Layer 2: Fact Checking** (validate_facts.py)
    - Rule-based accuracy checks
    - Red flag detection (absolutes, misconceptions)
    - Cross-reference validation
13. **BLOCKS if critical issues found** - must fix before proceeding

**Phase 6: Finalization**
14. Review generated JSON in `src/data/questions/`
15. Master list automatically updated
16. Commit when ready: `git add . && git commit -m "Add X questions"`
17. ✅ Question ready for production

### Automatic Validation Options

**Option 1: Main CLI (Recommended)**
```bash
# Add questions from YAML draft (fully automated)
python scripts/add_questions.py --draft questions/drafts/my_questions.yaml

# Dry run (preview without writing)
python scripts/add_questions.py --draft my_questions.yaml --dry-run

# Skip AI translation (manual content only)
python scripts/add_questions.py --draft my_questions.yaml --no-ai

# Update master list totals only
python scripts/add_questions.py --update-master-list
```

**Option 2: Git Pre-Commit Hook**
```bash
# One-time setup (from repository root)
bash scripts/install_git_hook.sh

# Now validation runs automatically on every commit
# Commits are BLOCKED if critical issues found
```

**Option 3: Direct Validation Commands**
```bash
# Validate specific file
python3 scripts/auto_validate.py chemistry.json

# Validate all files
python3 scripts/auto_validate.py --all

# Run 2-layer validation pipeline
python scripts/utils/validation.py
```

See `docs/CLAUDE_CODE_WORKFLOW_GUIDE.md` for complete workflow documentation.

### Reviewing Existing Questions

You can also use this skill to:
- **Audit existing content**: Run Review Agent on current questions
- **Update outdated science**: Refresh questions with new research
- **Fix accuracy issues**: Correct any errors found
- **Improve clarity**: Enhance explanations while maintaining accuracy
- **Validate translations**: Ensure Chinese versions are scientifically equivalent

## Tips for Great Content

1. **Start with curiosity**: What would make someone say "I've always wondered about that!"
2. **Be accurate**: Research facts carefully, ensure scientific accuracy
3. **Be relatable**: Use examples from everyday life
4. **Be clear**: Avoid jargon, explain technical terms
5. **Be engaging**: Add interesting facts or surprising details
6. **Be balanced**: Make sure Chinese and English versions are equally good
7. **Test difficulty**: Wrong answers should be plausible but clearly incorrect

## Content Formatting for User Experience

These guidelines ensure content is naturally easy to read and display in any UI design:

### 1. Question Design

**Goal**: Quick comprehension, visual clarity

✅ **DO:**
- Start with clear question words (Why, How, What)
- Keep questions focused on ONE phenomenon
- Use active voice
- End with question mark
- Make it self-contained (no context needed)

❌ **AVOID:**
- Multi-part questions ("Why X and how does Y?")
- Ambiguous pronouns ("Why does it happen?")
- Questions needing background knowledge
- Rhetorical questions

**Examples:**
```
✅ "Why do we yawn when tired?"
✅ "Why is the sky blue?"
❌ "Why do we yawn and what causes it to be contagious?" (multi-part)
❌ "Why does this happen in space?" (needs context)
```

### 2. Choice Design

**Goal**: Easy scanning, clear comparison, no confusion

✅ **DO:**
- Keep all 4 choices similar length (±3 words)
- Use parallel grammatical structure
- Start each choice similarly when possible
- Make choices visually distinct
- Put key differentiator early in the choice

❌ **AVOID:**
- One choice much longer than others
- Mixing sentence types (statement vs. phrase)
- "All of the above" or "None of the above"
- Nested choices or sub-clauses

**Examples:**

✅ **Good (parallel, scannable):**
```
1. Earth's rotation slows down
2. Moon's gravity pulls water
3. Wind pushes ocean water
4. Underwater earthquakes occur
```

❌ **Bad (inconsistent structure):**
```
1. The gravity of the moon
2. Because wind is pushing it
3. Earthquakes
4. The rotation of Earth is slowing and this causes the water to move
```

### 3. Explanation Structure

**Goal**: Logical flow, easy to follow, satisfying answer

**Required 3-Part Structure:**

**Part 1: Direct Answer** (1-2 sentences)
- Immediately answer the question
- State the main cause/mechanism
- No buildup or preamble

**Part 2: How It Works** (2-3 sentences)
- Explain the mechanism/process
- Use simple cause-and-effect
- Include key facts

**Part 3: Interesting Addition** (1 sentence)
- Surprising fact or real-world connection
- Makes it memorable
- Optional: Practical tip

**Template:**
```
[Direct Answer]. [Mechanism sentence 1]. [Mechanism sentence 2].
[Key detail]. [Interesting fact or tip]!
```

**Example (Onions making us cry):**
```
✅ GOOD:
"Cutting onions breaks cells and releases enzymes. [Direct Answer]
These react with sulfur compounds to create a gas. [Mechanism]
When this gas reaches your eyes, it forms sulfuric acid with your tears. [How it works]
Your eyes produce more tears to wash it away. [Key detail]
Chilling onions or cutting underwater helps reduce this reaction! [Practical tip]"

❌ BAD:
"Have you ever wondered about onions? Well, there's an interesting
chemical process. Sulfur compounds exist in onions. When cutting occurs,
these compounds, which are naturally present, undergo a transformation..."
(Too slow, no clear structure)
```

### 4. Readability Rules

**For ALL content:**

- **Sentence length**: Max 20 words per sentence
- **Word complexity**: Prefer common words over technical terms
- **Active voice**: "Light travels" not "Light is traveled by"
- **Concrete over abstract**: "tiny water droplets" not "particulate matter"
- **Numbers**: Use digits (5 years) not words (five years)
- **Pronouns**: Clear antecedents, avoid ambiguity

### 5. Scannability Guidelines

Make content easy to skim:

**Questions:**
- Front-load the key concept
- ✅ "Why is **sunset** colorful?" (key word early)
- ❌ "Why are there so many colors during sunset?" (buried)

**Choices:**
- Put differentiating words first
- ✅ "**Moon's** rotation matches orbit"
- ✅ "**Earth's** gravity stops rotation"
- ❌ "The rotation of the Moon..."
- ❌ "The gravity from Earth..."

**Explanations:**
- Lead with the answer
- Use transition words (Also, However, So)
- Break long sentences with punctuation
- End with impact (! for surprising facts)

### 6. Visual Hierarchy Hints

While the app controls actual formatting, structure content to support visual hierarchy:

**Emphasis Priority:**
1. **Question** - Most prominent
2. **Choices** - Easy to scan
3. **Explanation** - Comfortable to read

**Length Ratios (approximate):**
- Question: 100% width, 1 line
- Each choice: 100% width, 1 line
- Explanation: 100% width, 3-5 lines

### 7. Mobile Phone Optimization (iOS & Android)

**CRITICAL**: All content MUST work perfectly on small phone screens in portrait mode.

#### Screen Size Considerations

**Target devices:**
- iPhone SE (smallest common iOS): 320px width
- Small Android phones: ~360px width
- Standard phones: 375-414px width

**Character limits per line:**
- **Questions**: 35-45 characters (fits in 1-2 lines max)
- **Choices**: 30-40 characters each (1 line per choice)
- **Explanations**: 50-60 characters per line (natural flow)

#### Vertical Scrolling Optimization

Content should minimize scrolling within each screen:

**Question Screen (before choosing):**
```
┌─────────────────────┐
│   [Question]        │  ← 1-2 lines
│                     │
│ ○ Choice 1          │  ← 1 line
│ ○ Choice 2          │  ← 1 line
│ ○ Choice 3          │  ← 1 line
│ ○ Choice 4          │  ← 1 line
│                     │
│    [Skip Button]    │
└─────────────────────┘
```
**Total: Fits in ONE screen without scrolling**

**Explanation Screen (after choosing):**
```
┌─────────────────────┐
│   [Question]        │  ← Reminder (1-2 lines)
│   [Your choice]     │  ← Shows what they picked
│   [Correct answer]  │  ← Shows right answer
│                     │
│   [Explanation]     │  ← 4-6 lines max
│   ...continues...   │
│                     │
│    [Next Button]    │
└─────────────────────┘
```
**Total: Minimal scrolling (1-2 thumb swipes max)**

#### One-Handed Usage Patterns

Most users hold phones with one hand and tap with thumb:

**Content Implications:**
- **Short words**: Easier to scan while scrolling
- **Front-loaded info**: Key words at start of lines
- **No dense blocks**: Break up with punctuation
- **Quick comprehension**: No re-reading needed

**Thumb Zone Considerations (for content):**
- Top 20% of screen: Title/question (quick glance)
- Middle 60%: Choices/explanation (easy reach)
- Bottom 20%: Action buttons (natural thumb position)

#### Mobile Attention Span

Users on phones have **shorter attention spans**:

- **Question**: Must grab attention in 3 seconds
- **Choices**: Must be scannable in 5-8 seconds
- **Explanation**: Must be engaging enough to read fully (30-40 seconds)

**Content strategies:**
- Lead with most interesting part
- Use simple, punchy sentences
- End with satisfying "aha!" moment
- Make every word count

#### Portrait Orientation Focus

Assume 99% of users in portrait mode:

**Width constraints:**
- Questions: Max 10-12 words (prevents wrapping to 3+ lines)
- Choices: Max 8-10 words (keeps to 1-2 lines)
- Sentences in explanation: Max 15-18 words (comfortable reading)

**Height optimization:**
- Explanation: 4-6 sentences total
- Each sentence: Clear, standalone thought
- No complex multi-clause sentences

#### Touch-Friendly Content

While UI handles touch targets, content can help:

**Choices should be:**
- Clearly distinct (easy to differentiate quickly)
- Similar length (prevents accidental taps)
- Well-separated conceptually (no confusion)

#### Mobile Reading Patterns

On phones, users read in **F-pattern** or **skim**:

**Question:**
```
✅ "Why is the sky blue?"
   ↑ Read all 5 words

❌ "Why is the sky we see above us during the daytime blue?"
   ↑ Skim → miss key words
```

**Choices:**
```
✅ Short, scannable:
"Ocean reflects blue"     ← Read all
"Air scatters blue more"  ← Read all
"Sun emits blue light"    ← Read all

❌ Too long:
"The ocean's surface reflects blue light upward" ← Skim → miss details
```

**Explanations:**
- First sentence: Read fully (must hook them)
- Middle sentences: Skim or read
- Last sentence: Read fully (must satisfy)

#### Character Count Guidelines (Mobile-Specific)

Based on common mobile font sizes (16-18px):

| Element | Max Characters | Why |
|---------|---------------|-----|
| Question (EN) | 45 chars | Fits in 1-2 lines on small phones |
| Question (CN) | 25 chars | Chinese characters wider |
| Choice (EN) | 35 chars | Fits 1 line with padding |
| Choice (CN) | 15 chars | Fits comfortably |
| Explanation (EN) | 400 chars | ~4-6 lines, minimal scroll |
| Explanation (CN) | 180 chars | Equivalent reading time |

#### Punctuation for Mobile

**Use:**
- ✅ Periods (.) - Clear sentence breaks
- ✅ Commas (,) - Natural pauses
- ✅ Question marks (?) - For questions
- ✅ Exclamation (!) - For interesting facts (max 1 per explanation)

**Avoid:**
- ❌ Semicolons (;) - Too complex for quick reading
- ❌ Colons (:) - Create unnecessary pause
- ❌ Em dashes (—) - Don't render well on all phones
- ❌ Parentheses () - Create nested thoughts (hard to parse)
- ❌ Quotation marks - Unless necessary for dialogue

#### Readability on Small Screens

**Font rendering considerations:**

**Good for mobile:**
- Short words (3-8 letters)
- Common words (high frequency)
- Simple punctuation
- Clear spacing (natural commas)

**Bad for mobile:**
- Long words (10+ letters require scrolling eye movement)
- Technical terms (require more focus)
- Dense text (walls of text)
- Run-on sentences (lose thread)

#### Testing for Mobile

Before accepting any content, verify on smallest device (iPhone SE / 320px):

**Visual test:**
```
Question: Fits in 2 lines max? ✓
Choices: Each fits on 1 line? ✓
Explanation: Readable without zooming? ✓
Total height: Minimal scrolling? ✓
```

**Comprehension test:**
```
Glance at question → understand in 3 seconds? ✓
Scan choices → see differences in 5 seconds? ✓
Read explanation → follow logic easily? ✓
Finish → feel satisfied with answer? ✓
```

### 8. Content Testing Checklist (Mobile-Specific)

Before finalizing, verify on a **mobile phone screen**:

**Question:**
- [ ] ≤45 characters (EN) / ≤25 chars (CN)
- [ ] Fits in 1-2 lines on small phone (320px width)
- [ ] Can read and understand in 3 seconds
- [ ] First word is question word (Why/How/What)
- [ ] No scrolling needed to see full question

**Choices:**
- [ ] Each ≤35 characters (EN) / ≤15 chars (CN)
- [ ] All 4 fit on screen without scrolling
- [ ] Each fits on exactly 1 line
- [ ] All similar length (±5 characters)
- [ ] Can scan all 4 in 5-8 seconds
- [ ] Differentiating words appear early
- [ ] No complex words requiring focus

**Explanation:**
- [ ] ≤400 characters (EN) / ≤180 chars (CN)
- [ ] 4-6 sentences total
- [ ] Each sentence ≤18 words
- [ ] First sentence directly answers question
- [ ] Last sentence has "aha!" moment
- [ ] Requires minimal scrolling (1-2 swipes max)
- [ ] No sentence needs re-reading
- [ ] Can read comfortably in 30-40 seconds on phone

**Overall Mobile Experience:**
- [ ] Entire question fits in portrait mode
- [ ] No horizontal scrolling needed
- [ ] Text is skimmable (F-pattern friendly)
- [ ] Natural thumb scrolling (if needed)
- [ ] Comfortable one-handed reading
- [ ] No zooming required
- [ ] Works on smallest common phone (320px width)

## Quality Checklist

Before finalizing each Q&A, verify **ALL** of the following:

### Content Quality
- [ ] Question is clear and intriguing
- [ ] Question length: ≤45 chars (EN) / ≤25 chars (CN) [Mobile optimized]
- [ ] All 4 choices are grammatically parallel
- [ ] Each choice length: ≤35 chars (EN) / ≤15 chars (CN) [Mobile optimized]
- [ ] Explanation is clear and well-structured
- [ ] Explanation length: ≤400 chars (EN) / ≤180 chars (CN) [Mobile optimized]
- [ ] Language is accessible to general audience
- [ ] Both language versions are complete and equivalent
- [ ] Category and difficulty are appropriate
- [ ] Content is educational and fun
- [ ] Total reading time: ~3 sec question + ~5-8 sec choices + ~30-40 sec explanation

### UX & Readability (Mobile-Optimized)
- [ ] Question starts with clear question word (Why/How/What)
- [ ] Question is self-contained (no context needed)
- [ ] All 4 choices are similar length (±5 chars)
- [ ] Choices use parallel grammatical structure
- [ ] Key differentiators appear early in each choice
- [ ] Explanation follows 3-part structure (Answer → Mechanism → Interesting fact)
- [ ] Explanation leads with direct answer (no preamble)
- [ ] Each sentence ≤18 words (mobile-friendly)
- [ ] Active voice used throughout
- [ ] No complex punctuation (semicolons, colons, dashes, parentheses)
- [ ] Common words preferred over technical terms
- [ ] Each choice fits on one line on iPhone SE (320px width)
- [ ] Question fits in 1-2 lines on small phones
- [ ] Explanation is 4-6 sentences total
- [ ] Content readable one-handed in portrait mode
- [ ] No horizontal scrolling needed

### Scientific Accuracy (Review Agent)
**CRITICAL - Must pass ALL checks from "Review Agent Checklist" above:**
- [ ] ✅ Correct answer is definitively correct (no ambiguity)
- [ ] ✅ All wrong answers are actually wrong (verified)
- [ ] ✅ Scientific facts are accurate (checked against sources)
- [ ] ✅ Numbers/data are correct (if mentioned)
- [ ] ✅ Causal relationships are accurate
- [ ] ✅ No oversimplification leading to inaccuracy
- [ ] ✅ No common misconceptions reinforced
- [ ] ✅ Current scientific understanding (not outdated)
- [ ] ✅ Chinese translation is scientifically accurate
- [ ] ✅ No contradictions in content
- [ ] ✅ Confidence level: HIGH (must be high to accept)

**If ANY accuracy check fails → Self-correct and re-review before accepting**

## Complete Workflow Example

Here's a full example of generating a question with the Review Agent:

### Step 1: Initial Generation
```
Topic: Biology
Difficulty: Medium
Question: "Why do we get goosebumps when cold?"
```

**Generated Content (First Draft):**
```json
{
  "question_en": "Why do we get goosebumps when cold?",
  "choices_en": [
    "To trap warm air",
    "To generate body heat",
    "Muscles contracting randomly",
    "Blood vessels expanding"
  ],
  "correct_answer": 0,
  "explanation_en": "Goosebumps trap warm air close to our skin, creating an insulating layer that keeps us warm, like a natural blanket."
}
```

### Step 2: Review Agent Activation

**Accuracy Check:**
- ✅ Correct answer validation: "To trap warm air"
- ⚠️ **ISSUE DETECTED**: This is oversimplified and potentially misleading!

**Review Agent Analysis:**
- In humans, goosebumps don't effectively trap air (we lack thick fur)
- It's an evolutionary remnant from furry ancestors
- The mechanism is correct (raising hair) but the function is vestigial in humans
- **Confidence Level**: ❌ LOW - Contains misconception

### Step 3: Self-Correction

**Research Findings:**
- Goosebumps = piloerection reflex
- Tiny muscles (arrector pili) contract and raise hairs
- In furry animals: traps air for insulation
- In humans: mostly vestigial, minimal insulation
- Still triggered by cold and emotions (fear, awe)

**Corrected Content:**
```json
{
  "id": "bio_004",
  "question_en": "Why do we get goosebumps when cold?",
  "question_zh": "为什么冷时会起鸡皮疙瘩？",
  "choices_en": [
    "To generate body heat",
    "It's a reflex from furry ancestors",
    "Blood vessels contracting",
    "Skin cells multiplying"
  ],
  "choices_zh": [
    "产生体温",
    "来自毛茸祖先的反射",
    "血管收缩",
    "皮肤细胞增殖"
  ],
  "correct_answer": 1,
  "explanations_en": [
    "Wrong. Goosebumps don't generate heat. The tiny muscle contractions that cause them produce negligible warmth. It's a vestigial reflex, not a heat-generation mechanism.",
    "Correct! Goosebumps are an evolutionary leftover from our furry ancestors. Tiny muscles raise our hairs, which would trap warm air in thick fur. But humans have little body hair, so it barely helps us stay warm. We still get this reflex when cold or experiencing strong emotions!",
    "Wrong. While blood vessels do contract in cold (vasoconstriction), that's a separate response. Goosebumps are caused by tiny muscles raising hairs, not blood vessel changes.",
    "Wrong. Goosebumps don't involve skin cells multiplying. They're caused by tiny arrector pili muscles contracting to raise hairs. This is a quick muscular reflex, not cell growth."
  ],
  "explanations_zh": [
    "错误。鸡皮疙瘩不会产生热量。引起它们的微小肌肉收缩产生的热量微不足道。这是一种残留反射，而不是产热机制。",
    "正确！鸡皮疙瘩是从毛茸茸的祖先那里继承来的进化遗留。微小的肌肉使毛发竖起，在厚厚的毛皮中可以困住温暖的空气。但人类体毛稀少，所以对保暖几乎没有帮助。当我们感到寒冷或强烈情绪时仍会有这种反应！",
    "错误。虽然血管确实会在寒冷时收缩（血管收缩），但那是一个单独的反应。鸡皮疙瘩是由使毛发竖起的微小肌肉引起的，而不是血管变化。",
    "错误。鸡皮疙瘩不涉及皮肤细胞增殖。它们是由微小的立毛肌收缩使毛发竖起引起的。这是一种快速的肌肉反射，而不是细胞生长。"
  ],
  "difficulty": "medium"
}
```

### Step 4: Re-Review

**Accuracy Check (Second Pass):**
- ✅ Correct answer: "It's a reflex from furry ancestors" - ACCURATE
- ✅ Wrong answers verified as incorrect
- ✅ Explanation accurate: mentions vestigial nature
- ✅ No misconceptions: clarifies it doesn't effectively warm humans
- ✅ Current science: reflects evolutionary biology understanding
- ✅ Chinese translation: scientifically equivalent
- ✅ **Confidence Level**: HIGH

**Word Count Check:**
- Question: 8 words ✓
- Choices: 2-4 words each ✓
- Explanation: 67 words ✓

### Step 5: Accepted ✅

Question passes all checks and is added to `human-biology.json`

---

## When to Reject Questions

Even after correction, reject if:
- ❌ Topic is too controversial or culturally sensitive
- ❌ Cannot verify facts with reliable sources
- ❌ Confidence remains below HIGH
- ❌ Explanation requires technical knowledge to understand
- ❌ Multiple valid answers exist (inherent ambiguity)

Better to skip a questionable topic than publish inaccurate content!

---

Ready to generate fascinating, **accurate**, daily-life questions and answers!
