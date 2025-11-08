"""
Environment verification script.
Run this to ensure setup is correct.
"""
import sys
import subprocess

def check_python_version():
    """Verify Python version is 3.10+"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 10:
        print(f"[OK] Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"[FAIL] Python {version.major}.{version.minor}.{version.micro} (need 3.10+)")
        return False

def check_virtual_env():
    """Verify we're in a virtual environment"""
    in_venv = hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    )
    if in_venv:
        print(f"[OK] Virtual environment active: {sys.prefix}")
        return True
    else:
        print("[FAIL] Not in virtual environment")
        return False

def check_imports():
    """Verify required packages are importable"""
    packages = ['pytest', 'colorama', 'black', 'flake8']
    all_ok = True
    
    for package in packages:
        try:
            __import__(package)
            print(f"[OK] {package} installed")
        except ImportError:
            print(f"[FAIL] {package} not found")
            all_ok = False
    
    return all_ok

def main():
    print("Verifying Development Environment...\n")
    
    checks = [
        check_python_version(),
        check_virtual_env(),
        check_imports()
    ]
    
    print("\n" + "="*50)
    if all(checks):
        print("[SUCCESS] All checks passed! Environment is ready.")
        return 0
    else:
        print("[ERROR] Some checks failed. Please review errors above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())

