import csv
import os
import subprocess
import pytest

CSV_PATH = 'resources/database/accounts.csv'

def read_accounts():
    """Reads the CSV file and returns a list of account dictionaries."""
    accounts = []
    if os.path.exists(CSV_PATH):
        with open(CSV_PATH, 'r', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                accounts.append(row)
    return accounts

def get_account_by_username(username):
    """Returns the account dictionary matching the given username."""
    accounts = read_accounts()
    for acct in accounts:
        if acct['username'] == username:
            return acct
    return None

def run_verify_account(username):
    cmd = [
        'node',
        'resources/scripts/accountManagement/verifyEmail.js',  # ✅ RIGHT
        'verifyAccount',
        username
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode, result.stdout, result.stderr

@pytest.fixture(autouse=True)
def ensure_accounts_exist():
    """
    Ensure that the 'default' and 'admin' accounts exist and are unverified before running the test.
    This test is intended to be run after your account creation test has already added these accounts.
    """
    default = get_account_by_username('default')
    admin = get_account_by_username('admin')
    assert default is not None, "Default account must exist before running verification test"
    assert admin is not None, "Admin account must exist before running verification test"
    # Verify that the accounts are not already verified
    assert default['verified'] in ['0', 'false', False], "Default account should be unverified before test"
    assert admin['verified'] in ['0', 'false', False], "Admin account should be unverified before test"
    yield

def test_verify_accounts():
    # Run verifyAccount for the default account
    ret, out, err = run_verify_account("default")
    assert ret == 0, f"Verification failed for default account: {err}"

    # Run verifyAccount for the admin account
    ret, out, err = run_verify_account("admin")
    assert ret == 0, f"Verification failed for admin account: {err}"

    # Now, check the CSV to ensure both accounts have been updated to verified ("1" or "TRUE")
    default_account = get_account_by_username('default')
    admin_account = get_account_by_username('admin')

    assert default_account is not None and default_account['verified'] in ['1', 'true', True], \
        "Default account was not verified correctly"
    assert admin_account is not None and admin_account['verified'] in ['1', 'true', True], \
        "Admin account was not verified correctly"
