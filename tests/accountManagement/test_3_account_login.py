import subprocess
import pytest

def run_login_credentials(username, password):
    """
    Invokes the Node.js loginCredentials function via a CLI call.
    Expected usage:
    node resources/scripts/accountManagement/verifyLogin.js loginCredentials <username> <password>
    """
    cmd = [
        'node',
        'resources/scripts/accountManagement/verifyLogin.js',
        'loginCredentials',
        username,
        password
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode, result.stdout.strip(), result.stderr

def test_login_accounts():
    # Test login for the admin account.
    ret, out, err = run_login_credentials("admin", "cusadmin")
    assert ret == 0, f"Admin login failed with error: {err}"
    assert out.lower() == "true", f"Expected admin login to return 'true', got: {out}"
    
    # Test login for the default account.
    ret, out, err = run_login_credentials("default", "user")
    assert ret == 0, f"Default account login failed with error: {err}"
    assert out.lower() == "true", f"Expected default login to return 'true', got: {out}"
