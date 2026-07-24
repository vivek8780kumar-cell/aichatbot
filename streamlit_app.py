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

st.sidebar.success("✅ Gemini 3.6 Flash Connected")# ==========================================================
# EXTRA IMPORTS
# ==========================================================

import pandas as pd
import plotly.express as px
from fpdf import FPDF

try:
    from streamlit_mic_recorder import speech_to_text
    MIC_AVAILABLE = True
except Exception:
    MIC_AVAILABLE = False


# ==========================================================
# SESSION VARIABLES
# ==========================================================

if "xp" not in st.session_state:
    st.session_state.xp = 0

if "streak" not in st.session_state:
    st.session_state.streak = 1

if "theme" not in st.session_state:
    st.session_state.theme = "Light"


# ==========================================================
# VOICE INPUT
# ==========================================================

st.sidebar.divider()
st.sidebar.subheader("🎤 Voice Conversation")

if MIC_AVAILABLE:

    speech = speech_to_text(
        language="en",
        start_prompt="🎤 Start",
        stop_prompt="⏹ Stop",
        key="speech"
    )

    if speech:

        st.sidebar.success("Voice Captured")

        st.sidebar.write(speech)

else:

    st.sidebar.info(
        "Install streamlit-mic-recorder for voice input."
    )


# ==========================================================
# THEME
# ==========================================================

st.sidebar.divider()

st.session_state.theme = st.sidebar.radio(

    "🎨 Theme",

    ["Light", "Dark"]

)

if st.session_state.theme == "Dark":

    st.markdown("""
<style>

.stApp{
background:#0e1117;
color:white;
}

</style>
""", unsafe_allow_html=True)


# ==========================================================
# PROGRESS DASHBOARD
# ==========================================================

st.divider()

st.header("📈 Learning Dashboard")

total_messages = len(st.session_state.messages)

total_words = len(st.session_state.vocabulary)

st.session_state.xp = total_messages * 5 + total_words * 3

c1, c2, c3 = st.columns(3)

c1.metric(
    "⭐ XP",
    st.session_state.xp
)

c2.metric(
    "🔥 Streak",
    st.session_state.streak
)

c3.metric(
    "📚 Words Learned",
    total_words
)


progress = pd.DataFrame({

    "Metric":[
        "Messages",
        "Vocabulary",
        "XP"
    ],

    "Value":[
        total_messages,
        total_words,
        st.session_state.xp
    ]

})

fig = px.bar(

    progress,

    x="Metric",

    y="Value",

    title="Learning Progress"

)

st.plotly_chart(
    fig,
    use_container_width=True
)


# ==========================================================
# ACHIEVEMENTS
# ==========================================================

st.subheader("🏆 Achievements")

if st.session_state.xp >= 50:
    st.success("🥉 Bronze Learner")

if st.session_state.xp >= 150:
    st.success("🥈 Silver Learner")

if st.session_state.xp >= 300:
    st.success("🥇 Gold Learner")

if st.session_state.xp >= 500:
    st.success("💎 Diamond Learner")


# ==========================================================
# EXPORT CHAT
# ==========================================================

st.divider()

if st.button("📄 Export Chat as PDF"):

    pdf = FPDF()

    pdf.add_page()

    pdf.set_font("Helvetica", size=12)

    pdf.cell(
        200,
        10,
        "AI English Tutor Chat",
        ln=True
    )

    pdf.ln(5)

    for msg in st.session_state.messages:

        role = msg["role"].upper()

        text = msg["content"]

        pdf.multi_cell(

            0,

            8,

            f"{role}: {text}"

        )

        pdf.ln(2)

    pdf.output("chat_history.pdf")

    with open("chat_history.pdf", "rb") as f:

        st.download_button(

            "⬇ Download PDF",

            f,

            file_name="chat_history.pdf",

            mime="application/pdf"

        )


# ==========================================================
# DAILY ENGLISH TIP
# ==========================================================

tips = [

    "Read one English article every day.",

    "Learn five new words daily.",

    "Watch English videos with subtitles.",

    "Think in English instead of translating.",

    "Speak aloud for ten minutes every day."

]

import random

st.info(
    "💡 Daily Tip: " + random.choice(tips)
)


# ==========================================================
# FOOTER
# ==========================================================

st.divider()

st.caption(
    "🚀 Powered by Google Gemini 3.6 Flash | Built with Streamlit"
)# ==========================================================
# EXTRA IMPORTS
# ==========================================================

import os
import json
import random
import datetime


# ==========================================================
# SESSION VARIABLES
# ==========================================================

if "quiz_score" not in st.session_state:
    st.session_state.quiz_score = 0

if "history" not in st.session_state:
    st.session_state.history = []


# ==========================================================
# AI AVATAR
# ==========================================================

st.markdown("""
<div style='text-align:center;font-size:80px'>
🤖
</div>
""", unsafe_allow_html=True)


# ==========================================================
# TYPING ANIMATION
# ==========================================================

typing_placeholder = st.empty()

typing_placeholder.markdown(
"""
<div style="font-size:18px;color:gray">
AI is ready to help you...
</div>
""",
unsafe_allow_html=True
)


# ==========================================================
# TRANSLATION
# ==========================================================

st.divider()

st.subheader("🌍 Translate English")

translate_text = st.text_area(
    "Enter English text"
)

language = st.selectbox(
    "Translate To",
    [
        "Hindi",
        "French",
        "German",
        "Spanish",
        "Japanese",
        "Chinese"
    ]
)

if st.button("Translate"):

    prompt = f"""
Translate the following English into {language}.

Only return translated text.

Text:

{translate_text}
"""

    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=prompt

        )

        st.success(response.text)

    except Exception as e:

        st.error(e)


# ==========================================================
# IELTS PRACTICE
# ==========================================================

st.divider()

st.subheader("📝 IELTS Speaking Practice")

if st.button("Generate IELTS Question"):

    prompt = """
Generate one IELTS Speaking Part 2 question.
"""

    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=prompt

        )

        st.info(response.text)

    except Exception as e:

        st.error(e)


# ==========================================================
# DAILY QUIZ
# ==========================================================

st.divider()

st.subheader("🎯 Daily English Quiz")

quiz = {

"Which sentence is correct?":[

"I has a pen.",

"I have a pen.",

"I having pen.",

"I am has pen."

]

}

question = list(quiz.keys())[0]

st.write(question)

answer = st.radio(

"Choose",

quiz[question]

)

if st.button("Submit Quiz"):

    if answer == "I have a pen.":

        st.success("Correct!")

        st.session_state.quiz_score += 1

    else:

        st.error("Incorrect")


st.metric(

"Quiz Score",

st.session_state.quiz_score

)


# ==========================================================
# SAVE HISTORY
# ==========================================================

st.divider()

st.subheader("💾 Save Progress")

if st.button("Save Progress"):

    data = {

        "messages":st.session_state.messages,

        "vocabulary":st.session_state.vocabulary,

        "xp":st.session_state.xp,

        "quiz":st.session_state.quiz_score,

        "date":str(datetime.datetime.now())

    }

    with open("progress.json","w") as f:

        json.dump(data,f,indent=4)

    st.success("Progress Saved")


if os.path.exists("progress.json"):

    with open("progress.json","rb") as f:

        st.download_button(

            "⬇ Download Progress",

            f,

            file_name="progress.json"

        )


# ==========================================================
# PERFORMANCE HISTORY
# ==========================================================

st.divider()

st.subheader("📊 Performance")

st.session_state.history.append({

    "XP":st.session_state.xp,

    "Vocabulary":len(st.session_state.vocabulary),

    "Quiz":st.session_state.quiz_score

})

history = st.session_state.history

if len(history)>0:

    import pandas as pd

    df = pd.DataFrame(history)

    st.line_chart(df)


# ==========================================================
# MOTIVATION
# ==========================================================

quotes=[

"Practice makes perfect.",

"Never stop learning.",

"Speak English every day.",

"Confidence comes with practice.",

"Small progress every day leads to big success."

]

st.success(random.choice(quotes))


# ==========================================================
# FOOTER
# ==========================================================

st.divider()

st.markdown(
"""
<center>

### 🚀 AI English Tutor

Powered by Google Gemini 3.6 Flash

Made with ❤️ using Streamlit

</center>
""",
unsafe_allow_html=True
)
