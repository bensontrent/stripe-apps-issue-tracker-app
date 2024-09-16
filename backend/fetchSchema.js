require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');

async function fetchSchema() {
  try {
    // Run prisma db pull command
    execSync('npx prisma db pull', { stdio: 'inherit' });

    console.log('Schema fetched successfully!');

    // Optionally, you can read and log the schema
    const schema = fs.readFileSync('./prisma/schema.prisma', 'utf8');
    console.log('Fetched Schema:');
    console.log(schema);
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

fetchSchema();