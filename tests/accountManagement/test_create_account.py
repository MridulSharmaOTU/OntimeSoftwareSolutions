import csv
import os
import subprocess
import pytest

CSV_PATH = 'resources/database/accounts.csv'

def run_create_account(username, password, email, admin, verified):
    """
    Invokes the Node.js createAccount function via a CLI call.
    Assumes that register.js accepts command-line arguments in the form:
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

def test_create_accounts():
    # Delete test accounts first to ensure a clean slate.
    delete_test_accounts()

    # Create a default account
    ret, out, err = run_create_account("default", "user", "user@localhost", False, False)
    assert ret == 0, f"Failed to create default account: {err}"

    # Create an admin account
    ret, out, err = run_create_account("admin", "cusadmin", "admin@localhost", True, False)
    assert ret == 0, f"Failed to create admin account: {err}"

    # Verify that both accounts exist in the CSV file
    accounts = read_accounts()
    default_account = next((acct for acct in accounts if acct['username'] == 'default'), None)
    admin_account = next((acct for acct in accounts if acct['username'] == 'admin'), None)
    assert default_account is not None, "Default account not found in CSV"
    assert admin_account is not None, "Admin account not found in CSV"