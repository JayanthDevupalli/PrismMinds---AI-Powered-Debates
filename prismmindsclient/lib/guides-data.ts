export interface GuideSection {
    id: string;
    title: string;
    content: string; // Markdown supported
}

export interface GuideData {
    slug: string;
    title: string;
    description: string;
    level: string;
    tags: string[];
    sections: GuideSection[];
}

export const guidesData: GuideData[] = [
    {
        slug: "argument-structure",
        title: "Fundamentals of Argument Structure",
        description: "Learn how arguments are built — from premises to conclusions, and how logical flow determines strength.",
        level: "Beginner",
        tags: ["Fundamentals", "Logic"],
        sections: [
            {
                id: "premises-conclusions",
                title: "Premises and Conclusions",
                content: `
### Understanding the Building Blocks

Every argument has two key parts:
- **Premises**: The reasons or evidence you're starting with
- **Conclusion**: The claim you're trying to prove

Think of it like building a case. Your premises are the foundation, and your conclusion is what you build on top.

### Student Example: Deciding on a Major
**Premises:**
- "I enjoy solving math problems"
- "Tech jobs have good career prospects"
- "I want work-life balance"

**Conclusion:** "I should study Computer Science."

**The Critical Point:** If even one premise is false (for example, you actually hate math), your conclusion becomes shaky. The strength of your argument depends entirely on the quality of your premises.

### Why This Matters in Debates
When you hear someone make a claim, immediately ask yourself: "What are their premises?" If you can show a premise is false, the entire argument collapses.
                `
            },
            {
                id: "because-chain",
                title: "The 'Because' Chain - Warrants and Backing",
                content: `
### Every Claim Needs a Reason

A claim without a "because" is just an opinion. The connection between your premise and conclusion is called a **warrant**.

### Student Example: Assignment Extension Request

**Weak Request:**
"Can I have more time on the assignment?"
- No reason given
- Professor has no information to evaluate

**Strong Request:**
"Can I have more time because I have three major exams this week? Here's my schedule showing the conflicts."
- Clear reason (warrant): Schedule conflict
- Evidence (backing): Actual schedule

### Professional Application
In workplace discussions, always provide your reasoning explicitly. Don't assume others will connect the dots.

**Example:** "We should change our meeting time" becomes "We should change our meeting time because 40% of the team is in a different timezone, as shown in this survey."
                `
            },
            {
                id: "deductive-inductive",
                title: "Deductive vs Inductive Reasoning",
                content: `
### Two Ways to Build Arguments

**Deductive Reasoning: Certainty**
If your premises are true, your conclusion MUST be true.

*Student Example:*
- "All seniors get priority registration"
- "I am a senior"
- "Therefore, I get priority registration"

**Inductive Reasoning: Probability**
Your premises make your conclusion likely, but not certain.

*Student Example:*
- "Five of my friends found internships through LinkedIn"
- "Therefore, LinkedIn will probably help me find an internship too"

### When to Use Each
- **Deductive**: Use when dealing with rules, policies, or definitions
- **Inductive**: Use when predicting outcomes based on past patterns

### Professional Application
Most business decisions use inductive reasoning: "Our pilot test showed 80% customer satisfaction, so a full rollout will likely succeed." Always acknowledge the probability, not certainty.
                `
            },
            {
                id: "validity-soundness",
                title: "Validity vs Soundness",
                content: `
### Structure vs Truth

An argument can have perfect logic but still be wrong. Here's why:

**Validity** = The logical structure is correct
**Soundness** = Valid structure + True premises

### Student Example
"If I study all night, I'll ace the exam. I studied all night. Therefore, I'll ace the exam."

- **Valid?** Yes - the logic flows correctly
- **Sound?** No - the premise "studying all night leads to acing exams" may be false if sleep deprivation ruins your performance

### The Lesson
Don't just check if an argument follows logical rules. Check if the starting assumptions are actually true.

### Professional Example
"If we cut costs, profits will increase. We're cutting costs. Therefore, profits will increase."

Valid structure, but unsound if cutting costs damages product quality and drives away customers.
                `
            },
            {
                id: "hidden-assumptions",
                title: "Identifying Hidden Assumptions",
                content: `
### The Unstated Premises

Many arguments rely on assumptions that aren't explicitly stated. Finding these assumptions is key to evaluating arguments.

### How to Find Them
Ask: "What would need to be true for this conclusion to follow from these premises?"

### Student Exercise
When a friend says "We shouldn't have group projects," ask yourself:
- Hidden assumption: "Individual work is more effective than collaboration"
- Hidden assumption: "Everyone dislikes group projects"

### Professional Bridge
In team discussions, practice asking: "What assumption makes that claim true?"

This reveals whether everyone shares the same baseline understanding, or if there's a fundamental disagreement about the facts.

### Practice Drill
Next meeting you attend, write down three claims people make. For each claim, identify one hidden assumption.
                `
            }
        ]
    },
    {
        slug: "logical-fallacies",
        title: "Common Logical Fallacies and How to Spot Them",
        description: "Avoid reasoning traps. Learn to identify and counter common fallacies like ad hominem, straw man, and more.",
        level: "Beginner",
        tags: ["Fallacies", "Critical Thinking"],
        sections: [
            {
                id: "ad-hominem",
                title: "Ad Hominem - The Personal Attack",
                content: `
### Attacking the Person, Not the Argument

Instead of addressing someone's point, you attack their character, credentials, or circumstances.

### Student Example
"Your presentation idea is bad because you're not even a marketing major."
- Attacks the person's major, not the actual idea
- The quality of an idea doesn't depend on your major

### Professional Example
"This proposal won't work because you've only been here 6 months."
- Attacks tenure, not the proposal's merits
- New employees can have great ideas

### Why It's Wrong
An argument's validity doesn't depend on who makes it. Even if the person has flaws, their argument might still be correct.

### How to Counter
Redirect to the actual argument: "Let's focus on the merits of the proposal itself, regardless of who suggested it."
                `
            },
            {
                id: "straw-man",
                title: "Straw Man - Misrepresenting the Argument",
                content: `
### Attacking a Distorted Version

Instead of addressing what someone actually said, you twist their words into something easier to attack.

### Student Example
- You say: "I think lectures should be shorter"
- They respond: "So you want to learn nothing and waste everyone's time?"

They've turned "shorter lectures" into "learn nothing" - a much easier target.

### Professional Example
- You say: "Let's review our pricing strategy"
- They respond: "So you want to slash prices and lose all profit?"

They've turned "review" into "slash prices" - a distortion of your actual suggestion.

### How to Spot It
Ask yourself: "Is this really what they said, or is this an exaggeration?"

### How to Counter
Calmly restate your actual position: "That's not what I suggested. I'm proposing we review our pricing, not eliminate profit margins."
                `
            },
            {
                id: "false-cause",
                title: "False Cause - Correlation Without Causation",
                content: `
### Just Because A and B Happened Together Doesn't Mean A Caused B

This is one of the most common errors in reasoning - assuming that because two things occurred together, one caused the other.

### Student Example
"I drank coffee before every exam I did well on. Therefore, coffee causes good grades."

**The Problem:** You're ignoring other factors like:
- You studied hard before those exams
- They were subjects you're naturally good at
- You got enough sleep

### Professional Example
"Sales increased after we hired John in marketing. Therefore, John caused the sales increase."

**The Problem:** Ignoring:
- Seasonal buying trends
- A concurrent marketing campaign
- Competitor issues

### The Real Skill
When you see two things happening together, ask: "What else could explain this? What other factors am I missing?"

### How to Avoid It
Look for confounding variables - other factors that could explain the outcome.
                `
            },
            {
                id: "appeal-authority",
                title: "Appeal to Authority - Trusting Without Verification",
                content: `
### "They Said It, So It Must Be True"

Assuming something is correct simply because someone in authority said it.

### Student Example
"The professor said it, so it must be right."

**The Problem:** Even professors can make mistakes, be outdated, or be speaking outside their expertise.

### Professional Example
"The CEO approved it, so we shouldn't question it."

**The Problem:** CEOs don't have all the information and can make flawed decisions.

### When Authority IS Relevant
Authority matters when:
- The person is an expert IN THIS SPECIFIC FIELD
- They're citing evidence, not just opinion
- There's consensus among experts

### The Balance
Respect expertise, but verify claims independently. Good authorities welcome questions and can back up their positions with evidence.
                `
            },
            {
                id: "confirmation-bias",
                title: "Confirmation Bias - Seeking Agreeable Information",
                content: `
### Only Seeing What You Want to See

We naturally seek out information that confirms what we already believe and ignore contradicting evidence.

### How It Works
If you believe "Group projects are bad," you'll:
- Remember every bad group experience
- Forget successful collaborations
- Notice articles criticizing group work
- Skip articles praising collaboration

### Real-World Impact
This affects major decisions:
- Choosing a college based on one good review, ignoring red flags
- Investing in a company after reading only positive reports
- Defending a failing project by focusing only on small wins

### How to Combat It
**Actively seek disconfirming evidence.** Ask yourself:
- "What would prove me wrong?"
- "Am I ignoring contradictory data?"
- "Have I genuinely considered the alternative?"

### Professional Application
Before finalizing decisions, assign someone to play "devil's advocate" - their job is to find flaws in your reasoning.
                `
            },
            {
                id: "sunk-cost",
                title: "Sunk Cost Fallacy",
                content: `
### "I've Already Invested Too Much to Quit"

Continuing something because of past investment, not because of future benefit.

### Student Example
"I've already spent 2 years in this major. I can't switch now, even though I hate it."

**The Problem:** The 2 years are gone either way. The question is: what's best for the next 2 years?

### Professional Example
"We've already spent $100,000 on this project. We can't stop now."

**The Problem:** If the project is failing, continuing wastes MORE money. The $100K is already gone.

### The Right Question
Don't ask: "How much have I invested?"
Ask: "If I were starting fresh today, would I make this choice?"

### Real-World Decision Making
Past investment should inform (you've learned something), but not dictate future decisions. Evaluate options based on future costs and benefits, not past sunk costs.
                `
            }
        ]
    },
    {
        slug: "debating-techniques",
        title: "Debating Techniques and Best Practices",
        description: "A practical guide to winning debates — structuring points, countering effectively, and closing confidently.",
        level: "Intermediate",
        tags: ["Debate", "Strategy"],
        sections: [
            {
                id: "prep-framework",
                title: "The P.R.E.P. Framework",
                content: `
### Point - Reason - Evidence - Point (Restate)

This four-part structure ensures your arguments are complete and persuasive.

### The Structure
1. **Point**: State your claim clearly
2. **Reason**: Explain why it's true
3. **Evidence**: Provide proof
4. **Point**: Restate for emphasis

### Student Example
**Point:** "Group projects improve learning outcomes."
**Reason:** "Because collaboration exposes students to different perspectives and problem-solving approaches."
**Evidence:** "Research shows students in collaborative settings have 30% better knowledge retention than those working alone."
**Point (Restate):** "That's why incorporating more group work benefits our learning."

### Why It Works
- **Clarity**: Your audience knows exactly what you're claiming
- **Logic**: The reason shows your thinking
- **Credibility**: Evidence backs up your claim
- **Memory**: Restating helps the point stick

### Professional Application
Use this in emails, presentations, and proposals. It keeps your communication tight and persuasive.
                `
            },
            {
                id: "four-step-rebuttal",
                title: "The Four-Step Rebuttal",
                content: `
### Listen - Acknowledge - Counter - Explain

Never jump straight to disagreement. This structured approach makes your rebuttals more effective and respectful.

### The Four Steps

**1. Listen**
Actually hear their full argument before formulating your response.

**2. Acknowledge**
Show you understood their point: "I understand your concern about..."

**3. Counter**
Present your alternative view or contradicting evidence.

**4. Explain**
Tell them WHY your counter matters.

### Professional Example
**Them:** "We can't afford this software upgrade."

**Your Rebuttal:**
1. *Listen*: (Let them finish completely)
2. *Acknowledge*: "I understand the budget concerns..."
3. *Counter*: "...but the ROI analysis shows an 18-month payback period..."
4. *Explain*: "...because the automation saves 15 hours of manual work per week."

### Why This Works
- Acknowledgment builds rapport
- They feel heard, making them more receptive
- Your counter seems more reasonable, not combative
                `
            },
            {
                id: "strategic-concession",
                title: "Strategic Concession - The 'Even If' Technique",
                content: `
### Strengthen Your Position by Acknowledging Worst Cases

Sometimes the strongest move is to concede a point while showing it doesn't matter.

### The Formula
"Even if [their point], [your conclusion still holds] because [reason]."

### Student Example
"Even if implementing this new system is complex and takes extra time, the long-term benefits of better organization justify the initial effort."

You've acknowledged:
- Yes, it's complex
- Yes, it takes time

But shown these don't defeat your main argument.

### Professional Example
"Even if the timeline extends by three months, the quality improvement will protect our reputation and prevent costly recalls."

### Why It's Powerful
1. Shows intellectual honesty
2. Demonstrates you've thought through objections
3. Removes their attack angle
4. Proves your position is resilient

### When to Use
When you know an objection is coming, address it preemptively with "even if."
                `
            },
            {
                id: "framing-debate",
                title: "Framing the Debate",
                content: `
### Define Terms Early to Control the Discussion

How you frame an issue often determines who wins. Define key terms before diving into arguments.

### Why It Matters
The same policy can be framed as:
- "Investing in employees" vs "Increasing costs"
- "Freedom of choice" vs "Lack of regulation"

The frame shapes perception.

### Example: Quality vs Speed Debate
Before arguing, define "quality":
- Zero defects? (Impossible and expensive)
- Industry-standard defect rate? (Achievable)
- Customer satisfaction above X%? (Measurable)

Whoever defines "quality" shapes what winning looks like.

### How to Frame Effectively
1. Define ambiguous terms early
2. Choose definitions that favor your position (but remain reasonable)
3. Get agreement on definitions before proceeding

### Professional Application
In project planning: "Success means..." (define upfront)
In sales: "Value means..." (define on your terms)
                `
            },
            {
                id: "burden-proof",
                title: "Burden of Proof - Who Must Prove What?",
                content: `
### The Person Making the Claim Must Prove It

Understanding who bears the burden of proof is crucial to debate strategy.

### The Principle
If you're proposing a change or making a positive claim, YOU must provide evidence. The other side doesn't have to disprove you.

### Examples

**Wrong:** "Prove this new policy WON'T work."
**Right:** "Here's evidence this policy WILL work."

If you propose a new process, you must show it's better than the current one. Your opponent doesn't have to prove the current process is perfect.

### Strategic Use
When someone makes a claim without evidence, simply say: "What evidence supports that?" Don't waste energy disproving unsupported claims.

### Exception: Null Hypothesis
In some cases, the status quo is presumed correct until proven otherwise. Know when tradition bears the burden ("we've always done it this way" isn't enough) versus when innovation bears it (new requires justification).
                `
            },
            {
                id: "power-questions",
                title: "The Power of Strategic Questions",
                content: `
### Questions Expose Weak Arguments Better Than Statements

A well-placed question can unravel an argument more effectively than a direct counter.

### Types of Strategic Questions

**1. Evidence Questions**
- "What data supports that conclusion?"
- "Where did that statistic come from?"

**2. Assumption Questions**
- "What are we assuming to be true here?"
- "Does that hold in all cases?"

**3. Alternative Questions**
- "Have we considered other explanations?"
- "What if the opposite were true?"

**4. Consequence Questions**
- "What happens if we're wrong?"
- "What are the second-order effects?"

### Why Questions Work
- They shift burden of proof to the other person
- They expose flaws without sounding aggressive
- They make the other person think critically about their own position

### Professional Example
Instead of: "Your timeline is unrealistic."
Try: "What factors did you consider in this timeline? Have we accounted for X, Y, and Z?"

The question format invites dialogue rather than defense.
                `
            }
        ]
    },
    {
        slug: "critical-thinking",
        title: "Critical Thinking in Practice",
        description: "Sharpen your analytical skills with techniques used in critical thinking courses and real-world reasoning.",
        level: "Intermediate",
        tags: ["Analysis", "Philosophy"],
        sections: [
            {
                id: "first-principles",
                title: "First Principles Thinking",
                content: `
### Question Assumptions - Build from Fundamentals

Instead of copying what others do, break problems down to their most basic truths.

### Student Example
**Analogy Thinking:** "Everyone studies late at night, so I should too."

**First Principles:** Ask foundational questions:
- When do *I* actually focus best?
- What does research say about sleep and memory?
- What's the actual goal? (Knowledge retention, not just hours spent)

**Conclusion:** Study when YOUR brain works best, not when others study.

### Professional Example
**Analogy:** "Competitors use this feature, so we should too."

**First Principles:**
- What problem are we trying to solve?
- What do our specific customers need?
- What resources and capabilities do we have?

**Conclusion:** Build what solves YOUR customers' problems, not a copy of competitors.

### The Process
1. Identify the problem or goal
2. Break it down to fundamental truths
3. Rebuild the solution from those truths
4. Ignore "how it's always been done"

### Why It Matters
First principles thinking leads to innovation. Copying leads to commoditization.
                `
            },
            {
                id: "second-order",
                title: "Second-Order Thinking - Think Past the Obvious",
                content: `
### Every Action Has Consequences, and Those Have Consequences

Most people stop at first-order thinking (immediate results). Winners think second and third-order.

### Student Example

**Decision:** Skip class to finish an assignment

**First-Order Effect:** Assignment gets done (good!)

**Second-Order Effect:** Miss important lecture material

**Third-Order Effect:** Struggle on exam, spend more time studying later, more stress

**Outcome:** Short-term gain, long-term pain.

### Professional Example

**Decision:** Automate customer support to cut costs

**First-Order:** Save $100K annually (good!)

**Second-Order:** Customers frustrated with automated responses

**Third-Order:** Customer churn increases, negative reviews spread

**Fourth-Order:** Lost revenue exceeds the $100K saved

**Outcome:** Penny wise, pound foolish.

### How to Practice
Before making a decision, ask:
- "And then what?"
- "And then what?"
- "And then what?"

Keep asking until you've mapped out the ripple effects.

### The Skill
The best decisions optimize for second and third-order effects, not just immediate outcomes.
                `
            },
            {
                id: "inversion",
                title: "Inversion - Work Backwards from Failure",
                content: `
### Instead of "How Do I Succeed?" Ask "How Would I Definitely Fail?"

Inversion helps you identify and avoid critical mistakes.

### Student Example

**Traditional Question:** "How do I get an A in this course?"

**Inverted Question:** "How would I definitely fail this course?"

**Inverted Answers:**
- Never attend class
- Skip all assignments
- Don't study for exams
- Ignore the syllabus

**Action:** Make sure you NEVER do these things. Success follows.

### Professional Example

**Traditional:** "How do we make this project succeed?"

**Inverted:** "How would this project definitely fail?"

**Inverted Answers:**
- Unclear requirements
- No stakeholder buy-in
- Unrealistic timeline
- Poor communication

**Action:** Build safeguards against each failure mode.

### Why Inversion Works
- Failures are often easier to identify than successes
- Avoiding disaster is sometimes more important than chasing perfection
- It reveals blind spots in planning

### Application
Before starting any major endeavor, spend time on "pre-mortem": assume it failed, and work backwards to why.
                `
            },
            {
                id: "five-whys",
                title: "The Five Whys - Root Cause Analysis",
                content: `
### Keep Asking "Why?" to Find the Real Problem

Surface-level symptoms often hide deeper root causes. The Five Whys technique helps you dig deeper.

### The Method
Start with a problem. Ask "Why did this happen?" Then ask "Why?" about that answer. Repeat five times.

### Example: Failed Product Launch

**Problem:** Product launch failed.

**Why?** Marketing campaign didn't reach target audience.
**Why?** We used the wrong channels.
**Why?** We didn't research where our audience spends time.
**Why?** We skipped customer research to save time.
**Why?** Project was rushed due to unrealistic deadlines.

**Root Cause:** Unrealistic project timeline forced shortcuts that doomed the launch.

### The Insight
Fixing "marketing channels" (third layer) treats symptoms. Fixing "project timeline management" (fifth layer) prevents future failures.

### When to Use
- Post-mortems on failures
- Recurring problems
- When quick fixes don't stick
- Before assigning blame

### Important Note
Sometimes you hit the root in 3 whys, sometimes it takes 7. The number "five" is a guideline, not a rule. Stop when you've found a root cause you can actually address.
                `
            },
            {
                id: "probabilistic-thinking",
                title: "Probabilistic Thinking - Replace Certainty with Confidence",
                content: `
### Most Decisions Involve Uncertainty - Embrace It

Absolute certainty is rare. Learn to think in probabilities and confidence levels.

### The Shift

**Old Thinking:** "This will definitely work."

**Probabilistic Thinking:** "Based on available data, there's an 80% confidence this will work, with these known risks..."

### Why It Matters
1. **Honesty**: Acknowledges uncertainty
2. **Better Decisions**: Forces you to identify risks
3. **Adaptability**: You're prepared when the 20% happens

### How to Apply It

**Student Example:**
"I'm 90% confident I'll finish this project on time, assuming no major obstacles. The 10% risk factors are: unexpected bugs, sick days, or scope changes."

**Professional Example:**
"This marketing strategy has a 70% chance of increasing conversions by 20%, based on pilot data. Risk factors include: seasonal variations, competitor responses, and budget constraints."

### The Framework
1. State your confidence level (60%? 80%? 95%?)
2. Identify what would need to be true for the higher probability
3. List the main risk factors
4. Plan for the scenarios where you're wrong

### Calibration
Track your predictions. If you're right 80% of the time when you say "80% confident," you're well-calibrated. If not, adjust.
                `
            }
        ]
    },
    {
        slug: "argument-mapping",
        title: "Argument Mapping and Structured Reasoning",
        description: "Turn abstract thoughts into clear visual logic using maps and frameworks for better debate performance.",
        level: "Advanced",
        tags: ["Visualization", "Tools"],
        sections: [
            {
                id: "visual-hierarchy",
                title: "Visual Hierarchy - Organizing Your Argument",
                content: `
### Structure Your Thinking Before You Speak

Complex arguments need visual organization. A clear hierarchy makes your reasoning easy to follow.

### The Basic Structure

**Main Claim** (Top Level)
- Supporting Argument 1
  - Evidence A
  - Evidence B
- Supporting Argument 2
  - Evidence C
  - Evidence D
- Supporting Argument 3
  - Evidence E
  - Evidence F

### Student Example: Essay Outline

**Thesis:** Universities should embrace online learning

**Support 1:** Accessibility
- Evidence: Students in remote areas gain access
- Evidence: Reduces commute time and costs

**Support 2:** Flexibility
- Evidence: Students can learn at their own pace
- Evidence: Accommodates work schedules

**Support 3:** Cost-effectiveness
- Evidence: Lower infrastructure costs
- Evidence: Reaches more students per dollar

### Professional Example: Business Presentation

**Proposal:** Expand to Market Y

**Support 1:** Large addressable market
- Evidence: 50M potential customers
- Evidence: $5B market size

**Support 2:** Low competition
- Evidence: Only 3 competitors
- Evidence: No dominant player

**Support 3:** We have the capabilities
- Evidence: Existing distribution network
- Evidence: Similar customer profile

### Why It Works
Clean hierarchy = clear thinking. If you can't map it, you don't understand it well enough.
                `
            },
            {
                id: "pyramid-principle",
                title: "The Pyramid Principle - Start with the Conclusion",
                content: `
### Lead with Your Main Point, Then Support It

Most people build up to their conclusion. Effective communicators do the opposite.

### Traditional (Bottom-Up)
"We surveyed 500 customers. 80% want feature X. Competitors don't offer it. Engineering says it's feasible. Therefore, we should build feature X."

**Problem:** Listener is waiting to see where you're going.

### Pyramid (Top-Down)
"We should build feature X. Here's why: customer demand is high (80% want it), competitive advantage (nobody offers it), and feasibility (engineering confirms it's doable)."

**Benefit:** Listener immediately knows your point and can follow your reasoning.

### Professional Structure

**Top Level:** Conclusion/Recommendation
**Second Level:** 3-5 grouped supporting arguments
**Third Level:** Evidence for each argument

### Example
**"We should expand to Market Y"** (Top)

Why? Three reasons:
- **Large market** (Second level)
  - 50M potential customers (Evidence)
  - $5B market size (Evidence)
- **Low competition** (Second level)
  - Only 3 players (Evidence)
  - No dominant brand (Evidence)
- **We're capable** (Second level)
  - Existing distribution (Evidence)
  - Similar customer profile (Evidence)

### When to Use
- Executive presentations
- Business proposals
- Any communication where people are busy
                `
            },
            {
                id: "mece-principle",
                title: "MECE Principle - Complete and Non-Overlapping",
                content: `
### Mutually Exclusive, Collectively Exhaustive

Your arguments should cover everything (exhaustive) without overlapping (exclusive).

### What MECE Means

**Mutually Exclusive:** No overlap
**Collectively Exhaustive:** Covers all possibilities

### Student Example: Analyzing Study Time

**Not MECE:**
- Weekday studying
- Weekend studying
- Morning studying
- Evening studying

**Problem:** "Morning" and "Weekday" overlap!

**MECE Version 1:**
- Weekday studying
- Weekend studying

**MECE Version 2:**
- Morning studying (6am-12pm)
- Afternoon studying (12pm-6pm)
- Evening studying (6pm-12am)
- Night studying (12am-6am)

### Professional Example: Revenue Analysis

**Not MECE:**
- Product A sales
- Product B sales
- Online sales
- Retail sales

**Problem:** "Product A" can be sold "Online" or "Retail" - overlap!

**MECE:**
- Product A revenue
- Product B revenue
- Service revenue

OR

- Online channel revenue
- Retail channel revenue
- Direct sales revenue

### Why It Matters
MECE ensures:
- Nothing falls through cracks (exhaustive)
- No double-counting (exclusive)
- Clear, logical categories

### How to Check
Can an item fit into multiple categories? (Not exclusive)
Is there something that doesn't fit anywhere? (Not exhaustive)
                `
            },
            {
                id: "dependency-mapping",
                title: "Dependency Mapping - Understanding Argument Relationships",
                content: `
### Some Arguments Depend on Others

Not all supporting arguments are independent. Some only work if others are true first.

### Understanding Dependencies

**Independent Arguments:** Each stands alone
- Argument A can be true even if B is false
- Argument B can be true even if A is false

**Dependent Arguments:** One relies on another
- If Argument A is false, Argument B collapses
- B is built on the foundation of A

### Example: Expanding Business Hours

**Independent Arguments:**
1. Customers want later hours (survey data)
2. Competitors offer late hours (market research)

If #1 is false, #2 still supports the decision.

**Dependent Arguments:**
1. Later hours will bring more customers
2. More customers will increase revenue
3. Revenue will exceed the staffing costs

If #1 is false (late hours don't bring customers), then #2 and #3 automatically fail.

### Why This Matters
In debates, attack the foundational arguments. If you topple the foundation, dependent arguments collapse without needing to address them individually.

### How to Map Dependencies
1. List all your arguments
2. For each one, ask: "Does this require another argument to be true?"
3. Draw arrows showing dependencies
4. Ensure your foundation is rock-solid

### Professional Application
In project planning, map dependencies to know which risks are critical vs secondary.
                `
            },
            {
                id: "mapping-practice",
                title: "Practice Drill - Map Before You Present",
                content: `
### Turn Mapping into a Habit

The best debaters and communicators map their arguments before presenting them.

### The Exercise

**Step 1:** Take your next presentation, essay, or proposal

**Step 2:** On paper (or digital whiteboard), map it:
- What's my main claim?
- What are my 3-5 supporting arguments?
- What evidence backs each one?
- Are there dependencies?
- Is it MECE?

**Step 3:** Ask someone to review your map
- Can they follow your logic?
- Do they see gaps?
- Are there weak links?

**Step 4:** Revise the map, THEN create your actual content

### Why Maps First, Content Second

**Problem:** Most people write/speak first, then try to organize
**Solution:** Organize first (via mapping), then write/speak

Mapping reveals:
- Weak arguments you should drop
- Missing evidence you need to find
- Better ordering for impact

### Student Application
Before writing a term paper, map your argument. Your outline will be clearer and writing faster.

### Professional Application
Before big presentations, map on a whiteboard with your team. Polish the logic before polishing the slides.

### Success Metric
If you can't draw your argument as a clear map, you're not ready to present it.
                `
            }
        ]
    },
    {
        slug: "virtual-debate-tools",
        title: "Virtual Debate Platforms and Practice Tools",
        description: "Discover online platforms where you can practice structure and civility in real debates.",
        level: "All Levels",
        tags: ["Tools", "Practice"],
        sections: [
            {
                id: "practice-platforms",
                title: "Structured Practice Platforms",
                content: `
### Where to Practice Debate Skills

Reading about debate doesn't make you a debater. You need practice with feedback.

### Recommended Platforms

**Kialo (kialo.com)**
- Structured visual debates
- Arguments are mapped in a tree structure
- Forces clear reasoning (you can't just rant)
- Topics range from casual to serious
- **Best for:** Understanding argument structure

**Toastmasters**
- In-person public speaking practice
- Regular feedback from peers
- Variety of speech types
- Supportive environment
- **Best for:** Communication skills and presence

**Reddit CMV (r/ChangeMyView)**
- Text-based debates
- "Change My View" format
- Requires evidence and reasoning
- Awards for compelling arguments
- **Best for:** Persuasive writing

### How to Start
1. Choose ONE platform
2. Commit to 15 minutes daily for a month
3. Start by observing others
4. Then contribute small arguments
5. Gradually tackle bigger topics

### The Learning Curve
- Week 1: Feels awkward
- Week 2: Find your rhythm
- Week 3: Start seeing patterns
- Week 4: Notice improvement

### Student vs Professional Use
- **Students:** Focus on Kialo and Reddit CMV for flexible timing
- **Professionals:** Join Toastmasters for networking + skills
                `
            },
            {
                id: "ai-coach",
                title: "AI as Your Practice Partner",
                content: `
### Use AI to Find Weaknesses in Your Arguments

AI can serve as a tireless debate opponent and coach. Use it to test and strengthen your reasoning.

### Student Application

**The Prompt:**
"I'm arguing that universities should eliminate standardized testing. Challenge my position from the perspective of a university admissions officer who disagrees. Find the weakest points in my argument."

**What You Get:**
- Devil's advocate perspective
- Objections you hadn't considered
- Weak spots in your logic

### Professional Application

**The Prompt:**
"I'm proposing a remote-first policy to the leadership team. Challenge my proposal from the perspective of a skeptical CFO concerned about costs and productivity. What are my biggest vulnerabilities?"

**What You Get:**
- Financial objections
- Productivity concerns
- Questions you should prepare for

### Advanced Techniques

**1. Red Team Your Argument**
"Act as a hostile opponent trying to destroy my argument about [topic]. What are the fatal flaws?"

**2. Test Different Audiences**
"Challenge this from a conservative viewpoint" vs "Challenge this from a progressive viewpoint"

**3. Find Missing Evidence**
"What evidence would make my argument stronger?"

### The Discipline
Don't just use AI to write your arguments. Use it to attack them. The defense makes you stronger.
                `
            },
            {
                id: "fact-checking",
                title: "Fact-Checking Discipline",
                content: `
### Verify Before You Cite

In the age of misinformation, your credibility depends on accurate information.

### The 2-Source Rule
Before using a "fact" in a debate, verify it from at least TWO independent, primary sources.

### What Counts as a Source?

**Good Sources:**
- Academic journals
- Government data (census, official statistics)
- Original research papers
- Verified expert testimony

**Weak Sources:**
- Social media posts
- Opinion articles
- "Viral" claims
- Second-hand citations ("Studies show...")

### The Process

**1. Find the Claim**
"70% of startups fail in the first year."

**2. Trace to Primary Source**
- Who originally made this claim?
- What was their methodology?
- When was it published?

**3. Verify with Second Source**
Different research, same finding?

**4. Check Recency**
Is the data still relevant, or outdated?

### Red Flags
- "Studies show..." without citation
- Round numbers (70%, 90%)
- Extreme claims
- No named source

### Professional Standard
In work presentations, include citations:
"According to Stanford's 2023 study..." not just "Studies show..."

### The Payoff
One false statistic can destroy your credibility. Fact-checking protects your reputation.
                `
            },
            {
                id: "record-review",
                title: "Record and Review Your Performance",
                content: `
### You Can't Improve What You Don't Measure

Recording yourself reveals blind spots invisible in the moment.

### What to Record

**Students:**
- Class presentations
- Group discussion contributions
- Practice debates

**Professionals:**
- Team meetings where you present
- Client calls
- Practice pitches

### What to Look For

**Content Issues:**
- Filler words (um, uh, like, you know)
- Weak reasoning ("I think" vs "Evidence shows")
- Missing structure (rambling)
- Unclear conclusions

**Delivery Issues:**
- Speaking too fast/slow
- Monotone voice
- Poor eye contact
- Nervous gestures

### The Review Process

**1. Watch Within 24 Hours**
Memory is fresh about what you intended to say

**2. Use a Checklist**
Rate yourself 1-5 on:
- Clarity of main point
- Quality of evidence
- Logical flow
- Vocal variety
- Body language

**3. Identify ONE Thing to Improve**
Don't try to fix everything at once

**4. Practice That ONE Thing**
Focus until it becomes natural

### Month-Over-Month Comparison
Record similar presentations monthly. Watch your progress.

### The Hard Truth
It's uncomfortable watching yourself. Do it anyway. Champions study game film.
                `
            }
        ]
    },
    {
        slug: "debate-communication-skills",
        title: "Using Debate to Build Communication Skills",
        description: "Learn how debate practice improves communication, leadership, and persuasive speaking.",
        level: "All Levels",
        tags: ["Soft Skills", "Leadership"],
        sections: [
            {
                id: "executive-presence",
                title: "Executive Presence - Calm Confidence",
                content: `
### Confidence Without Arrogance, Clarity Without Condescension

Executive presence is how you carry yourself when stakes are high. It's earned through preparation and self-control.

### Student Context: Leading Group Discussions

**Low Presence:**
- Apologizes before speaking: "This might be wrong, but..."
- Speaks quietly, avoids eye contact
- Defers to others constantly

**Strong Presence:**
- States views clearly: "Here's what I think..."
- Maintains steady voice and eye contact
- Welcomes disagreement without getting defensive

### Professional Context: High-Stakes Meetings

**What It Looks Like:**
Watch how senior leaders speak in crisis:
- Calm, not rushed
- Factual, not emotional
- Decisive, not wishy-washy
- Brief, not rambling

### The Components

**1. Preparation**
You can't fake confidence if you don't know your material.

**2. Composure**
Slow down when nervous. Pause between thoughts.

**3. Clarity**
One clear message beats ten muddled ones.

**4. Conviction**
Believe in what you're saying. Others will sense it.

### How to Build It

**Practice This:**
Before important speaking moments:
- Deep breaths (5 counts in, 5 counts out)
- Remind yourself: "I'm prepared"
- Slow your cadence deliberately
- Make eye contact with one person at a time

### The Balance
Confident does not equal Arrogant
Being wrong with confidence is arrogance. Being right with humility is presence.
                `
            },
            {
                id: "active-listening",
                title: "Active Listening - Understanding, Not Just Responding",
                content: `
### Most People Listen to Reply, Not to Understand

The strongest debaters are the best listeners. They find weaknesses by truly understanding their opponent's position.

### The Problem

**Passive Listening:**
While the other person talks, you're:
- Planning your response
- Waiting for them to finish
- Thinking about what you'll say

**Result:** You miss key information and respond to what you assumed they said, not what they actually said.

### Active Listening

**The Mindset:**
"My only job right now is to understand their complete argument."

**The Technique:**
1. **Focus completely** on their words
2. **Note their main points** mentally
3. **Watch for assumptions** they're making
4. **Wait for complete thought** before responding

### Professional Benefit

**In Meetings:**
- You catch objections early
- You build rapport ("They actually listened!")
- You avoid misunderstandings
- You find common ground

### The 2-Second Rule
After they finish speaking, pause for 2 full seconds.
- Shows respect
- Gives you time to process
- Prevents interrupting

### Practice Exercise
Next conversation:
1. Let them finish completely
2. Summarize their point: "So you're saying..."
3. Confirm: "Did I get that right?"
4. THEN respond

### The Paradox
Want to win arguments? Listen better than your opponent. You'll understand their position better than they do.
                `
            },
            {
                id: "vocal-variety",
                title: "Vocal Variety - Avoiding the Monotone Trap",
                content: `
### Monotone Loses Attention, Variety Maintains It

Even brilliant arguments fail if delivered in a boring, flat voice.

### The Three Variables

**1. Pace (Speed)**
- Slow down for important points
- Speed up for background/context
- Pause for emphasis

**2. Pitch (High/Low)**
- Vary your tone
- Don't stay in one register
- Go lower for gravitas, higher for excitement

**3. Volume**
- Louder for key points
- Softer for intimate/serious moments
- Never shout unless to be heard

### Student Application

**Monotone Example:**
"I believe we should implement this change. First, it saves time. Second, it saves money. Third, it improves results."

**Varied Example:**
"I believe we should implement this change. [Pause] *First*, it saves time - [slower] twenty hours weekly. [Regular pace] *Second*, it saves money. And *third*? [Pause, then emphatic] It *dramatically* improves results."

### The TED Talk Standard
Watch popular TED talks. Notice:
- They vary pace every 30-60 seconds
- They pause after major points
- They emphasize with volume and pitch changes

### Practice Exercise

**Read this aloud with variation:**
"This is important. [Pause] What we decide today will impact our future. [Slower] Think carefully. [Pause] Are we ready to commit?"

Try it monotone, then try it with vocal variety. Feel the difference?

### Recording Exercise
Record yourself reading the same text:
- Once monotone
- Once with deliberate variation
Play them back. Which would hold your attention?
                `
            },
            {
                id: "body-language",
                title: "Body Language - The Silent Communication",
                content: `
### Your Body Speaks Even When Your Mouth Doesn't

Research suggests communication is:
- 7% words
- 38% tone
- 55% body language

### Key Elements

**1. Eye Contact**
- Engage with your audience
- Don't stare at one person
- Don't look at the floor or ceiling
- In presentations: 3-5 seconds per person

**2. Posture**
- Stand/sit up straight
- Open stance (no crossed arms)
- Face your audience squarely
- Take up appropriate space

**3. Gestures**
- Use hands to emphasize
- Keep movements purposeful, not nervous
- Avoid: fidgeting, pocket hands, crossed arms
- Match gestures to message intensity

**4. Movement**
- In presentations: move with purpose
- Don't pace or sway
- Stand still for key points
- Move during transitions

### What to Avoid

[X] Crossed arms (looks defensive)
[X] Hands in pockets (looks casual)
[X] Looking at phone/notes constantly
[X] Fidgeting with pen/hair/clothes
[X] Nervous pacing
[X] Leaning on furniture

### What to Do

[Check] Open posture
[Check] Purposeful gestures
[Check] Steady eye contact
[Check] Confident stance
[Check] Controlled movement

### Professional Context

**Video Calls:**
- Position camera at eye level
- Good lighting on your face
- Plain background
- Look at camera, not screen (for eye contact effect)

### Practice
Present in front of a mirror or record yourself. Your body language is visible to others even when you forget about it.
                `
            },
            {
                id: "handling-objections",
                title: "Handling Objections Gracefully",
                content: `
### Objections Are Opportunities, Not Attacks

How you handle pushback defines your professionalism.

### The Wrong Response

**Defensive:**
"That's not what I meant!"
"You're misunderstanding everything!"
"That's a stupid question."

**Result:** You look insecure, the discussion becomes combative.

### The Right Response

**The Formula:**
Acknowledge - Address - Move Forward

### Examples

**Objection:** "This costs too much."

**Wrong:** "No it doesn't!"

**Right:**
- **Acknowledge:** "That's a valid concern about the budget."
- **Address:** "The ROI analysis shows we'll recoup costs in 18 months through efficiency gains."
- **Move Forward:** "Would you like me to walk through the financial projections?"

**Objection:** "We tried something similar before and it failed."

**Wrong:** "That was different!"

**Right:**
- **Acknowledge:** "I appreciate you sharing that experience."
- **Address:** "This approach differs in three key ways: [X, Y, Z]. Here's how we've addressed the previous failure points."
- **Move Forward:** "What specific concerns from that experience should we ensure we handle differently?"

### Why This Works
- Shows respect for the objection
- Demonstrates you're listening
- Keeps discussion collaborative
- Maintains your credibility

### Advanced: Welcome Objections
"What concerns do you have?" invites dialogue before resistance builds.

### Student Application
Group projects: When teammates object to your idea, use this framework instead of getting defensive.
                `
            },
            {
                id: "audience-adaptation",
                title: "Adapting to Your Audience",
                content: `
### Same Message, Different Delivery

The best communicators adjust their approach based on who's listening.

### Know Your Audience

**Before Any Presentation, Ask:**
- What's their background knowledge?
- What do they care about?
- What level of detail do they want?
- What's their decision-making criteria?

### Example: Same Topic, Three Audiences

**Topic:** Implementing New Software

**To Technical Team:**
"This platform uses microservices architecture, integrates via REST APIs, and offers SDK support for Python and JavaScript. Database migration is handled through automated scripts with rollback capabilities."

**To Management:**
"This software will save 20 hours of manual work weekly, with an 18-month ROI. Implementation takes 6 weeks with minimal disruption to current operations."

**To End Users:**
"This new tool makes your daily tasks faster and easier. You'll spend less time on repetitive work and more time on important projects. Training takes just 2 hours."

### The Adaptation

**Technical audience:**
- Deep details
- How it works
- Technical specs
- Implementation challenges

**Executive audience:**
- Strategic impact
- ROI and costs
- Risk and timeline
- Bottom-line results

**General audience:**
- Benefits to them
- Ease of use
- Support available
- What changes for them

### Student Application

**Explaining Your Research:**
- To your professor: Technical methodology and academic rigor
- To classmates: Practical applications and interesting findings
- To family: Why it matters in simple terms

### The Warning
Don't talk down to any audience. Simplification does not equal condescension. Adjust complexity, not respect.
                `
            }
        ]
    }
];
