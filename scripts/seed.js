const db = require('../backend/postgresClient.cjs');
const bcrypt = require('bcryptjs');
const logger = require('../backend/logger.cjs');

async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Verificar se já existe um usuário admin
    const adminCheck = await db.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
    
    if (adminCheck.rows.length === 0) {
      // Criar usuário admin
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await db.query(`
        INSERT INTO users (name, email, password, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, ['Admin User', 'admin@example.com', hashedPassword, 'admin', true]);
      
      logger.info('Admin user created');
    } else {
      logger.info('Admin user already exists');
    }

    // Verificar se já existem webhooks padrão
    const webhookCheck = await db.query('SELECT id FROM webhooks WHERE url LIKE $1', ['%example.com%']);
    
    if (webhookCheck.rows.length === 0) {
      // Criar webhook de exemplo
      await db.query(`
        INSERT INTO webhooks (url, name, is_active, events)
        VALUES ($1, $2, $3, $4)
      `, [
        'https://webhook.site/example',
        'Example Webhook',
        false,
        JSON.stringify(['message', 'status_change'])
      ]);
      
      logger.info('Example webhook created');
    } else {
      logger.info('Example webhooks already exist');
    }

    // Verificar se já existem bots de exemplo
    const botCheck = await db.query('SELECT id FROM bots WHERE name LIKE $1', ['%Example%']);
    
    if (botCheck.rows.length === 0) {
      // Criar bot de exemplo
      await db.query(`
        INSERT INTO bots (name, session_name, description, is_active)
        VALUES ($1, $2, $3, $4)
      `, [
        'Example Bot',
        'example_bot',
        'Bot de exemplo para demonstração',
        false
      ]);
      
      logger.info('Example bot created');
    } else {
      logger.info('Example bots already exist');
    }

    // Verificar se já existem configurações padrão
    const configCheck = await db.query('SELECT id FROM configs WHERE key = $1', ['default_settings']);
    
    if (configCheck.rows.length === 0) {
      // Criar configurações padrão
      await db.query(`
        INSERT INTO configs (key, value, description)
        VALUES ($1, $2, $3)
      `, [
        'default_settings',
        JSON.stringify({
          maxBotsPerUser: 5,
          maxWebhooksPerUser: 10,
          sessionTimeout: 3600,
          logRetentionDays: 90
        }),
        'Configurações padrão do sistema'
      ]);
      
      logger.info('Default settings created');
    } else {
      logger.info('Default settings already exist');
    }

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error during seeding:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seed };