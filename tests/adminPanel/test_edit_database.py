import csv
import os
import subprocess
import time
import pytest

# Define paths: adjust if needed for your project structure.
CSV_PATH = os.path.join('resources', 'database', 'metadataGames.csv')
EDIT_METADATA_JS = os.path.join('resources', 'scripts', 'editMetadata.js')

def read_games():
    """
    Reads the metadataGames.csv file and returns a list of game dictionaries.
    """
    games = []
    if os.path.exists(CSV_PATH):
        with open(CSV_PATH, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                games.append(row)
    return games

def run_node_command(args):
    """
    Runs a Node.js command with the given arguments for editMetadata.js.
    Returns a tuple of (return_code, stdout, stderr).
    """
    cmd = ['node', EDIT_METADATA_JS] + args
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode, result.stdout, result.stderr

def test_edit_database():
    # Use a unique title for the test game to avoid conflicts.
    unique_suffix = str(int(time.time()))
    test_title = f"Test Game PyTest {unique_suffix}"
    test_descS = "Short description"
    test_genreTags = "Action|Adventure"
    test_releaseDate = "2025-03-22"
    test_platform = "PC"
    test_developerPublisher = "TestDev/Publisher"
    test_age = "E"
    test_rating = "5"
    test_avgCompletion = "10"
    test_descL = "Long description"
    test_trailer = "http://trailer.url"

    # Step 1: Add the test game.
    ret, out, err = run_node_command([
        'addGame',
        test_title,
        test_descS,
        test_genreTags,
        test_releaseDate,
        test_platform,
        test_developerPublisher,
        test_age,
        test_rating,
        test_avgCompletion,
        test_descL,
        test_trailer
    ])
    print(out)
    assert ret == 0, f"addGame failed: {err}"

    # Read the CSV and locate the newly added game by its unique title.
    games = read_games()
    game = next((g for g in games if g['Title'] == test_title), None)
    assert game is not None, "Added game not found in CSV"
    test_id = game['ID']

    # Step 2: Edit the test game, changing its title.
    new_title = test_title + " Updated"
    # For fields you don't want to change, pass empty strings so they are skipped.
    ret, out, err = run_node_command([
        'editGame',
        test_id,
        new_title,
        "", "", "", "", "", "", "", "", "", ""
    ])
    assert ret == 0, f"editGame failed: {err}"

    # Verify that the game's title has been updated.
    games = read_games()
    game = next((g for g in games if g['ID'] == test_id), None)
    assert game is not None, "Game not found after editing"
    assert game['Title'] == new_title, "Game title was not updated"

    # Step 3: Delete the test game.
    ret, out, err = run_node_command(['deleteGame', test_id])
    assert ret == 0, f"deleteGame failed: {err}"

    # Verify that the game is no longer present in the CSV.
    games = read_games()
    game = next((g for g in games if g['ID'] == test_id), None)
    assert game is None, "Game was not deleted from CSV"
