"""
Sync local patterns/solutions to Central Knowledge Graph
Reference implementation for IDE and Protocol sync mechanisms
"""
import httpx
import asyncio
import logging
from typing import Optional, Dict, Any
from local_kg.local_kg import LocalKG, get_local_kg

logger = logging.getLogger("local_kg.sync")


class CentralKGSync:
    """Sync manager for pushing local patterns to Central KG"""
    
    def __init__(
        self,
        central_api_url: str,
        instance_id: str,
        local_kg: Optional[LocalKG] = None
    ):
        """
        Initialize sync manager
        
        Args:
            central_api_url: URL of Central KG API (e.g., http://localhost:8080)
            instance_id: UUID identifying this instance
            local_kg: LocalKG instance (optional, will create if not provided)
        """
        self.central_api_url = central_api_url.rstrip('/')
        self.instance_id = instance_id
        self.local_kg = local_kg or get_local_kg()
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def sync_all(self) -> Dict[str, Any]:
        """
        Sync all unsynced patterns and solutions to Central KG
        
        Returns:
            Sync summary with counts and errors
        """
        summary = {
            "patterns_synced": 0,
            "patterns_failed": 0,
            "solutions_synced": 0,
            "solutions_failed": 0,
            "errors": []
        }
        
        # Sync patterns first
        patterns = self.local_kg.get_unsynced_patterns()
        logger.info(f"Found {len(patterns)} unsynced patterns")
        
        for pattern in patterns:
            try:
                central_id = await self._sync_pattern(pattern)
                if central_id:
                    self.local_kg.mark_pattern_synced(pattern['id'], central_id)
                    summary["patterns_synced"] += 1
                else:
                    summary["patterns_failed"] += 1
            except Exception as e:
                logger.error(f"Failed to sync pattern {pattern['id']}: {e}")
                summary["patterns_failed"] += 1
                summary["errors"].append(str(e))
        
        # Then sync solutions
        solutions = self.local_kg.get_unsynced_solutions()
        logger.info(f"Found {len(solutions)} unsynced solutions")
        
        for solution in solutions:
            try:
                # Only sync if pattern was synced
                pattern_cursor = self.local_kg.conn.cursor()
                pattern_cursor.execute(
                    "SELECT central_pattern_id FROM local_patterns WHERE id = ?",
                    (solution['pattern_id'],)
                )
                row = pattern_cursor.fetchone()
                
                if row and row[0]:
                    central_id = await self._sync_solution(solution, row[0])
                    if central_id:
                        self.local_kg.mark_solution_synced(solution['id'], central_id)
                        summary["solutions_synced"] += 1
                    else:
                        summary["solutions_failed"] += 1
                else:
                    logger.warning(f"Skipping solution {solution['id']}: pattern not synced")
                    summary["solutions_failed"] += 1
            except Exception as e:
                logger.error(f"Failed to sync solution {solution['id']}: {e}")
                summary["solutions_failed"] += 1
                summary["errors"].append(str(e))
        
        return summary
    
    async def _sync_pattern(self, pattern: Dict[str, Any]) -> Optional[str]:
        """
        Sync a single pattern to Central KG
        
        Returns:
            Central pattern ID if successful, None otherwise
        """
        payload = {
            "instance_id": self.instance_id,
            "error_signature": pattern['error_signature'],
            "error_category": pattern['error_category'],
            "language": pattern['language'],
            "description": pattern['description'],
            "technologies": pattern.get('technologies', [])
        }
        
        # Add context if available
        if pattern.get('context_json'):
            import json
            payload['context'] = json.loads(pattern['context_json'])
        
        try:
            response = await self.client.post(
                f"{self.central_api_url}/api/v1/patterns/submit",
                json=payload
            )
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Pattern synced: {pattern['error_signature'][:50]}")
            
            # Return pattern ID (might be existing pattern ID if duplicate)
            return str(result.get('id') or result.get('existing_pattern_id'))
        
        except httpx.HTTPError as e:
            logger.error(f"HTTP error syncing pattern: {e}")
            return None
    
    async def _sync_solution(
        self,
        solution: Dict[str, Any],
        central_pattern_id: str
    ) -> Optional[str]:
        """
        Sync a single solution to Central KG
        
        Args:
            solution: Local solution dict
            central_pattern_id: UUID of pattern in Central KG
        
        Returns:
            Central solution ID if successful, None otherwise
        """
        payload = {
            "pattern_id": central_pattern_id,
            "title": solution['title'],
            "description": solution['description'],
            "code_snippet": solution.get('code_snippet'),
            "difficulty_level": "intermediate"  # Could be derived from time_to_resolve
        }
        
        try:
            response = await self.client.post(
                f"{self.central_api_url}/api/v1/solutions/submit",
                json=payload
            )
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Solution synced: {solution['title'][:50]}")
            return str(result['id'])
        
        except httpx.HTTPError as e:
            logger.error(f"HTTP error syncing solution: {e}")
            return None
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()


async def sync_to_central(
    central_api_url: str = "http://localhost:8080",
    instance_id: Optional[str] = None
):
    """
    Convenience function to sync local KG to central
    
    Usage:
        import asyncio
        from local_kg.sync import sync_to_central
        
        asyncio.run(sync_to_central(
            central_api_url="http://localhost:8080",
            instance_id="your-instance-uuid"
        ))
    """
    if not instance_id:
        from uuid import uuid4
        instance_id = str(uuid4())
        logger.warning(f"No instance_id provided, generated: {instance_id}")
    
    async with CentralKGSync(central_api_url, instance_id) as sync_manager:
        summary = await sync_manager.sync_all()
        
        logger.info("Sync complete:")
        logger.info(f"  Patterns synced: {summary['patterns_synced']}")
        logger.info(f"  Patterns failed: {summary['patterns_failed']}")
        logger.info(f"  Solutions synced: {summary['solutions_synced']}")
        logger.info(f"  Solutions failed: {summary['solutions_failed']}")
        
        if summary['errors']:
            logger.error(f"Errors encountered: {summary['errors']}")
        
        return summary


if __name__ == "__main__":
    # CLI tool for manual sync
    import sys
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    api_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
    instance_id = sys.argv[2] if len(sys.argv) > 2 else None
    
    asyncio.run(sync_to_central(api_url, instance_id))

