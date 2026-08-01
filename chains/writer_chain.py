from langchain_core.output_parsers import StrOutputParser
from models.llm import get_llm
from prompts.writer_prompt import writer_prompt

writer_chain = writer_prompt | get_llm() | StrOutputParser()
