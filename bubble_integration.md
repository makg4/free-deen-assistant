# Bubble integration (step-by-step)

## 1) API Connector
Create an API called `FreeDeenAPI` with three calls:

1. `Answer` (POST)
- URL: `https://YOUR_BACKEND/answer`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  {
    "question": "<dynamic>",
    "madhhab": "<dynamic>",
    "locale": "en"
  }
- Initialize call.

2. `AyahOfDay` (GET)
- URL: `https://YOUR_BACKEND/ayah-of-day`
- No body.

3. `PrayerTimes` (GET)
- URL: `https://YOUR_BACKEND/prayertimes?lat=<lat>&lon=<lon>&date=<date>&method=<method>`

## 2) Data types (Bubble)
- `SavedItem` (fields: type text, payload json, created date)
- `Preference` (fields: madhhab text [hanafi/shafii/maliki/hanbali/none], locale text)
- Optional: `QueryLog` (question text, answer text, confidence number, created date)

## 3) Workflows
- On chat submit:
  - Action: API → `Answer`
  - Display result in RepeatingGroup or RichText with: answer, list of citations
  - If identical question appears within X days, use your own Bubble DB cache (Answer and Citations)

- Daily ayah:
  - Backend workflow every morning → API `AyahOfDay` → Save to DB → Push Notification

## 4) UI tips
- Chips for topics (Fiqh/Aqidah/Ramadan/etc.).
- A collapsible "Sources" section under each answer.
- A badge `Different scholarly views exist` when multiple views detected.
