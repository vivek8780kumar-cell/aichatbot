import streamlit as st
import json
from google import genai

# ----------------------------
# PAGE CONFIG
# ----------------------------

st.set_page_config(
    page_title="🤖 AI English Tutor",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("🤖 AI English Tutor")
st.caption("Practice Speaking • Grammar • Vocabulary")

# ----------------------------
# API KEY
# ----------------------------

try:
    api_key = st.secrets["GEMINI_API_KEY"]
except Exception:
    api_key = st.sidebar.text_input(
        "Gemini API Key",
        type="password"
    )

client = None
if st.sidebar.button("Show Models"):
    try:
        models = client.models.list()
        for m in models:
            st.sidebar.write(m.name)
    except Exception as e:
        st.sidebar.error(e)

if api_key:
    client = genai.Client(api_key=api_key)

# ----------------------------
# SIDEBAR
# ----------------------------

st.sidebar.title("⚙️ Tutor Settings")

proficiency = st.sidebar.selectbox(
    "English Level",
    [
        "Beginner (A1-A2)",
        "Intermediate (B1-B2)",
        "Advanced (C1-C2)"
    ]
)

topic = st.sidebar.selectbox(
    "Practice Topic",
    [
        "Casual Conversation",
        "Job Interview",
        "Travel",
        "Restaurant",
        "Business",
        "Technology",
        "Grammar",
        "Vocabulary"
    ]
)

persona = st.sidebar.selectbox(
    "Tutor Personality",
    [
        "Friendly Tutor",
        "Strict Teacher",
        "English Buddy",
        "Business Coach"
    ]
)

enable_grammar = st.sidebar.checkbox(
    "Grammar Check",
    True
)

enable_vocab = st.sidebar.checkbox(
    "Vocabulary Suggestions",
    True
)

# ----------------------------
# SESSION STATE
# ----------------------------

if "messages" not in st.session_state:

    st.session_state.messages = [
        {
            "role":"assistant",
            "content":"👋 Hello! I'm your AI English Tutor.\n\nLet's improve your English together!"
        }
    ]

if "vocab_bank" not in st.session_state:
    st.session_state.vocab_bank = []

# ----------------------------
# TABS
# ----------------------------

tab_chat, tab_vocab, tab_grammar = st.tabs(
    [
        "💬 Chat",
        "📚 Vocabulary",
        "✍ Grammar"
    ]
)# ==========================
# CHAT TAB
# ==========================

with tab_chat:

    # Display chat history
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

            if msg.get("grammar"):

                g = msg["grammar"]

                with st.expander("📖 Grammar Feedback"):

                    st.write(f"**Grammar Score:** {g.get('score',100)}/100")

                    if g.get("hasErrors"):

                        st.success(
                            f"✅ Correct Sentence:\n\n{g.get('correctedSentence')}"
                        )

                        for c in g.get("corrections", []):

                            st.info(
                                f"**{c.get('originalText')}** → **{c.get('correctedText')}**\n\n{c.get('explanation')}"
                            )

                    if g.get("betterPhrasing"):

                        st.warning(
                            "💡 Better English:\n\n"
                            + g.get("betterPhrasing")
                        )

    # Chat input

    user_input = st.chat_input(
        "Type your English message..."
    )

    if user_input:

        st.session_state.messages.append(
            {
                "role":"user",
                "content":user_input
            }
        )

        with st.chat_message("user"):
            st.markdown(user_input)

        if client is None:

            st.error("Please enter your Gemini API Key.")

        else:

            with st.chat_message("assistant"):

                with st.spinner("Thinking..."):

                    prompt=f"""
You are an expert English Tutor.

Student Level:
{proficiency}

Conversation Topic:
{topic}

Tutor Style:
{persona}

Student Message:
{user_input}

Return ONLY valid JSON.

Do not use markdown.

Schema:

{{
"reply":"string",

"grammar":{{
"score":95,
"hasErrors":true,
"correctedSentence":"string",
"betterPhrasing":"string",

"corrections":[
{{
"originalText":"string",
"correctedText":"string",
"explanation":"string"
}}
]
}},

"vocabulary":[
{{
"word":"string",
"definition":"string",
"cefr":"A1"
}}
]

}}
"""

                    try:

                        models = client.models.list()

                        for model in models:
                            st.write(model.name)
                        
                        st.stop()

                        text=response.text.strip()

                        if text.startswith("```"):

                            text=text.replace("```json","")

                            text=text.replace("```","")

                        data=json.loads(text)

                        st.markdown(data["reply"])

                        if data.get("grammar"):

                            g=data["grammar"]

                            with st.expander("📖 Grammar Feedback"):

                                st.write(
                                    f"Grammar Score: {g.get('score',100)}/100"
                                )

                                if g.get("hasErrors"):

                                    st.success(
                                        g.get("correctedSentence")
                                    )

                                    for c in g.get("corrections",[]):

                                        st.info(
                                            f"{c['originalText']} ➜ {c['correctedText']}"
                                        )

                                        st.caption(
                                            c["explanation"]
                                        )

                                if g.get("betterPhrasing"):

                                    st.warning(
                                        g["betterPhrasing"]
                                    )

                        st.session_state.messages.append(

                            {
                                "role":"assistant",

                                "content":data["reply"],

                                "grammar":data["grammar"]

                            }

                        )

                        if data.get("vocabulary"):

                            st.session_state.vocab_bank.extend(

                                data["vocabulary"]

                            )

                    except Exception as e:

                        st.error(str(e))# ==========================================
# VOCABULARY TAB
# ==========================================

with tab_vocab:

    st.subheader("📚 Vocabulary Bank")

    if len(st.session_state.vocab_bank) == 0:

        st.info("No vocabulary collected yet.\n\nStart chatting to build your vocabulary.")

    else:

        words = {}

        for item in st.session_state.vocab_bank:

            if item["word"] not in words:

                words[item["word"]] = item

        for word in words.values():

            with st.container():

                st.markdown("### 📖 " + word["word"])

                st.write("Meaning")

                st.success(word["definition"])

                st.write("Level")

                st.info(word.get("cefr","A1"))

                st.divider()


# ==========================================
# GRAMMAR TAB
# ==========================================

with tab_grammar:

    st.subheader("✍ AI Grammar Checker")

    grammar_text = st.text_area(

        "Write anything in English",

        height=200

    )

    check = st.button("🚀 Check Grammar")

    if check:

        if grammar_text == "":

            st.warning("Please write something.")

        elif client is None:

            st.error("Gemini API Key missing.")

        else:

            prompt = f"""

You are an English Grammar Teacher.

Correct grammar.

Explain every mistake.

Return ONLY JSON.

Schema

{{
"correct":"string",

"score":95,

"mistakes":[
{{
"wrong":"string",

"correct":"string",

"reason":"string"
}}
],

"tips":[
"tip1",
"tip2",
"tip3"
]

}}

Student Text

{grammar_text}

"""

            try:

                response = client.models.generate_content(

                    model="gemini-2.5-flash",

                    contents=prompt

                )

                text = response.text.strip()

                if text.startswith("```"):

                    text = text.replace("```json","")

                    text = text.replace("```","")

                result = json.loads(text)

                st.success("✅ Correct Sentence")

                st.write(result["correct"])

                st.progress(result["score"]/100)

                st.write("Grammar Score:",result["score"])

                st.subheader("Mistakes")

                for m in result["mistakes"]:

                    st.error(

                        f"❌ {m['wrong']}"

                    )

                    st.success(

                        f"✅ {m['correct']}"

                    )

                    st.caption(

                        m["reason"]

                    )

                st.subheader("Tips")

                for tip in result["tips"]:

                    st.info(tip)

            except Exception as e:

                st.error(e)


# ==========================================
# FOOTER
# ==========================================

st.divider()

col1,col2,col3,col4 = st.columns(4)

with col1:

    st.metric(

        "Messages",

        len(st.session_state.messages)-1

    )

with col2:

    st.metric(

        "Vocabulary",

        len(st.session_state.vocab_bank)

    )

with col3:

    if client:

        st.metric(

            "AI",

            "Connected"

        )

    else:

        st.metric(

            "AI",

            "Offline"

        )

with col4:

    st.metric(

        "Tutor",

        "Gemini"

    )

st.caption(

    "🤖 AI English Tutor | Built using Streamlit + Google Gemini"

)
