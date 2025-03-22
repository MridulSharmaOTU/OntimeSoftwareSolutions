import csv
import os
import subprocess
import pytest

# Path to the CSV file where accounts are stored
CSV_PATH = 'resources/database/accounts.csv'

def run_create_account(username, password, email, admin, verified):
    """
    Invokes the Node.js createAccount function via a CLI call.
    We assume that register.js accepts command-line arguments in the form:
    node resources/scripts/accountManagement/register.js createAccount <username> <password> <email> <admin> <verified>
    """
    cmd = [
        'node',
        'resources/scripts/accountManagement/register.js',
        'createAccount',
        username,
        password,
        email,
        str(admin),
        str(verified)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode, result.stdout, result.stderr

def read_accounts():
    """
    Reads accounts from the CSV file and returns a list of dictionaries.
    """
    accounts = []
    if os.path.exists(CSV_PATH):
        with open(CSV_PATH, 'r', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                accounts.append(row)
    return accounts

def write_accounts(accounts):
    """
    Writes the list of account dictionaries back to the CSV file.
    """
    if accounts:
        fieldnames = accounts[0].keys()
    else:
        fieldnames = ['username', 'password', 'email', 'admin', 'verified']
    with open(CSV_PATH, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(accounts)

def delete_test_accounts():
    """
    Removes any account with username 'default' or 'admin' from the CSV file.
    """
    accounts = read_accounts()
    filtered = [acct for acct in accounts if acct['username'] not in ['default', 'admin']]
    write_accounts(filtered)

@pytest.fixture(autouse=True)
def cleanup_accounts():
    """
    Ensure that test accounts are removed before and after each test.
    """
    delete_test_accounts()
    yield
    delete_test_accounts()

def test_create_and_delete_accounts():
    # Create a default account
    ret, out, err = run_create_account("default", "user", "user@localhost", 0, 0)
    assert ret == 0, f"Failed to create default account: {err}"

    # Create an admin account
    ret, out, err = run_create_account("admin", "cusadmin", "admin@localhost", 1, 0)
    assert ret == 0, f"Failed to create admin account: {err}"

    # Verify that both accounts exist in the CSV file
    accounts = read_accounts()
    default_account = next((acct for acct in accounts if acct['username'] == 'default'), None)
    admin_account = next((acct for acct in accounts if acct['username'] == 'admin'), None)
    assert default_account is not None, "Default account not found in CSV"
    assert admin_account is not None, "Admin account not found in CSV"

    # Now delete the test accounts
    delete_test_accounts()
    accounts = read_accounts()
    usernames = [acct['username'] for acct in accounts]
    assert 'default' not in usernames, "Default account was not deleted"
    assert 'admin' not in usernames, "Admin account was not deleted"
