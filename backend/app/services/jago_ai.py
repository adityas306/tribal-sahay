import os
import json

from google import genai


# --------------------------------------------------
# Gemini Configuration
# --------------------------------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.8-flash"
)


if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured"
    )


client = genai.Client(
    api_key=GEMINI_API_KEY
)


# --------------------------------------------------
# JAGO System Instructions
# --------------------------------------------------

SYSTEM_PROMPT = """
You are JAGO AI, the intelligent problem-solving
assistant inside TribalSahay.

Your job is NOT to behave like a fixed FAQ chatbot.

You should behave like a helpful AI problem solver.

Your responsibilities:

1. Understand the user's actual problem.

2. Have a natural conversation with the user.

3. Use previous conversation context.

4. Analyze complex problems step by step.

5. Use available user/application information.

6. Provide practical and actionable solutions.

7. If the problem cannot be solved directly,
   explain what the user should do next.

8. Ask clarification questions only when necessary.

9. Never invent application status, payment status,
   eligibility, documents, or government information.

10. Clearly distinguish actual user data from
    general information.

11. Try to solve problems outside predefined FAQ topics.

12. Respond in the same language as the user.

13. If the user uses Hinglish, respond in Hinglish.

14. If the user uses Hindi, respond in Hindi.

15. If the user uses English, respond in English.

16. Prefer step-by-step solutions for problems.

17. Never say:
    "I can only answer questions about..."

18. Always try to understand the user's real goal.

19. If more information is required, ask for it naturally.

You are an AI problem solver, not a keyword-based chatbot.
"""


# --------------------------------------------------
# Generate JAGO Response
# --------------------------------------------------

def generate_jago_response(
    message: str,
    context: dict,
    history=None
):

    if history is None:
        history = []


    # --------------------------------------------------
    # Prepare user context
    # --------------------------------------------------

    context_text = json.dumps(
        context,
        indent=2,
        default=str
    )


    # --------------------------------------------------
    # Build conversation history
    # --------------------------------------------------

    conversation = []

    for item in history[-10:]:

        conversation.append({
            "type": "user_input"
            if item.role == "user"
            else "model_output",

            "content": [
                {
                    "type": "text",
                    "text": item.text
                }
            ]
        })


    # --------------------------------------------------
    # Add current user message
    # --------------------------------------------------

    current_message = f"""
USER PROFILE AND AVAILABLE DATA:

{context_text}


CURRENT USER MESSAGE:

{message}


Analyze the user's problem carefully.

Use actual available data whenever relevant.

Do not invent information.

If some information is missing, explain what
information is required.

Try to provide a practical solution and clear
next steps instead of a generic FAQ answer.
"""


    conversation.append({
        "type": "user_input",

        "content": [
            {
                "type": "text",
                "text": current_message
            }
        ]
    })


    # --------------------------------------------------
    # Call Gemini Interactions API
    # --------------------------------------------------

    interaction = client.interactions.create(

        model=GEMINI_MODEL,

        input=conversation,

        system_instruction=SYSTEM_PROMPT,

        store=False
    )


    # --------------------------------------------------
    # Extract AI response
    # --------------------------------------------------

    if hasattr(interaction, "output_text"):

        if interaction.output_text:

            return interaction.output_text.strip()


    # --------------------------------------------------
    # Fallback response extraction
    # --------------------------------------------------

    if hasattr(interaction, "steps"):

        for step in reversed(interaction.steps):

            if hasattr(step, "content"):

                for content in reversed(step.content):

                    if hasattr(content, "text"):

                        if content.text:

                            return content.text.strip()


    return (
        "JAGO abhi response generate nahi kar pa raha hai. "
        "Please thodi der baad try karo."
    )
