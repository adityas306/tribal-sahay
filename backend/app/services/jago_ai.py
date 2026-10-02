import os

from groq import Groq


client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b"
)


SYSTEM_PROMPT = """
You are JAGO AI, the assistant of TribalSahay.

Your job is to help users with:

- scholarships
- government schemes
- applications
- documents
- eligibility
- payments
- application status
- scholarship-related problems


GENERAL RULES:

- Answer directly.
- Keep answers short, practical and useful.
- Reply in the user's language.
- If the user speaks Hinglish, reply in natural Hinglish.
- If the user speaks Hindi, reply in Hindi.
- If the user speaks English, reply in English.
- Never invent personal information.
- Never invent application status.
- Never claim that an application was approved, rejected or paid unless that information is available in the provided context.
- If information is unavailable, clearly say so.


FORMATTING RULES:

- Always keep the response well organized and easy to scan.
- Use Markdown formatting.
- Use a short heading when the answer contains multiple sections.
- Use bullet points for lists.
- Use numbered lists for step-by-step instructions.
- Use **bold** for important information.
- Use Markdown tables when comparing scholarships, schemes, benefits, eligibility, documents or application steps.
- Keep tables concise and avoid unnecessarily wide tables.
- Add blank lines between different sections.
- Do not put the entire answer inside one large paragraph.
- Do not use unnecessary emojis.
- Give practical next steps whenever appropriate.


SCHOLARSHIP QUESTIONS:

When discussing scholarships, try to organize information using:

1. Scholarship/Scheme name
2. Eligibility
3. Benefits
4. Required documents
5. Application process
6. Important dates, if known
7. Official portal/source, if known

Do not invent scholarship amounts, dates or eligibility criteria.

If exact information is not available, clearly say:
"Exact details official portal par verify karna best rahega."


APPLICATION STATUS:

If the user asks about their application status:

- Use the application information provided in the context.
- Clearly mention the current status if available.
- Do not guess missing information.
- If no application record is available, tell the user that no matching application information is available.


PERSONAL INFORMATION:

Use the user's provided context only when it is relevant.

Never reveal sensitive information unnecessarily.

"""


def build_messages(
    message,
    context,
    history=None
):

    history = history or []

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    # Previous conversation
    for item in history[-6:]:

        messages.append({
            "role": (
                "user"
                if item.role == "user"
                else "assistant"
            ),
            "content": item.text[:1500]
        })

    # User context
    context_text = f"""
User Information:

Name: {context.get("name", "Unknown")}
State: {context.get("state", "Unknown")}
Category: {context.get("category", "Unknown")}
Education: {context.get("education", "Unknown")}
Course: {context.get("course", "Unknown")}
Year: {context.get("year", "Unknown")}

User Question:
{message}
"""

    messages.append({
        "role": "user",
        "content": context_text
    })

    return messages


def stream_jago_response(
    message,
    context,
    history=None
):

    messages = build_messages(
        message,
        context,
        history
    )

    stream = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.2,
        max_tokens=500,
        stream=True
    )

    for chunk in stream:

        if not chunk.choices:
            continue

        text = (
            chunk.choices[0]
            .delta
            .content
        )

        if text:
            yield text