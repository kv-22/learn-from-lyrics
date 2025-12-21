from openai import OpenAI
from dotenv import load_dotenv
import os
from tools import deduplicate_verses
import json
import re
import xml.etree.ElementTree as ET
import logging

logger = logging.getLogger(__name__)

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

instructions = """Your job is to translate the lyrics of Arabic songs into English for language learning purposes. You should be culturally relevant and beginner-friendly.

First, recognize the main dialect. Then provide a line-by-line translation of the song and a word-by-word translation, considering the dialect. The word-by-word translation should also include a breakdown of the word, highlighting its basic usage form, that is, how it appears without gender/pronoun/verb/etc. additions. You should also provide transliteration to clarify how the words are pronounced. Always provide the transliteration next to Arabic words, as the user may not know how to read them.

The lyrics may contain English words in Latin script; do NOT add a section for these words in the word-by-word translation section, SKIP them completely. An English word may also be written in Arabic script; in this case, include the word in the word-by-word translation section and consider the English meaning for translation. For code-switched lyrics, the words may appear out of order due to RTL and LTR; hence, consider how the words fit together when translating.

Please follow the format given below strictly to structure your response. Don’t add any additional information other than the one specified.

Format:
<dialect>Mention the main dialect only.</dialect>

<ltranslation>
<line>
<arabic>"The original lyric in Arabic"</arabic>
<transliteration>Transliteration of lyric line</transliteration>
<translation>Equivalent translation of the line in English</translation>
</line>
</ltranslation>

<wtranslation>
<word> 
<arabic>"Arabic text of the word"</arabic>
<translation>Translation in English only with no explanation</translation>
<transliteration>Transliteration of the word</transliteration>
<base>"Arabic text of the base word" (Transliteration of the base word) (Meaning of the base word)</base>
<note>Clearly explain how the suffix/prefix/verb tense/etc. are combined to give the final word. Consider how neighboring words affect the meaning/form of the current word, for example: the current word has a feminine suffix because it describes the next word, which is feminine. You can skip this if a word is the same as the base. You may add contextual/cultural information here. Do not mention complex grammatical terminology.</note>
</word>
</wtranslation>

Here is a sample response:
<dialect>Levantine</dialect>

<ltranslation>
<line>
<arabic>“ليه متضايقة ليه”</arabic>
<transliteration>Leh mitdayiqah leh?</transliteration>
<translation>Why are you upset? Why?<translation>
</line>

<line>
<arabic>"coffee hot احب شاي و"</arabic>
<transliteration>Ahibb shayy wa hot coffee</transliteration>
<translation>I love tea and hot coffee</translation>
</line>

<line>
<arabic>"عيونها بلو"</arabic>
<transliteration>Uyoonha bloo</transliteration>
<translation>Her eyes are blue</translation>
</line>

...
</ltranslation>

<wtranslation>
<word>
<arabic>"ليه"</arabic>
<translation>why</translation>
<transliteration>leh</transliteration>
<base>"ليه" (leh) (why)</base>
<note>"ليه" (leh) is commonly used in Egyptian and Levantine Arabic. It’s the informal, everyday version of the more formal "لماذا" (limadha).</note>
</word>

<word>
<arabic>"احب"</arabic>
<translation>I love</translation>
<transliteration>Ahibb</transliteration>
<base>"حب" (hubb) (love)</base>
<note>We add "ا" (a) as the prefix to say "I love".</note>
</word>

<word>
<arabic>"شاي"</arabic>
<translation>tea</translation>
<transliteration>shayy</transliteration>
<base>"شاي" (shayy) (tea)</base>
</word>

<word>
<arabic>"و"</arabic>
<translation>and</translation>
<transliteration>wa</transliteration> 
<base>"و" (wa) (and)</base>
</word>

<word>
<arabic>"كيفك"</arabic>
<translation>how are you</translation>
<transliteration>keefik</transliteration>
<base>"كيف" (keef) (how)</base>
<note>By adding the pronoun suffix ik (for a woman), you get "كيفك" (keefik), which literally means “how you.” Together, it’s the natural Levantine way of saying “How are you?”.</note>
</word>

<word>
<arabic>"بتمشي"</arabic>
<translation>walks</translation>
<transliteration>btimshi</transliteration>
<base>"مشى" (masha) (walked)</base>
<note>"بتمشي" (btimshi) is a verb with two prefixes: b- (for the present tense) and t- (showing it’s feminine) to match the next word "الدنيا" (id-dunya), which is a feminine noun meaning “the world”.</note>
</word>

<word>
<arabic>"الدنيا"</arabic>
<translation>the world</translation>
<transliteration>id-dunya</transliteration>
<base>"الدنيا" (id-dunya) (the world)</base>

...
</wtranslation>
"""

instructions_for_q_and_a = """Your job is to answer the user's queries regarding a song's translation. You should be culturally relevant and beginner-friendly.

Do not try to guess or interpret the name of the song, just answer the question about the given lyrics. Remember that an English word may be written in Arabic script; in this case, you should consider the English meaning of the word. For code-switched lyrics, the words may appear out of order due to RTL and LTR; hence, consider how the words fit together. Always provide the transliteration when referring to Arabic words, as the user may not know how to read them.

If the user's query is not relevant to your job, do not answer it, instead say "Sorry, I can't answer a question that's not about lyrics.".

Below are the translated lyrics:
{translated_output}

"""

def parse_translation_output(xml_output):
    """Parse the XML translation output into structured dictionaries."""
    try:
        # Wrap in root tag for proper XML parsing
        wrapped_xml = f"<root>{xml_output}</root>"  # to create main tag ex data
        root = ET.fromstring(wrapped_xml)
        
        # Extract dialect
        dialect_elem = root.find('dialect') # find gets first child
        dialect = dialect_elem.text.strip() if dialect_elem is not None else None
        
        # Parse line translations
        ltranslation = []
        ltrans_section = root.find('ltranslation')
        if ltrans_section is not None:
            for line in ltrans_section.findall('line'): # gets all children of current tag
                arabic_elem = line.find('arabic')
                transliteration_elem = line.find('transliteration')
                translation_elem = line.find('translation')
                
                ltranslation.append({
                    'arabic': arabic_elem.text.strip() if arabic_elem is not None else '',
                    'transliteration': transliteration_elem.text.strip() if transliteration_elem is not None else '',
                    'translation': translation_elem.text.strip() if translation_elem is not None else ''
                })
        
        # Parse word translations
        wtranslation = []
        wtrans_section = root.find('wtranslation')
        if wtrans_section is not None:
            for word in wtrans_section.findall('word'):
                arabic_elem = word.find('arabic')
                translation_elem = word.find('translation')
                transliteration_elem = word.find('transliteration')
                base_elem = word.find('base')
                note_elem = word.find('note')
                
                wtranslation.append({
                    'arabic': arabic_elem.text.strip() if arabic_elem is not None else '',
                    'translation': translation_elem.text.strip() if translation_elem is not None else '',
                    'transliteration': transliteration_elem.text.strip() if transliteration_elem is not None else '',
                    'base': base_elem.text.strip() if base_elem is not None else '',
                    'note': note_elem.text.strip() if note_elem is not None else ''
                })
        
        return {
            'dialect': dialect,
            'ltranslation': ltranslation,
            'wtranslation': wtranslation
        }
    
    except Exception:
        logger.exception("Error parsing translation for display.")
        return None

def contains_arabic(text):
    """Check if text contains at least one Arabic character."""
    # Main Arabic Unicode range
    arabic_pattern = re.compile(r'[\u0600-\u06FF]')
    return bool(arabic_pattern.search(text))

def strip_xml_tags(xml_text):
    """Remove all XML tags from text, keeping only the content."""
    try:
        # Wrap in root tag for proper XML parsing
        wrapped_xml = f"<root>{xml_text}</root>"
        root = ET.fromstring(wrapped_xml)
        # Use itertext() to extract all text content
        text_content = ''.join(root.itertext())
        # Clean up extra whitespace
        cleaned_text = re.sub(r'\n\s*\n', '\n\n', text_content)
        return cleaned_text.strip()
    except Exception:
        logger.exception("Error removing XML tags from translation.")
        return None

def translate(song_lyrics):
    try:
        lyrics = deduplicate_verses(song_lyrics)
        print(lyrics)
        if lyrics is None:
            return {"error": "Sorry, we couldn't process the entered lyrics. Please check the lyrics."}
        
        if not contains_arabic(lyrics):
            logger.info(f"Non-Arabic lyrics detected for: {song_lyrics}")
            return {"error": "This doesn't appear to be an Arabic song. Please enter an Arabic song to translate."}
        
        input_list = [
            {"role": "user", "content": lyrics}
        ]

        response = client.responses.create(
            model="gpt-4.1",
            instructions=instructions,
            temperature=0,
            input=input_list,
            store=False
        )

        translated_output = response.output_text
        
        # Filter out "---" from the output before returning
        translated_output = re.sub(r'---+', '', translated_output)
        
        # Parse the XML output into structured dictionary
        parsed_output = parse_translation_output(translated_output)
        
        if parsed_output is None:
            return {"error": "We encountered an issue processing the translation. Please try again."}
        
        # Strip XML tags from raw output
        raw_output_no_tags = strip_xml_tags(translated_output)
        
        if raw_output_no_tags is None:
            return {"error": "We encountered an issue processing the translation. Please try again."}


        return {
            **parsed_output,
            'raw_output': raw_output_no_tags  
        }
    except Exception:
        logger.exception(f"Error processing translation.")
        return {"error": "Something went wrong. Please try again later."}

def q_and_a(query, context, translated_output, previous_response_id):
    try:
        formatted_instructions = instructions_for_q_and_a.format(translated_output=translated_output)
        
        user_input = context + "\n\n" + query
        
        response_q_and_a = client.responses.create(
            model="gpt-4.1",
            instructions=formatted_instructions,
            previous_response_id=previous_response_id,
            max_output_tokens=500,
            temperature=0,
            input=[{"role": "user", "content": user_input}]
        )
        
        previous_response_id = response_q_and_a.id
        
        return {
            "response_id": previous_response_id, 
            "response": response_q_and_a.output_text
        }
    except Exception:
        logger.exception("Error processing chat.")
        return {
            "error": "Sorry, I couldn't process your question. Please try again."
        }
    
