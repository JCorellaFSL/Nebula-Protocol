"""
Environment verification script for Weather Dashboard.
Checks that all dependencies are correctly installed.
"""
import sys


def check_python_version():
    """Verify Python version is 3.10+."""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 10):
        print(f"[FAIL] Python {version.major}.{version.minor} detected. Need 3.10+")
        return False
    print(f"[OK] Python {version.major}.{version.minor}.{version.micro}")
    return True


def check_package(package_name):
    """Check if a package is installed."""
    try:
        __import__(package_name)
        print(f"[OK] {package_name} installed")
        return True
    except ImportError:
        print(f"[FAIL] {package_name} not found")
        return False


def main():
    """Run all environment checks."""
    print("=" * 60)
    print("Weather Dashboard - Environment Verification")
    print("=" * 60)
    print()

    checks = [
        ("Python version", check_python_version),
        ("requests", lambda: check_package("requests")),
        ("rich", lambda: check_package("rich")),
        ("dotenv", lambda: check_package("dotenv")),
        ("pytest", lambda: check_package("pytest")),
    ]

    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append(result)
        except Exception as e:
            print(f"[FAIL] {name}: {e}")
            results.append(False)

    print()
    print("=" * 60)

    if all(results):
        print("[SUCCESS] All checks passed! Environment ready.")
        print()
        print("Next steps:")
        print("  1. Get OpenWeatherMap API key (free)")
        print("  2. Create .env file with API key")
        print("  3. Run: weather --help")
        return 0
    else:
        print("[ERROR] Some checks failed. Please fix and retry.")
        print()
        print("To install dependencies:")
        print("  pip install -r requirements.txt")
        return 1


if __name__ == "__main__":
    sys.exit(main())

