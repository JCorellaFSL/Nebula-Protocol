"""
Setup script for Local Knowledge Graph
Initializes database with schema and seed data
"""
import sqlite3
import sys
from pathlib import Path


def setup_local_kg(db_path: str = "local_kg/nebula_kg_local.db", include_seed: bool = True):
    """
    Initialize Local KG database
    
    Args:
        db_path: Path to SQLite database file
        include_seed: Whether to include seed data (real errors from setup)
    """
    db_file = Path(db_path)
    schema_file = Path(__file__).parent / "schema.sql"
    seed_file = Path(__file__).parent / "seed_data.sql"
    
    # Create directory if needed
    db_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Check if database already exists
    if db_file.exists():
        response = input(f"Database {db_path} already exists. Recreate? (y/N): ")
        if response.lower() != 'y':
            print("Aborted.")
            return
        db_file.unlink()
    
    print(f"Creating Local KG database: {db_path}")
    
    # Connect and create schema
    conn = sqlite3.connect(str(db_file))
    
    try:
        # Load schema
        if not schema_file.exists():
            print(f"[ERROR] Schema file not found: {schema_file}")
            return
        
        print("[*] Loading schema...")
        with open(schema_file, 'r') as f:
            schema_sql = f.read()
            conn.executescript(schema_sql)
        
        print("[+] Schema created")
        
        # Load seed data if requested
        if include_seed:
            if not seed_file.exists():
                print(f"[!] Seed file not found: {seed_file}")
            else:
                print("[*] Loading seed data (real errors from Nebula-KG setup)...")
                with open(seed_file, 'r') as f:
                    seed_sql = f.read()
                    conn.executescript(seed_sql)
                
                # Count what was loaded
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM local_patterns")
                pattern_count = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM local_solutions")
                solution_count = cursor.fetchone()[0]
                
                print(f"[+] Seed data loaded:")
                print(f"   - {pattern_count} patterns")
                print(f"   - {solution_count} solutions")
        
        conn.commit()
        
        print()
        print("=" * 60)
        print("[SUCCESS] Local KG initialized successfully!")
        print("=" * 60)
        print()
        print("Next steps:")
        print(f"  1. View patterns: sqlite3 {db_path} 'SELECT * FROM v_pattern_solutions;'")
        print(f"  2. Run examples: python local_kg/example.py")
        print(f"  3. Sync to Central KG: python -m local_kg.sync http://localhost:8080")
        print()
        
    except Exception as e:
        print(f"[ERROR] Error during setup: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()


def main():
    """CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Initialize Local Knowledge Graph")
    parser.add_argument(
        "--db-path",
        default="local_kg/nebula_kg_local.db",
        help="Path to SQLite database (default: local_kg/nebula_kg_local.db)"
    )
    parser.add_argument(
        "--no-seed",
        action="store_true",
        help="Skip loading seed data"
    )
    
    args = parser.parse_args()
    
    setup_local_kg(
        db_path=args.db_path,
        include_seed=not args.no_seed
    )


if __name__ == "__main__":
    main()

