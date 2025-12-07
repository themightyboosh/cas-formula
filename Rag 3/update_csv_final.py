import csv
import sys

# Input from the previous step, output for this step
input_file = 'affect-combinations-updated.csv'
output_file = 'affect-combinations-final.csv'

try:
    with open(input_file, 'r', newline='', encoding='utf-8') as infile, \
         open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        
        reader = csv.reader(infile)
        writer = csv.writer(outfile)

        # Read header and find indices of columns we need
        header = next(reader)
        try:
            feeling_index = header.index('feeling')
            spotify_prompt_index = header.index('spotify_prompt')
        except ValueError as e:
            sys.exit(f"Error: Missing required column in CSV header - {e}")

        # Create the new header with "Feeling 2" added at the end
        new_header = header + ['Feeling 2']
        writer.writerow(new_header)
        
        # Process each data row
        for row in reader:
            # Skip empty rows
            if not row:
                continue

            try:
                # 1. Generate "Feeling 2" using the "Tone Core" formula
                feeling_text = row[feeling_index]
                parts = [p.strip() for p in feeling_text.split('|')]
                
                if len(parts) == 3:
                    core, _, tone = parts
                    feeling_2 = f"{tone} {core}"
                else:
                    # Set a default error value if the format is unexpected
                    feeling_2 = "TITLE_ERR"

                # 2. Update the spotify_prompt based on "Feeling 2"
                new_spotify_prompt = f'Using the Spotify Search API, find one track that evokes the feeling of "{feeling_2}". Return the single best matching track.'
                
                # 3. Update the row with the new prompt
                row[spotify_prompt_index] = new_spotify_prompt
                
                # 4. Append the new "Feeling 2" column to the row
                new_row = row + [feeling_2]
                
                writer.writerow(new_row)

            except IndexError:
                # Handle rows that might be shorter than expected
                print(f"Skipping malformed row (not enough columns): {row}")
                continue

    print(f"Successfully created new CSV with 'Feeling 2' and updated Spotify prompts. Saved as {output_file}")

except FileNotFoundError:
    sys.exit(f"Error: Input file '{input_file}' not found.")
except Exception as e:
    sys.exit(f"An error occurred: {e}")
