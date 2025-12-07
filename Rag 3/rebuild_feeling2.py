import csv
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).parent
INPUT_FILE = ROOT / "affect-combinations-final.csv"
OUTPUT_FILE = ROOT / "affect-combinations-final.csv.tmp"


# Synonym pools for cores (nouns) and tones (adjectives).
# We rotate through these so phrasing doesn't feel overly repetitive and try to
# keep words as unique as possible across all phrases.
CORE_SYNONYMS = {
    "Question": ["Question", "Inquiry", "Riddle", "Puzzle", "Mystery", "Enigma"],
    "Connection": ["Connection", "Bond", "Tie", "Link", "Affinity", "Kinship"],
    "Reset": ["Reset", "Restart", "Reboot", "Turn", "Shift", "Jolt"],
    "Alert": ["Alert", "Signal", "Warning", "Beacon", "Flare", "Alarm"],
    "Fire": ["Fire", "Flame", "Blaze", "Ember", "Spark", "Heat"],
    "Depth": ["Depth", "Well", "Ocean", "Abyss", "Chasm", "Current"],
    "Boundary": ["Boundary", "Border", "Edge", "Threshold", "Limit", "Perimeter"],
    "Distance": ["Distance", "Horizon", "Gap", "Space", "Drift", "Remove"],
    "Humility": ["Humility", "Softness", "Quiet", "Stillness", "Yielding", "Smallness"],
}

TONE_SYNONYMS = {
    # Valence-aware tone synonyms. Keys at the top level are coarse valence buckets.
    "positive": {
        "Flexible": ["Supple", "Flowing", "Playful", "Curving", "Gentle", "Leaning"],
        "Open": ["Radiant", "Bright", "Open", "Welcoming", "Unfolding", "Soft"],
        "New": ["Fresh", "New", "Crisp", "Sparkling", "Surprising", "Lively"],
        "Cautious": ["Attentive", "Careful", "Watchful", "Gentle", "Measured", "Considerate"],
        "Firm": ["Steady", "Rooted", "Grounded", "Firm", "Solid", "Resolved"],
        "Tender": ["Tender", "Gentle", "Soft", "Delicate", "Kind", "Warm"],
        "Decisive": ["Clear", "Certain", "Definite", "Decisive", "Sharp", "Sure"],
        "Objective": ["Even", "Balanced", "Plain", "Neutral", "Cool", "Simple"],
        "Quiet": ["Still", "Calm", "Hushed", "Quiet", "Soft", "Restful"],
    },
    "neutral": {
        "Flexible": ["Flexible", "Supple", "Leaning", "Curving", "Gentle", "Bending"],
        "Open": ["Open", "Plain", "Wide", "Simple", "Bare", "Unfolding"],
        "New": ["New", "Sudden", "Recent", "Crisp", "Raw", "Fresh"],
        "Cautious": ["Cautious", "Watchful", "Careful", "Guarded", "Attentive", "Vigilant"],
        "Firm": ["Firm", "Steady", "Rooted", "Solid", "Grounded", "Set"],
        "Tender": ["Tender", "Gentle", "Soft", "Quiet", "Light", "Fine"],
        "Decisive": ["Decisive", "Sharp", "Clear", "Exact", "Certain", "Definite"],
        "Objective": ["Objective", "Cool", "Distant", "Even", "Neutral", "Plain"],
        "Quiet": ["Quiet", "Still", "Hushed", "Muted", "Dim", "Low"],
    },
    "negative": {
        "Flexible": ["Uneasy", "Wavering", "Unsteady", "Slippery", "Shifting", "Tense"],
        "Open": ["Exposed", "Bare", "Raw", "Unprotected", "Thin", "Vulnerable"],
        "New": ["Jarring", "Abrupt", "Sudden", "Startling", "Sharp", "Harsh"],
        "Cautious": ["Edgy", "Nervous", "Guarded", "Tight", "Watchful", "Wary"],
        "Firm": ["Rigid", "Hard", "Unyielding", "Fixed", "Severe", "Tense"],
        "Tender": ["Frayed", "Sore", "Bruised", "Raw", "Fragile", "Exposed"],
        "Decisive": ["Harsh", "Severe", "Cutting", "Sharp", "Final", "Relentless"],
        "Objective": ["Cold", "Distant", "Cool", "Removed", "Flat", "Blank"],
        "Quiet": ["Muted", "Dim", "Low", "Smothered", "Hushed", "Sinking"],
    },
}


def pick_synonym(base: str, pool_map: dict, index_map: dict, global_counts: Counter) -> str:
    """
    Pick a synonym for a base word, rotating through its pool.
    Tries to avoid reusing the same literal word once it has appeared at least
    one time across all phrases. If all candidates have been used at least once,
    it falls back to simple rotation.
    """
    candidates = pool_map.get(base, [base])
    start_idx = index_map.get(base, 0)
    n = len(candidates)

    for offset in range(n):
        candidate = candidates[(start_idx + offset) % n]
        if global_counts[candidate] == 0:
            chosen = candidate
            index_map[base] = (start_idx + offset + 1) % n
            global_counts[chosen] += 1
            return chosen

    # All candidates have been seen at least once; just rotate normally
    chosen = candidates[start_idx % n]
    index_map[base] = (start_idx + 1) % n
    global_counts[chosen] += 1
    return chosen


def classify_valence(raw: str) -> str:
    """
    Map the textual valence_category into a coarse bucket: positive, neutral, negative.
    """
    if not raw:
        return "neutral"

    lower = raw.lower()
    if "positive" in lower and "negative" not in lower:
        return "positive"
    if "negative" in lower:
        return "negative"
    return "neutral"


def main() -> None:
    if not INPUT_FILE.exists():
        sys.exit(f"Error: Input file '{INPUT_FILE}' not found.")

    word_counts: Counter[str] = Counter()
    core_index_map: dict[str, int] = {}
    tone_index_map: dict[str, int] = {}

    with INPUT_FILE.open("r", newline="", encoding="utf-8") as infile, OUTPUT_FILE.open(
        "w", newline="", encoding="utf-8"
    ) as outfile:
        reader = csv.reader(infile)
        writer = csv.writer(outfile)

        try:
            header = next(reader)
        except StopIteration:
            sys.exit("Error: CSV appears to be empty.")

        try:
            feeling_idx = header.index("feeling")
        except ValueError:
            sys.exit("Error: 'feeling' column not found in header.")

        try:
            valence_idx = header.index("valence_category")
        except ValueError:
            sys.exit("Error: 'valence_category' column not found in header.")

        # Ensure 'Feeling 2' column exists; if not, append it.
        try:
            feeling2_idx = header.index("Feeling 2")
        except ValueError:
            header.append("Feeling 2")
            feeling2_idx = len(header) - 1

        writer.writerow(header)

        for row in reader:
            if not row:
                continue

            # Make sure the row has enough columns
            if len(row) <= feeling_idx:
                writer.writerow(row)
                continue

            feeling_raw = row[feeling_idx]
            parts = [p.strip() for p in feeling_raw.split("|")]

            if len(parts) == 3:
                core_word, _action_word, tone_word = parts
            else:
                # Fallback if format is unexpected
                core_word, tone_word = "Signal", "Quiet"

            # Determine valence bucket for tone selection
            raw_valence = row[valence_idx] if len(row) > valence_idx else ""
            valence_bucket = classify_valence(raw_valence)
            tone_pool = TONE_SYNONYMS.get(valence_bucket, TONE_SYNONYMS["neutral"])

            # Pick poetic adjectives (from tone) and noun (from core)
            adj1 = pick_synonym(tone_word, tone_pool, tone_index_map, word_counts)
            adj2 = pick_synonym(tone_word, tone_pool, tone_index_map, word_counts)
            noun = pick_synonym(core_word, CORE_SYNONYMS, core_index_map, word_counts)

            feeling2 = f"The {adj1} {adj2} {noun}"

            # Extend row if needed
            if len(row) <= feeling2_idx:
                row.extend([""] * (feeling2_idx + 1 - len(row)))

            row[feeling2_idx] = feeling2
            writer.writerow(row)

    # Replace original file with updated one
    OUTPUT_FILE.replace(INPUT_FILE)
    print(f"Successfully rebuilt 'Feeling 2' in {INPUT_FILE.name}")


if __name__ == "__main__":
    main()


