
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
        description: "Master the building blocks of logic. Learn how to construct unshakeable arguments using premises, conclusions, and valid structures.",
        level: "Beginner",
        tags: ["Fundamentals", "Logic"],
        sections: [
            {
                id: "introduction",
                title: "Introduction to Argumentation",
                content: `
In everyday language, an "argument" often means a shouting match on a news debate at 9 PM. But in logic and philosophy, an argument is a work of art. It is a structured series of statements intended to establish a definite proposition.

> **Key Concept:** An argument is a set of **premises** (reasons) given in support of a **conclusion** (the main claim).

Without this structure, you share an *opinion* (like a WhatsApp forward). With it, you build a *case*.

### Real-World Example: The Preamble to the Constitution of India
The Preamble is essentially one giant, structured argument for the Indian Republic.
*   **Premise 1 (The Source):** We, the People of India...
*   **Premise 2 (The Resolve):** Having solemnly resolved to constitute India into a Sovereign Socialist Secular Democratic Republic...
*   **Premise 3 (The Values):** And to secure to all its citizens Justice, Liberty, Equality, and Fraternity...
*   **Conclusion:** In our Constituent Assembly, do hereby Adopt, Enact, and Give to ourselves this Constitution.

If you don't accept the premises (the will of the people and the values), the conclusion (the authority of the Constitution) collapses.
        `
            },
            {
                id: "premises",
                title: "The Power of Premises",
                content: `
Premises are the pillars that hold up your conclusion. If the pillars are weak, the roof collapses.

### Types of Premises
1.  **Empirical Premises:** Based on observation or facts.
    *   *Example:* "Bangalore traffic peaks between 6 PM and 8 PM." (Verifiable fact)
2.  **Normative Premises:** Based on values, ethics, or culture.
    *   *Example:* "We should respect our elders." (Cultural value)
3.  **Definitional Premises:** Based on the meaning of words.
    *   *Example:* "India is a democracy."

### The "Hidden" Premise (Enthymeme)
Often, we leave premises out because we think they are obvious. This is risky in diverse India.
*   *Statement:* "He scored 98% in CBSE, so he will be successful."
*   *Hidden Premise:* "Academic marks are the sole predictor of success."
*   *Analysis:* By exposing this hidden premise, you can easily challenge the argument (referencing successful entrepreneurs who weren't toppers).
        `
            },
            {
                id: "validity-soundness",
                title: "Validity vs. Soundness: The Gold Standard",
                content: `
This is the most critical distinction in logic, often seen in Supreme Court judgments.

### 1. Validity (The Structure)
An argument is **valid** if the conclusion *logically follows* from the premises. It represents an unbreakable chain.

*   **Valid (but false) Argument:**
    *   Premise 1: If it rains in Mumbai, the sea turns into sambar.
    *   Premise 2: It is raining in Mumbai.
    *   Conclusion: Therefore, the sea is sambar.
    *   *Why it's valid:* The logic flows perfectly. The flaw is in the facts.

### 2. Soundness (The Truth)
An argument is **sound** if it is **Valid** AND all its premises are **True**.

> **The Goal:** In a courtroom or a debate, you want a **sound** argument.

### Real-World Example: Legal Cases
*   **Prosecution:** Argues the accused was at the scene (Premise A) and had a motive (Premise B), so they are guilty.
*   **Defense:** Might argue the CCTV footage (Premise A) is blurry/inadmissible. They attack the *truth* of the premise to break the soundness of the case.
        `
            }
        ]
    },
    {
        slug: "logical-fallacies",
        title: "Common Logical Fallacies",
        description: "A field guide to bad reasoning. Learn to spot the tricks, traps, and errors that politicians, advertisers, and relatives use.",
        level: "Beginner",
        tags: ["Fallacies", "Critical Thinking"],
        sections: [
            {
                id: "intro-fallacies",
                title: "The Anatomy of a Lie",
                content: `
A logical fallacy is a glitch in reasoning. It is an argument that *sounds* effective (especially in emotional speeches) but is logically flawed. Learning these is like having an X-ray vision for fake news.
        `
            },
            {
                id: "ad-hominem",
                title: "Ad Hominem (Attacking the Person)",
                content: `
**The Flaw:** Instead of addressing the argument/policy, you attack the person making it.

### Real-World Example: Political Discourse
*   *Scenario:* A young leader proposes a new economic policy for farmers.
*   *Opponent:* "What does this person know about farming? They have never held a plough! They are a product of nepotism."
*   *Analysis:* The leader's background is irrelevant to whether the *economic match* of the policy works. A bad person can make a good argument, and a good person can make a bad one.

### How to Counter
"Let's focus on the policy details, not my biography. Which specific clause in this bill is problematic?"
        `
            },
            {
                id: "straw-man",
                title: "The Straw Man Fallacy",
                content: `
**The Flaw:** Twisting your opponent's words into a weaker, simplified version that is easy to defeat.

### Real-World Example: Cultural Debates
*   *Argument:* "We need to modernize our education system to include AI and coding."
*   *Straw Man Response:* "Oh, so you want to destroy our ancient culture and forget our history? You want us all to become westernized robots?"
*   *Analysis:* The responder attacked a position ("destroy culture") that the first person never took.

### How to Counter
"I never said we should forget history. I said we should *add* AI. Please address my actual point about curriculum updates."
        `
            },
            {
                id: "slippery-slope",
                title: "The Slippery Slope",
                content: `
**The Flaw:** Claiming that a small step will inevitably lead to a chain reaction of disaster, without evidence.

### Real-World Example: Censorship
*   *Argument:* "If we ban this one controversial movie scene, next the government will ban books, then they will ban news channels, and soon we will live in a total dictatorship!"
*   *Analysis:* While censorship is a valid concern, assuming that *one* cut inevitably leads to *total dictatorship* is an emotional exaggeration unless proven.

### How to Counter
"You are assuming a worst-case chain reaction. Can we discuss the merits of this specific case without assuming the apocalypse?"
        `
            },
            {
                id: "sunk-cost",
                title: "The Sunk Cost Fallacy",
                content: `
**The Flaw:** Continuing a course of action just because you've already invested time/money, even if it's failing.

### Real-World Example: The "Engineering" Trap
*   *Scenario:* A student spends 2 years in Kota preparing for JEE. They realize they hate engineering and love literature.
*   *The Trap:* "I can't quit now, my parents spent lakhs on coaching! I have to finish the degree."
*   *Result:* They spend 4 more years being miserable and become a bad engineer.
*   *Rational Choice:* The money is already gone (sunk). The decision should be based on the *future* happiness, not past expense.

**Loophole:** "Don't throw good money after bad."
        `
            }
        ]
    },
    {
        slug: "debating-techniques",
        title: "Advanced Debating Techniques",
        description: "Strategies to win arguments in boardrooms and competitions. Learn how to dismantle opponents and win over judges.",
        level: "Intermediate",
        tags: ["Debate", "Strategy"],
        sections: [
            {
                id: "rebuttal-strategy",
                title: "Strategic Rebuttal: The 'Even If' Layering",
                content: `
Novice debaters just say "No." Masters use layering.

**The 'Even If' Technique:**
You attack the argument on multiple levels.

*   *Scenario:* Debating a new highway project.
1.  **Direct Denial:** "The government claims it will save 2 hours. Studies show it will only save 15 mins due to induced traffic." (Fact checking)
2.  **Mitigation:** "Even if it saves 2 hours, the toll prices are so high that common people can't use it." (Impact checking)
3.  **Turning:** "In fact, by cutting through the forest, it destroys the local water table, hurting the very farmers it claims to help." (Turning the benefit into a harm)

### Why this works
You give the judge/audience three separate reasons to agree with you.
        `
            },
            {
                id: "weighing",
                title: "Impact Calculus (Weighing)",
                content: `
Debates are rarely "Good vs. Bad." They are "Good vs. Good" (Development vs. Environment). You win by telling us *how* to measure.

**The Criteria:**
1.  **Magnitude:** (Number of people affected).
2.  **Probability:** (Likelihood of happening).
3.  **Irreversibility:** (Can we fix it later?).

### Real-World Example: Aarey Forest vs. Metro Car Shed
*   *Side A (Metro):* **Magnitude**. Millions of commuters benefit daily from faster travel.
*   *Side B (Forest):* **Irreversibility**. Once a forest ecosystem is destroyed, you cannot just "rebuild" it in a year. Trees take decades.
*   *The Weighing:* Does the immediate comfort of millions weigh less than the permanent loss of an ecosystem?
        `
            }
        ]
    },
    {
        slug: "critical-thinking",
        title: "Critical Thinking & Mental Models",
        description: "Upgrade your mental operating system. Models to analyze complex Indian problems like a genius.",
        level: "Intermediate",
        tags: ["Analysis", "Philosophy"],
        sections: [
            {
                id: "steel-manning",
                title: "The Steel Man Principle",
                content: `
Instead of attacking the weak version of an opponent's argument ("Straw Man"), attack the strongest version ("Steel Man").

**The Technique:**
Before you argue against a policy (e.g., GST), try to explain the benefits of GST *better* than the Finance Minister.
"GST simplifies the tax structure, widens the tax base, and removes the cascading effect of taxes."

**Then** explain why it might still have failed in implementation.
People listen when they feel understood. "You explained my point perfectly. Now tell me why you disagree."
        `
            },
            {
                id: "first-principles",
                title: "First Principles Thinking",
                content: `
Reasoning by analogy is copying ("We do it this way because the West does it"). First principles is physics.

### Real-World Example: ISRO & Mangalyaan
When India wanted to go to Mars, analogy thinking said: "NASA spends billions. We are poor, we can't afford it."
**First Principles Thinking by ISRO:**
*   What is the physics required? We need to escape Earth's gravity.
*   Do we need a massive rocket? No, we can use the "slingshot" method (gravity assist) to fling the satellite using Earth's own rotation.
*   Result: India reached Mars for ~$74 Million. Less than the budget of the Hollywood movie *Gravity*.

**Lesson:** Don't ask "How much does it usually cost?" Ask "What is fundamentally required?"
        `
            }
        ]
    },
    {
        slug: "argument-mapping",
        title: "Visualizing Logic: Argument Mapping",
        description: "Don't just write arguments—draw them. Key for cracking competitive exams like UPSC or CLAT.",
        level: "Advanced",
        tags: ["Visualization", "Tools"],
        sections: [
            {
                id: "why-map",
                title: "The Geography of Thought",
                content: `
Indian competitive exams (UPSC, CAT, CLAT) are tough because they test *structured thinking*, not just memory. Argument mapping helps you visualize complex editorials or judgments.

**Visualizing a Joint Family vs. Nuclear Family Debate:**
*   **Root:** "Nuclear families are better for modern cities."
*   **Green Branch (Pro):** "Greater mobility for jobs." -> Evidence: Migration stats.
*   **Red Branch (Con):** "Loss of support system for childcare." -> Evidence: Cost of crèches.
        `
            }
        ]
    },
    {
        slug: "debate-communication-skills",
        title: "Communication Mastery",
        description: "Soft skills for hard situations. Speak with the authority of a leader.",
        level: "All Levels",
        tags: ["Soft Skills", "Leadership"],
        sections: [
            {
                id: "executive-presence",
                title: "Executive Presence",
                content: `
Executive presence is not about being the loudest in the room. It is about "Th ठहराव" (Gravitas).

### The Archetype: Ratan Tata or Dr. APJ Abdul Kalam
Notice how they spoke?
*   Never rushed.
*   Clear assertions.
*   Humble but firm.

In a debate or interview, panic kills credibility. Silence is better than "umm... actually...".
        `
            },
            {
                id: "active-listening",
                title: "Radical Listening (Chai Pe Charcha)",
                content: `
To refute an argument, you must understand it better than the speaker.

**The Check:**
"Before I reply, let me see if I understood you. You are saying [X] because of [Y]. Sahi hai na?"
When they say "Haan, sahi hai," then you start your rebuttal. This creates a dialogue, not a war.
        `
            }
        ]
    }
];
