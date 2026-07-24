import streamlit as st
import google.generativeai as genai
import os
import json

# Streamlit Page Config
st.set_page_config(
    page_title="AI English Tutor",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("🤖 Streamlit AI English Tutor")
st.caption("Conversational Practice • Instant Grammar • Vocabulary Building")

# Configure Gemini API Key
try:
    api_key = st.secrets["GEMINI_API_KEY"]
except Exception:
    api_key = st.sidebar.text_input(
        "Gemini API Key",
        type="password",
        help="Enter your Gemini API key"
    )

if api_key:
    genai.configure(api_key=api_key)

# Sidebar Configuration
st.sidebar.header("⚙️ Tutor Settings")
proficiency = st.sidebar.selectbox(
    "Proficiency Level (CEFR)",
    ["Beginner (A1-A2)", "Intermediate (B1-B2)", "Advanced (C1-C2)"]
)

topic = st.sidebar.selectbox(
    "Practice Topic",
    [
        "☕ Casual Coffee Chat",
        "💼 Job Interview Prep",
        "✈️ Travel & Airport",
        "🍝 Restaurant & Food Order",
        "💻 Tech & Business Meeting",
        "🎨 Hobbies & Culture",
        "✍️ Free Practice & Grammar Focus"
    ]
)

persona = st.sidebar.radio(
    "AI Persona",
    ["Friendly Tutor", "Strict Teacher", "Casual Buddy", "Business Coach"]
)

enable_grammar = st.sidebar.checkbox("Enable Instant Grammar Check", value=True)
enable_vocab = st.sidebar.checkbox("Enable Vocabulary Extractor", value=True)

# Session State Initialization
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "👋 Hello! I'm your AI English Tutor. How are you today? What topic would you like to practice?"}
    ]

if "vocab_bank" not in st.session_state:
    st.session_state.vocab_bank = []

# Tabs Navigation
tab_chat, tab_vocab, tab_grammar = st.tabs(["💬 Chat Practice", "📚 Vocabulary Bank", "✍️ Grammar Checker"])

with tab_chat:
    # Display Chat Messages
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            if "grammar" in msg and msg["grammar"]:
                with st.expander("🔍 Instant Grammar Feedback"):
                    g = msg["grammar"]
                    st.write(f"**Score:** {g.get('score', 100)}/100")
                    if g.get("hasErrors"):
                        st.success(f"**Corrected:** {g.get('correctedSentence')}")
                        for c in g.get("corrections", []):
                            st.info(f"• **{c.get('type')}**: {c.get('originalText')} → **{c.get('correctedText')}** ({c.get('explanation')})")
                    if g.get("betterPhrasing"):
                        st.markdown(f"💡 *Native Alternative:* {g.get('betterPhrasing')}")

    # Chat Input
    if user_input := st.chat_input("Type your message in English..."):
        st.session_state.messages.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.markdown(user_input)

        if not api_key:
            st.warning("Please provide a Gemini API Key in the sidebar to generate response.")
        else:
            with st.chat_message("assistant"):
                with st.spinner("AI Tutor is thinking & analyzing grammar..."):
                    try:
                        model = genai.GenerativeModel("gemini-2.5-flash")
                        prompt = f"""You are an English language tutor.
Level: {proficiency}
Topic: {topic}
Persona: {persona}

User Input: "{user_input}"

Respond in JSON format:
{{
  "reply": "Conversational reply in English with 1 follow-up question",
  "grammar": {{
    "hasErrors": true/false,
    "score": 0-100,
    "correctedSentence": "string",
    "corrections": [{{"type": "string", "originalText": "string", "correctedText": "string", "explanation": "string"}}],
    "betterPhrasing": "string"
  }},
  "vocabulary": [{{"word": "string", "definition": "string", "cefr": "A1/B1/C1"}}]
}}"""
                        response = model.generate_content(prompt)
                        res_json = json.loads(response.text.strip('```json').strip('```'))
                        
                        st.markdown(res_json.get("reply", ""))
                        
                        if res_json.get("grammar"):
                            with st.expander("🔍 Instant Grammar Feedback"):
                                g = res_json["grammar"]
                                st.write(f"**Score:** {g.get('score', 100)}/100")
                                if g.get("hasErrors"):
                                    st.success(f"**Corrected:** {g.get('correctedSentence')}")
                                    for c in g.get("corrections", []):
                                        st.info(f"• **{c.get('type')}**: {c.get('originalText')} → **{c.get('correctedText')}** ({c.get('explanation')})")

                        st.session_state.messages.append({
                            "role": "assistant",
                            "content": res_json.get("reply", ""),
                            "grammar": res_json.get("grammar")
                        })

                        if res_json.get("vocabulary"):
                            st.session_state.vocab_bank.extend(res_json["vocabulary"])

                    except Exception as e:
                        st.error(f"Error generating response: {e}")

with tab_vocab:
    st.subheader("📚 Saved Vocabulary Words")
    if st.session_state.vocab_bank:
        for v in st.session_state.vocab_bank:
            st.write(f"**{v.get('word')}** ({v.get('cefr', 'B1')}) - {v.get('definition')}")
    else:
        st.info("No vocabulary saved yet. Start practicing in the chat!")

with tab_grammar:
    st.subheader("✍️ Standalone Grammar Proofreader")
    text_to_check = st.text_area("Paste English text to proofread:")
    if st.button("Check Grammar"):
        if text_to_check and api_key:
            model = genai.GenerativeModel("gemini-1.5-flash")
            resp = model.generate_content(f"Proofread this English text: {text_to_check}")
            st.write(resp.text)
