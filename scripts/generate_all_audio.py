import os
import requests
import json
import base64
import time

API_KEY = os.environ.get("SARVAM_API_KEY")
if not API_KEY:
    print("Error: SARVAM_API_KEY environment variable is not set.")
    print("Please set SARVAM_API_KEY=your_key_here before running this script.")
    exit(1)

URL = "https://api.sarvam.ai/text-to-speech"
HEADERS = {
    "api-subscription-key": API_KEY,
    "Content-Type": "application/json"
}

AUDIO_DIR = os.path.abspath("study_portal/audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

AUDIO_SCRIPTS = [
    # 1. Newton-Raphson (BCA-5004 Unit 1)
    {
        "filename": "nr_step0.wav",
        "text": "नमस्ते! न्यूटन-राफसन मेथड में हमारा लक्ष्य फलन x स्क्वायर माइनस 5 बराबर 0 का पॉजिटिव रूट अंडररूट 5 निकालना है। यह ग्रीन कर्व y बराबर fx है जो x-एक्सिस को रेड डॉट अल्फा पर काटता है।",
        "speaker": "aditya"
    },
    {
        "filename": "nr_step1.wav",
        "text": "पहला इनिशियल गेस हम x0 बराबर 3.2 चुनते हैं। यहाँ से कर्व पर वर्टिकल प्रोजेक्शन करने से हमें पॉइंट x0, fx0 मिलता है।",
        "speaker": "aditya"
    },
    {
        "filename": "nr_step2.wav",
        "text": "अब इस पॉइंट पर टेंजेंट लाइन खींची जाती है। टेंजेंट का फॉर्मूला x1 बराबर x0 माइनस fx0 अपॉन f'x0 होता है, और यह टेंजेंट x-एक्सिस को 2.381 पर काटती है।",
        "speaker": "aditya"
    },
    {
        "filename": "nr_step3.wav",
        "text": "दूसरी बार में टेंजेंट लाइन x1 से सीधा 2.239 पर पहुँच जाती है, जो कि असली रूट 2.236 के बिल्कुल पास है। इसी को हम क्वाड्रेटिक कन्वर्जेंस कहते हैं जिसमें हर स्टेप में सटीकता दोगुनी हो जाती है!",
        "speaker": "aditya"
    },

    # 2. TCP 3-Way Handshake (BCA-5003 Unit 5)
    {
        "filename": "tcp_step0.wav",
        "text": "टीसीपी कनेक्शन शुरू होने से पहले सर्वर पोर्ट 80 पर लिसन मोड में इंतज़ार कर रहा होता है, और क्लाइंट क्लोज्ड स्टेट में रहता है।",
        "speaker": "ritu"
    },
    {
        "filename": "tcp_step1.wav",
        "text": "स्टेप 1 में क्लाइंट पहला सिन पैकेट भेजता है, जिसका सीक्वेंस नंबर 100 होता है। क्लाइंट सिन-सेंट स्टेट में चला जाता है।",
        "speaker": "ritu"
    },
    {
        "filename": "tcp_step2.wav",
        "text": "स्टेप 2 में सर्वर जवाब में सिन-प्लस-एक्नॉलेज पैकेट भेजता है। वह क्लाइंट के सीक्वेंस 100 को रिसीव करके एक्नॉलेजमेंट 101 देता है, और खुद का सीक्वेंस 300 तय करता है।",
        "speaker": "ritu"
    },
    {
        "filename": "tcp_step3.wav",
        "text": "स्टेप 3 में क्लाइंट फाइनल एक्नॉलेजमेंट 301 भेजता है। अब दोनों तरफ कनेक्शन एस्टैब्लिश्ड हो जाता है और फुल-डुप्लेक्स रिलायबल डेटा ट्रांसफर शुरू हो जाता है!",
        "speaker": "ritu"
    },

    # 3. Java JVM Memory (BCA-5002 Unit 1)
    {
        "filename": "jvm_step0.wav",
        "text": "जावा वर्चुअल मशीन में मेमोरी मुख्य रूप से तीन भागों में बंटी होती है: मेथड एरिया, हीप मेमोरी, और जेवीएम कॉल स्टैक।",
        "speaker": "aditya"
    },
    {
        "filename": "jvm_step1.wav",
        "text": "सबसे पहले क्लासलोडर सबसिस्टम स्टूडेंट डॉट क्लास बाइटकोड को लोड करके मेथड एरिया में क्लास का स्ट्रक्चर और बाइटकोड स्टोर करता है।",
        "speaker": "aditya"
    },
    {
        "filename": "jvm_step2.wav",
        "text": "मेन थ्रेड के शुरू होते ही जेवीएम कॉल स्टैक पर मेन मेथड का स्टैक फ्रेम पुश हो जाता है जिसमें लोकल वेरिएबल्स स्टोर होते हैं।",
        "speaker": "aditya"
    },
    {
        "filename": "jvm_step3.wav",
        "text": "जब हम स्टूडेंट s1 बराबर न्यू स्टूडेंट अमित लिखते हैं, तो हीप में नया ऑब्जेक्ट बनता है, और स्टैक का रेफरेंस वेरिएबल s1 उसके मेमोरी एड्रेस को पॉइंट करता है।",
        "speaker": "aditya"
    },
    {
        "filename": "jvm_step4.wav",
        "text": "जब s1 बराबर नल किया जाता है, तो रेफरेंस टूट जाता है, और गारबेज कलेक्टर हीप से अनयूज्ड मेमोरी को ऑटोमैटिकली स्वीप करके फ्री कर देता है!",
        "speaker": "aditya"
    },

    # 4. Herbert Simon Decision Model (BCA-5001 Unit 1)
    {
        "filename": "km_step0.wav",
        "text": "नमस्ते! हर्बर्ट साइमन का डिसीजन मेकिंग मॉडल बिज़नेस इंटेलिजेंस और डीएसएस का सबसे महत्वपूर्ण टॉपिक है। यह निर्णय प्रक्रिया चार मुख्य चरणों में पूरी होती है।",
        "speaker": "aditya"
    },
    {
        "filename": "km_step1.wav",
        "text": "पहला चरण है इंटेलिजेंस फेज़। इसमें एक्सटर्नल और इंटरनल डेटा को स्कैन करके समस्या या अवसर की पहचान की जाती है, जैसे सेल्स में अचानक गिरावट।",
        "speaker": "aditya"
    },
    {
        "filename": "km_step2.wav",
        "text": "दूसरा चरण है डिज़ाइन फेज़। यहाँ समस्या के समाधान के लिए संभावित रास्ते और अल्टरनेटिव्स डेवलप और मॉडल किए जाते हैं।",
        "speaker": "aditya"
    },
    {
        "filename": "km_step3.wav",
        "text": "तीसरा चरण है चॉइस फेज़। जनरेट किए गए सभी विकल्पों का मूल्यांकन करके कॉस्ट, रिस्क, और लाभ के आधार पर सबसे उपयुक्त फैसला चुना जाता है।",
        "speaker": "aditya"
    },
    {
        "filename": "km_step4.wav",
        "text": "चौथा चरण है इम्प्लीमेंटेशन। चुने गए निर्णय को धरातल पर लागू किया जाता है और फीडबैक लूप के ज़रिए लगातार मॉनिटर किया जाता है।",
        "speaker": "aditya"
    }
]

def main():
    print(f"Starting audio generation for {len(AUDIO_SCRIPTS)} narration segments...")
    for item in AUDIO_SCRIPTS:
        filename = item["filename"]
        filepath = os.path.join(AUDIO_DIR, filename)
        payload = {
            "inputs": [item["text"]],
            "target_language_code": "hi-IN",
            "speaker": item.get("speaker", "aditya"),
            "model": "bulbul:v3"
        }
        resp = requests.post(URL, json=payload, headers=HEADERS)
        if resp.status_code == 200:
            data = resp.json()
            b64_audio = data["audios"][0]
            with open(filepath, "wb") as f:
                f.write(base64.b64decode(b64_audio))
            print(f"✓ Saved {filename} ({os.path.getsize(filepath) // 1024} KB)")
        else:
            print(f"✗ Failed {filename}: {resp.status_code} - {resp.text}")
        time.sleep(0.3)

    print("All audio narrations generated successfully!")

if __name__ == "__main__":
    main()
