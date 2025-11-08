/**
 * Sync errors from Projects 1-3 to Central Knowledge Graph
 */
import { ProjectMemory } from './projects/project-1/.nebula/tools/project-memory.js';
import { CentralKGSync } from './src/kg/central-kg-sync.js';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'nebula_central_kg',
  user: 'nebula',
  password: 'nebula_secure_password'
});

const centralKG = new CentralKGSync(pool);

async function syncProject(projectPath, projectName, projectId) {
  console.log(`\n📦 Syncing ${projectName}...`);
  
  try {
    const pm = new ProjectMemory(projectPath, projectName, 'python');
    
    // Get all errors from project memory
    const errors = pm.db.prepare(`
      SELECT * FROM error_log ORDER BY timestamp
    `).all();
    
    console.log(`   Found ${errors.length} errors`);
    
    for (const error of errors) {
      // Sync error to Central KG
      await centralKG.syncError(projectId, error);
      
      // Get solutions for this error
      const solutions = pm.db.prepare(`
        SELECT * FROM solutions WHERE error_id = ?
      `).all(error.error_id);
      
      for (const solution of solutions) {
        await centralKG.syncSolution(projectId, solution);
      }
    }
    
    pm.close();
    console.log(`   ✅ Synced ${errors.length} errors to Central KG`);
    
    return errors.length;
  } catch (error) {
    console.error(`   ❌ Error syncing: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('🔄 Syncing Project Memories to Central Knowledge Graph\n');
  console.log('=' .repeat(60));
  
  let totalErrors = 0;
  
  // Sync Project 1: Todo List CLI
  totalErrors += await syncProject(
    './projects/project-1',
    'todo-list-cli',
    'project-1'
  );
  
  // Sync Project 2: Weather Dashboard  
  totalErrors += await syncProject(
    './projects/project-2',
    'weather-dashboard',
    'project-2'
  );
  
  // Sync Project 3: File Organizer
  totalErrors += await syncProject(
    './projects/project-3',
    'file-organizer',
    'project-3'
  );
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Sync complete! ${totalErrors} total errors synced to Central KG\n`);
  
  // Query Central KG stats
  const stats = await centralKG.getStatistics();
  console.log('📊 Central KG Statistics:');
  console.log(`   - Error patterns: ${stats.patterns || 0}`);
  console.log(`   - Solutions: ${stats.solutions || 0}`);
  console.log(`   - Instances: ${stats.instances || 0}`);
  console.log(`   - Technologies: ${stats.technologies || 0}`);
  console.log('');
  
  await pool.end();
}

main().catch(console.error);

