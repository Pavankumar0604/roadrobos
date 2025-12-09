#!/usr/bin/env node

/**
 * Database Management Utility
 * Helper script for common database tasks
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const fs = require('fs').promises;

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'roadrobos_db',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
};

async function runSQL(filename) {
    let connection;
    try {
        console.log(`📂 Reading ${filename}...`);
        const sql = await fs.readFile(path.join(__dirname, filename), 'utf8');

        console.log(`🔌 Connecting to database...`);
        connection = await mysql.createConnection(config);

        console.log(`⚡ Executing SQL...`);
        await connection.query(sql);

        console.log(`✅ Successfully executed ${filename}`);
    } catch (error) {
        console.error(`❌ Error:`, error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function healthCheck() {
    let connection;
    try {
        console.log(`🏥 Running health check...`);
        connection = await mysql.createConnection(config);

        const [rows] = await connection.execute('SELECT 1 as health');

        if (rows[0].health === 1) {
            console.log(`✅ Database is healthy!`);

            // Check tables
            const [tables] = await connection.execute('SHOW TABLES');
            console.log(`📊 Tables found: ${tables.length}`);

            return true;
        }
    } catch (error) {
        console.error(`❌ Health check failed:`, error.message);
        console.log(`\n💡 Tips:`);
        console.log(`  - Check if MySQL is running`);
        console.log(`  - Verify DB_HOST, DB_USER, DB_PASSWORD in .env`);
        console.log(`  - Ensure database exists: ${config.database}`);
        return false;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function createDatabase() {
    let connection;
    try {
        console.log(`🔨 Creating database...`);

        // Connect without database selection
        const tempConfig = { ...config };
        delete tempConfig.database;

        connection = await mysql.createConnection(tempConfig);

        await connection.query(
            `CREATE DATABASE IF NOT EXISTS ${config.database} 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );

        console.log(`✅ Database '${config.database}' created successfully!`);
    } catch (error) {
        console.error(`❌ Error creating database:`, error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function dropDatabase() {
    let connection;
    try {
        console.log(`⚠️  WARNING: This will delete all data!`);
        console.log(`🗑️  Dropping database '${config.database}'...`);

        const tempConfig = { ...config };
        delete tempConfig.database;

        connection = await mysql.createConnection(tempConfig);

        await connection.query(`DROP DATABASE IF EXISTS ${config.database}`);

        console.log(`✅ Database dropped successfully!`);
    } catch (error) {
        console.error(`❌ Error dropping database:`, error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function resetDatabase() {
    console.log(`🔄 Resetting database...`);
    await dropDatabase();
    await createDatabase();
    await runSQL('schema.sql');
    console.log(`✅ Database reset complete!`);
}

async function main() {
    const command = process.argv[2];

    console.log(`\n🚀 RoAd RoBo's Database Manager\n`);

    try {
        switch (command) {
            case 'health':
                await healthCheck();
                break;

            case 'create':
                await createDatabase();
                break;

            case 'schema':
                await runSQL('schema.sql');
                break;

            case 'seed':
                await runSQL('seed.sql');
                break;

            case 'setup':
                console.log(`📦 Setting up database from scratch...\n`);
                await createDatabase();
                await runSQL('schema.sql');
                await runSQL('seed.sql');
                console.log(`\n✅ Setup complete! Database is ready to use.`);
                break;

            case 'reset':
                await resetDatabase();
                break;

            case 'drop':
                await dropDatabase();
                break;

            default:
                console.log(`Usage: node db.js <command>

Available commands:
  health    - Check database connection and status
  create    - Create the database
  schema    - Run schema.sql (create tables)
  seed      - Run seed.sql (insert sample data)
  setup     - Complete setup (create + schema + seed)
  reset     - Drop and recreate database with schema
  drop      - Drop the database (⚠️  deletes all data)

Examples:
  node db.js health        # Check if database is working
  node db.js setup         # First time setup
  node db.js seed          # Add sample data
  node db.js reset         # Reset everything
`);
                break;
        }
    } catch (error) {
        console.error(`\n❌ Command failed!`);
        process.exit(1);
    }

    console.log(``);
    process.exit(0);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    runSQL,
    healthCheck,
    createDatabase,
    dropDatabase,
    resetDatabase
};
