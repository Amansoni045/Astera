"""Critic Chain module for report evaluation."""

from langchain_core.output_parsers import StrOutputParser
from models.llm import get_llm
from prompts.critic_prompt import critic_prompt

critic_chain = critic_prompt | get_llm() | StrOutputParser()
