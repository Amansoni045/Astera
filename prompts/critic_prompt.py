"""Critic Prompt template definition."""

from langchain_core.prompts import ChatPromptTemplate

critic_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an objective research quality evaluator. Assess reports dynamically based on content depth, section structure, evidence, and clarity."),
    ("human", """Evaluate the research report below on a 1 to 10 quality scale.

Scoring Guide:
- 9-10/10: Outstanding depth, rigorous multi-section structure, cited sources, clear takeaways.
- 7-8/10: Strong report, good structure, readable formatting, solid insights.
- 5-6/10: Moderate report with basic information but lacking deeper analysis.
- 1-4/10: Incomplete or minimal report.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
- ...

Areas to Improve:
- ...

One line verdict:
..."""),
])
