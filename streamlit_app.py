import streamlit as st
import json
from google import genai

# ---------------------------------------
# PAGE CONFIG
# ---------------------------------------

st.set_page_config(
    page_title="🤖 AI English Tutor",
    page_icon="🤖",
    layout="wide"
)

st.title("🤖 AI English Tutor")
st.caption("Learn English with AI • Grammar • Vocabulary • Conversation")

# ---------------------------------------
# LOAD API KEY
# ---------------------------------------

try:
    API_KEY = st.secrets["GEMINI_API_KEY"]
except Exception:
    API_KEY = st.sidebar.text_input(
        "Gemini API Key",
        type="password"
    )

client = None

if API_KEY:
    client = genai.Client(api_key=API_KEY)

# ---------------------------------------
# SIDEBAR
# ---------------------------------------

st.sidebar.title("⚙ Tutor Settings")

level = st.sidebar.selectbox(
    "English Level",
    [
        "Beginner",
        "Intermediate",
        "Advanced"
    ]
)

topic = st.sidebar.selectbox(
    "Conversation Topic",
    [
        "Daily Conversation",
        "Travel",
        "Job Interview",
        "Technology",
        "Business",
        "Restaurant",
        "Grammar Practice"
    ]
)

teacher = st.sidebar.selectbox(
    "Tutor Style",
    [
        "Friendly",
        "Strict",
        "Professional",
        "Motivational"
    ]
)

grammar_check = st.sidebar.checkbox(
    "Grammar Correction",
    True
)

vocab_mode = st.sidebar.checkbox(
    "Vocabulary Suggestions",
    True
)

# ---------------------------------------
# SESSION
# ---------------------------------------

if "messages" not in st.session_state:

    st.session_state.messages = [

        {
            "role":"assistant",
            "content":"👋 Hello!\n\nI'm your AI English Tutor.\n\nLet's improve your English together!"
        }

    ]

if "vocabulary" not in st.session_state:
    st.session_state.vocabulary = []

# ---------------------------------------
# TABS
# ---------------------------------------

chat_tab, vocab_tab, grammar_tab = st.tabs(
    [
        "💬 Chat",
        "📚 Vocabulary",
        "✍ Grammar"
    ]
)# ==========================================================
# CHAT TAB
# ==========================================================

with chat_tab:

    st.subheader("💬 Chat with Your AI English Tutor")

    # Show chat history
    for message in st.session_state.messages:

        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # User input
    if prompt := st.chat_input("Type your message..."):

        st.session_state.messages.append(
            {
                "role": "user",
                "content": prompt
            }
        )

        with st.chat_message("user"):
            st.markdown(prompt)

        # If API key missing
        if client is None:

            with st.chat_message("assistant"):
                st.error("Please provide your Gemini API Key.")

        else:

            with st.chat_message("assistant"):

                with st.spinner("Thinking..."):

                    system_prompt = f"""
You are an English Tutor.

Student Level:
{level}

Tutor Style:
{teacher}

Conversation Topic:
{topic}

Always answer in JSON format exactly like this:

{{
"reply":"Your conversational reply",
"grammar":"Corrected version of user's sentence",
"mistakes":["mistake1","mistake2"],
"vocabulary":[
{{"word":"example","meaning":"meaning"}},
{{"word":"another","meaning":"meaning"}}
]
}}

Rules:

1. Reply naturally.
2. Correct grammar.
3. Explain mistakes briefly.
4. Give 2-5 useful vocabulary words.
5. JSON only.
"""

                    try:

                        response = client.models.generate_content(
                            model="gemini-3.6-flash",
                            contents=system_prompt + "\n\nStudent: " + prompt
                        )

                        raw = response.text.strip()

                        # Remove markdown if Gemini wraps JSON
                        raw = raw.replace("```json", "")
                        raw = raw.replace("```", "").strip()

                        try:
                            data = json.loads(raw)

                        except Exception:
                            data = {
                                "reply": raw,
                                "grammar": "",
                                "mistakes": [],
                                "vocabulary": []
                            }

                        reply = data.get("reply", "")
                        grammar = data.get("grammar", "")
                        mistakes = data.get("mistakes", [])
                        vocabulary = data.get("vocabulary", [])

                        st.markdown(reply)

                        # Save assistant reply
                        st.session_state.messages.append(
                            {
                                "role": "assistant",
                                "content": reply
                            }
                        )

                        # Grammar Section
                        if grammar_check and grammar:

                            st.divider()
                            st.markdown("### ✍ Grammar Correction")
                            st.success(grammar)

                        # Mistakes
                        if mistakes:

                            st.markdown("### ❌ Mistakes")

                            for m in mistakes:
                                st.write("•", m)

                        # Vocabulary
                        if vocab_mode:

                            if vocabulary:

                                st.divider()
                                st.markdown("### 📚 New Vocabulary")

                                for item in vocabulary:

                                    word = item.get("word", "")
                                    meaning = item.get("meaning", "")

                                    st.info(f"**{word}** — {meaning}")

                                    st.session_state.vocabulary.append(
                                        {
                                            "word": word,
                                            "meaning": meaning
                                        }
                                    )

                    except Exception as e:

                        st.error(e)# ==========================================================
# VOCABULARY TAB
# ==========================================================

with vocab_tab:

    st.subheader("📚 Vocabulary Notebook")

    if len(st.session_state.vocabulary) == 0:

        st.info("No vocabulary collected yet. Start chatting!")

    else:

        unique_words = []

        seen = set()

        for item in st.session_state.vocabulary:

            word = item.get("word", "").lower()

            if word not in seen:

                seen.add(word)
                unique_words.append(item)

        search = st.text_input(
            "🔍 Search a word"
        )

        if search:

            filtered = []

            for item in unique_words:

                if search.lower() in item["word"].lower():

                    filtered.append(item)

        else:

            filtered = unique_words

        st.write(f"### Total Words : {len(filtered)}")

        for item in filtered:

            st.markdown(
                f"""
**📖 {item['word']}**

Meaning:
{item['meaning']}
"""
            )

            st.divider()

        import pandas as pd

        df = pd.DataFrame(filtered)

        csv = df.to_csv(index=False).encode("utf-8")

        st.download_button(

            "⬇ Download Vocabulary",

            csv,

            file_name="vocabulary.csv",

            mime="text/csv"

        )

        if st.button("🗑 Clear Vocabulary"):

            st.session_state.vocabulary = []

            st.rerun()


# ==========================================================
# GRAMMAR TAB
# ==========================================================

with grammar_tab:

    st.subheader("✍ Grammar Checker")

    grammar_text = st.text_area(

        "Write your English here",

        height=200

    )

    if st.button("Check Grammar"):

        if grammar_text.strip() == "":

            st.warning("Please enter some text.")

        elif client is None:

            st.error("Gemini API Key missing.")

        else:

            with st.spinner("Checking..."):

                prompt = f"""
You are an English Grammar Expert.

Return ONLY JSON.

{{
"corrected":"",
"errors":[
""
],
"tips":[
""
]
}}

Correct this text:

{grammar_text}
"""

                try:

                    response = client.models.generate_content(

                        model="gemini-3.6-flash",

                        contents=prompt

                    )

                    raw = response.text.strip()

                    raw = raw.replace("```json","")
                    raw = raw.replace("```","")

                    data = json.loads(raw)

                    st.success("Corrected Text")

                    st.write(data.get("corrected",""))

                    st.divider()

                    st.markdown("### ❌ Errors")

                    for e in data.get("errors",[]):

                        st.write("•", e)

                    st.divider()

                    st.markdown("### 💡 Tips")

                    for t in data.get("tips",[]):

                        st.write("•", t)

                except Exception as e:

                    st.error(e)


# ==========================================================
# SIDEBAR UTILITIES
# ==========================================================

st.sidebar.divider()

st.sidebar.subheader("📊 Statistics")

st.sidebar.metric(

    "Messages",

    len(st.session_state.messages)

)

st.sidebar.metric(

    "Vocabulary",

    len(st.session_state.vocabulary)

)

st.sidebar.divider()

if st.sidebar.button("🧹 Clear Chat"):

    st.session_state.messages = [

        {

            "role":"assistant",

            "content":"👋 Hello! I'm your AI English Tutor."

        }

    ]

    st.rerun()

st.sidebar.success("✅ Gemini 3.6 Flash Connected")
