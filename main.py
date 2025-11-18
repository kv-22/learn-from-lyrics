from openai import OpenAI
from dotenv import load_dotenv
import os
from tools import get_lyrics
import json

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

tools = [{
    "type": "function",
    "name": "get_lyrics",
    "description": "Get lyrics of a song for translation.",
    "parameters": {
        "type": "object",
        "properties": {
            "artist_name": {
                "type": "string",
                "description": "Name of the artist of the song."
            },
            "song_name": {
                "type": "string",
                "description": "Name of the song."
            },
        },
        "required": ["artist_name", "song_name"]
    },
}]


instructions = """Your job is to translate the lyrics of Arabic songs into English for language learning purposes. You should be culturally relevant and beginner-friendly.

First, recognize the main dialect. Then provide a line-by-line translation of the song and a word-by-word translation, considering the dialect. The word-by-word translation should also include a breakdown of the word, highlighting its basic usage form, that is, how it appears without gender/pronoun/verb/etc. additions. You should also provide transliteration to clarify how the words are pronounced. Always provide the transliteration next to Arabic words, as the user may not know how to read them.

The lyrics may contain English words in Latin script; do NOT add a section for these words in the word-by-word translation section, SKIP them completely. An English word may also be written in Arabic script; in this case, include the word in the word-by-word translation section and consider the English meaning for translation. For code-switched lyrics, the words may appear out of order due to RTL and LTR; hence, consider how the words fit together when translating.

Please follow the format given below strictly to structure your response. Don’t add any additional information other than the one specified.

Format:
<dialect>
## Dialect: Mention the main dialect only.
</dialect>

<ltranslation>
Transliteration of lyric line
Equivalent translation of the line in English
</ltranslation>

<wtranslation>
*Word:* "Arabic text of the word"
*Translation:* Translation in English only with no explanation
*Transliteration:* Transliteration of the word
*Base:* "Arabic text of the base word" (Transliteration of the base word) (Meaning of the base word)
*Note:* Clearly explain how the suffix/prefix/verb tense/etc. are combined to give the final word. Consider how neighboring words affect the meaning/form of the current word, for example: the current word has a feminine suffix because it describes the next word, which is feminine. You can skip this if a word is the same as the base. You may add contextual/cultural information here. Do not mention complex grammatical terminology.
</wtranslation>

Here is a sample response:
<dialect>
## Dialect: Levantine
</dialect>

<ltranslation>
## Line-by-line translation and transliteration:
“ليه متضايقة ليه”
Leh mitdayiqah leh?
Why are you upset? Why?

...

"coffee hot احب شاي و"
Ahibb shayy wa hot coffee
I love tea and hot coffee

...

"عيونها بلو"
Uyoonha bloo
Her eyes are blue

...
</ltranslation>

<wtranslation>
## Word-by-word translation and transliteration:
Word: "ليه"
Translation: why
Transliteration: leh
Base: "ليه" (leh) (why)
Note: "ليه" (leh) is commonly used in Egyptian and Levantine Arabic. It’s the informal, everyday version of the more formal "لماذا" (limadha).

...

Word: "احب"
Translation: I love
Transliteration: Ahibb
Base: "حب" (hubb) (love)
Note: We add "ا" (a) as the prefix to say "I love".

Word: "شاي"
Translation: tea
Transliteration: shayy
Base: "شاي" (shayy) (tea)

Word: "و"
Translation: and
Transliteration: wa 
Base: "و" (wa) (and)

Word: "كيفك"
Translation: how are you
Transliteration: keefik
Base: "كيف" (keef) (how)
Note: By adding the pronoun suffix ik (for a woman), you get "كيفك" (keefik), which literally means “how you.” Together, it’s the natural Levantine way of saying “How are you?”.

...

Word: "بتمشي"
Translation: walks
Transliteration: btimshi
Base: "مشى" (masha) (walked)
Note: "بتمشي" (btimshi) is a verb with two prefixes: b- (for the present tense) and t- (showing it’s feminine) to match the next word "الدنيا" (id-dunya), which is a feminine noun meaning “the world”.

Word: "الدنيا"
Translation: the world
Transliteration: id-dunya
Base: "الدنيا" (id-dunya) (the world)

...
</wtranslation>
"""


# input_list = [
#     {"role": "user", "content": lyrics}
# ]

# response = client.responses.create(
#     model="gpt-4.1",
#     instructions=instructions,
#     input=input_list,
#     store=False
# )

# translated_output = response.output_text

# dialect = translated_output.split("<dialect>")[1].split("</dialect>")[0]
# ltranslation = translated_output.split("<ltranslation>")[1].split("</ltranslation>")[0]
# wtranslation = translated_output.split("<wtranslation>")[1].split("</wtranslation>")[0]

# translated_output = dialect + "\n" + ltranslation + "\n" + wtranslation

context = ""

instructions_for_q_and_a = f"""Your job is to answer the user's queries regarding a song's translation. You should be culturally relevant and beginner-friendly.

Do not try to guess or interpret the name of the song, just answer the question about the given lyrics. Remember that an English word may be written in Arabic script; in this case, you should consider the English meaning of the word. For code-switched lyrics, the words may appear out of order due to RTL and LTR; hence, consider how the words fit together. Always provide the transliteration when referring to Arabic words, as the user may not know how to read them.

If the user's query is not relevant to your job, do not answer it, instead say "Sorry, I can't answer a question that's not about lyrics.".

Below are the translated lyrics:
{translated_output}

"""

# input_list += response.output

# for item in response.output: 
#     if item.type == "function_call":
#         if item.name == "get_lyrics":
#             args = json.loads(item.arguments)
#             print(args)
#             lyrics = get_lyrics(**args)
#             function_call_output = {
#                 "type": "function_call_output",
#                 "call_id": item.call_id,
#                 "output": json.dumps({
#                     "lyrics": lyrics
#                 }, ensure_ascii=False)   
#             }
#             input_list.append(function_call_output)

# print(input_list)

# response = client.responses.create(
#     model="gpt-5-nano",
#     instructions=instructions,
#     input=input_list
# )
            

def main():
    print("Hello from song-translator!")
    # print(response.output_text)
    # print(translated_output)
    
    first_request = True
    
    while True:
        question = input("Your question (or enter q to exit): ")
        
        if question.lower() == "q":
            break
        
        user_input = context + "\n\n" + question
        
        if first_request:
            response_q_and_a = client.responses.create(
                model="gpt-4.1",
                instructions=instructions_for_q_and_a,
                max_output_tokens=500,
                temperature=0,
                input=[{"role": "user", "content": user_input}]
            )
            first_request=False
        else:
            response_q_and_a = client.responses.create(
            model="gpt-4.1",
            instructions=instructions_for_q_and_a,
            previous_response_id=response_q_and_a.id,
            max_output_tokens=500,
            temperature=0,
            input=[{"role": "user", "content": user_input}]
            )
            
        # print(response_q_and_a.output_text)
        print(response_q_and_a.output_text)

if __name__ == "__main__":
    main()
