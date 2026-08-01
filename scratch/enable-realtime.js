const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    // Enable realtime for Notification table
    await client.query('ALTER PUBLICATION supabase_realtime ADD TABLE "Notification";');
    console.log('Realtime enabled for Notification table');
  } catch (error) {
    if (error.message.includes('already in publication')) {
      console.log('Already enabled');
    } else {
      console.error(error);
    }
  } finally {
    await client.end();
  }
}

main();
