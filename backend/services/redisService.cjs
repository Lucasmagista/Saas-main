const redis = require('redis');
const config = require('../config.cjs');
const logger = require('../logger.cjs');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetryAttempts = 5;
  }

  /**
   * Inicializa a conexão com Redis
   */
  async connect() {
    try {
      // Verificar se Redis está configurado
      if (!config.redisHost || !config.redisPort) {
        logger.info('Redis não configurado, usando cache em memória');
        return false;
      }

      // Configuração do cliente Redis
      const redisConfig = {
        socket: {
          host: config.redisHost,
          port: config.redisPort,
          reconnectStrategy: (retries) => {
            if (retries > this.maxRetryAttempts) {
              logger.error('Máximo de tentativas de reconexão Redis atingido');
              return false;
            }
            const delay = Math.min(retries * 1000, 5000);
            logger.warn(`Tentativa de reconexão Redis ${retries}/${this.maxRetryAttempts} em ${delay}ms`);
            return delay;
          },
        },
        password: config.redisPassword || undefined,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis recusou conexão');
            return new Error('Redis indisponível');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Tempo máximo de retry Redis excedido');
            return new Error('Tempo de retry excedido');
          }
          if (options.attempt > this.maxRetryAttempts) {
            logger.error('Máximo de tentativas Redis atingido');
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        },
      };

      this.client = redis.createClient(redisConfig);

      // Event listeners
      this.client.on('connect', () => {
        logger.info('Conectado ao Redis');
        this.isConnected = true;
        this.retryAttempts = 0;
      });

      this.client.on('ready', () => {
        logger.info('Redis pronto para uso');
      });

      this.client.on('error', (error) => {
        logger.error('Erro no Redis:', error);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.warn('Conexão Redis encerrada');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Reconectando ao Redis...');
        this.retryAttempts++;
      });

      // Conectar
      await this.client.connect();
      return true;

    } catch (error) {
      logger.error('Erro ao conectar com Redis:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Desconecta do Redis
   */
  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        logger.info('Desconectado do Redis');
      } catch (error) {
        logger.error('Erro ao desconectar do Redis:', error);
      } finally {
        this.isConnected = false;
      }
    }
  }

  /**
   * Verifica se está conectado
   */
  isReady() {
    return this.isConnected && this.client;
  }

  /**
   * Define um valor no cache
   * @param {string} key - Chave
   * @param {any} value - Valor
   * @param {number} ttl - Tempo de vida em segundos
   */
  async set(key, value, ttl = 3600) {
    if (!this.isReady()) {
      logger.warn('Redis não disponível, operação set ignorada:', key);
      return false;
    }

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.setEx(key, ttl, serializedValue);
      logger.debug('Cache set:', { key, ttl });
      return true;
    } catch (error) {
      logger.error('Erro ao definir cache:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Obtém um valor do cache
   * @param {string} key - Chave
   * @param {boolean} parseJson - Se deve fazer parse do JSON
   */
  async get(key, parseJson = true) {
    if (!this.isReady()) {
      logger.warn('Redis não disponível, operação get ignorada:', key);
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value === null) {
        return null;
      }

      if (parseJson) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }

      return value;
    } catch (error) {
      logger.error('Erro ao obter cache:', { key, error: error.message });
      return null;
    }
  }

  /**
   * Remove uma chave do cache
   * @param {string} key - Chave
   */
  async del(key) {
    if (!this.isReady()) {
      logger.warn('Redis não disponível, operação del ignorada:', key);
      return false;
    }

    try {
      await this.client.del(key);
      logger.debug('Cache del:', key);
      return true;
    } catch (error) {
      logger.error('Erro ao remover cache:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Verifica se uma chave existe
   * @param {string} key - Chave
   */
  async exists(key) {
    if (!this.isReady()) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Erro ao verificar existência:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Define tempo de vida de uma chave
   * @param {string} key - Chave
   * @param {number} ttl - Tempo de vida em segundos
   */
  async expire(key, ttl) {
    if (!this.isReady()) {
      return false;
    }

    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error('Erro ao definir TTL:', { key, ttl, error: error.message });
      return false;
    }
  }

  /**
   * Obtém tempo de vida restante de uma chave
   * @param {string} key - Chave
   */
  async ttl(key) {
    if (!this.isReady()) {
      return -1;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Erro ao obter TTL:', { key, error: error.message });
      return -1;
    }
  }

  /**
   * Incrementa um valor
   * @param {string} key - Chave
   * @param {number} increment - Valor a incrementar
   */
  async incr(key, increment = 1) {
    if (!this.isReady()) {
      return null;
    }

    try {
      if (increment === 1) {
        return await this.client.incr(key);
      } else {
        return await this.client.incrBy(key, increment);
      }
    } catch (error) {
      logger.error('Erro ao incrementar:', { key, increment, error: error.message });
      return null;
    }
  }

  /**
   * Decrementa um valor
   * @param {string} key - Chave
   * @param {number} decrement - Valor a decrementar
   */
  async decr(key, decrement = 1) {
    if (!this.isReady()) {
      return null;
    }

    try {
      if (decrement === 1) {
        return await this.client.decr(key);
      } else {
        return await this.client.decrBy(key, decrement);
      }
    } catch (error) {
      logger.error('Erro ao decrementar:', { key, decrement, error: error.message });
      return null;
    }
  }

  /**
   * Adiciona item a uma lista
   * @param {string} key - Chave da lista
   * @param {any} value - Valor a adicionar
   */
  async lpush(key, value) {
    if (!this.isReady()) {
      return false;
    }

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.lPush(key, serializedValue);
      return true;
    } catch (error) {
      logger.error('Erro ao adicionar à lista:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Remove e retorna item do início da lista
   * @param {string} key - Chave da lista
   */
  async lpop(key) {
    if (!this.isReady()) {
      return null;
    }

    try {
      const value = await this.client.lPop(key);
      if (value === null) {
        return null;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error('Erro ao remover da lista:', { key, error: error.message });
      return null;
    }
  }

  /**
   * Obtém todos os itens de uma lista
   * @param {string} key - Chave da lista
   * @param {number} start - Índice inicial
   * @param {number} end - Índice final
   */
  async lrange(key, start = 0, end = -1) {
    if (!this.isReady()) {
      return [];
    }

    try {
      const values = await this.client.lRange(key, start, end);
      return values.map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      logger.error('Erro ao obter lista:', { key, error: error.message });
      return [];
    }
  }

  /**
   * Adiciona item a um conjunto
   * @param {string} key - Chave do conjunto
   * @param {any} value - Valor a adicionar
   */
  async sadd(key, value) {
    if (!this.isReady()) {
      return false;
    }

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.sAdd(key, serializedValue);
      return true;
    } catch (error) {
      logger.error('Erro ao adicionar ao conjunto:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Verifica se item existe no conjunto
   * @param {string} key - Chave do conjunto
   * @param {any} value - Valor a verificar
   */
  async sismember(key, value) {
    if (!this.isReady()) {
      return false;
    }

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      return await this.client.sIsMember(key, serializedValue);
    } catch (error) {
      logger.error('Erro ao verificar conjunto:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Obtém todos os itens de um conjunto
   * @param {string} key - Chave do conjunto
   */
  async smembers(key) {
    if (!this.isReady()) {
      return [];
    }

    try {
      const values = await this.client.sMembers(key);
      return values.map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      logger.error('Erro ao obter conjunto:', { key, error: error.message });
      return [];
    }
  }

  /**
   * Define valor em hash
   * @param {string} key - Chave do hash
   * @param {string} field - Campo
   * @param {any} value - Valor
   */
  async hset(key, field, value) {
    if (!this.isReady()) {
      return false;
    }

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.hSet(key, field, serializedValue);
      return true;
    } catch (error) {
      logger.error('Erro ao definir hash:', { key, field, error: error.message });
      return false;
    }
  }

  /**
   * Obtém valor de hash
   * @param {string} key - Chave do hash
   * @param {string} field - Campo
   */
  async hget(key, field) {
    if (!this.isReady()) {
      return null;
    }

    try {
      const value = await this.client.hGet(key, field);
      if (value === null) {
        return null;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error('Erro ao obter hash:', { key, field, error: error.message });
      return null;
    }
  }

  /**
   * Obtém todos os campos de um hash
   * @param {string} key - Chave do hash
   */
  async hgetall(key) {
    if (!this.isReady()) {
      return {};
    }

    try {
      const hash = await this.client.hGetAll(key);
      const result = {};
      
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Erro ao obter hash completo:', { key, error: error.message });
      return {};
    }
  }

  /**
   * Remove campo de hash
   * @param {string} key - Chave do hash
   * @param {string} field - Campo
   */
  async hdel(key, field) {
    if (!this.isReady()) {
      return false;
    }

    try {
      await this.client.hDel(key, field);
      return true;
    } catch (error) {
      logger.error('Erro ao remover campo do hash:', { key, field, error: error.message });
      return false;
    }
  }

  /**
   * Busca chaves por padrão
   * @param {string} pattern - Padrão de busca
   */
  async keys(pattern) {
    if (!this.isReady()) {
      return [];
    }

    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Erro ao buscar chaves:', { pattern, error: error.message });
      return [];
    }
  }

  /**
   * Limpa todas as chaves
   */
  async flushall() {
    if (!this.isReady()) {
      return false;
    }

    try {
      await this.client.flushAll();
      logger.info('Redis flushall executado');
      return true;
    } catch (error) {
      logger.error('Erro ao limpar Redis:', error);
      return false;
    }
  }

  /**
   * Obtém informações do Redis
   */
  async info() {
    if (!this.isReady()) {
      return null;
    }

    try {
      return await this.client.info();
    } catch (error) {
      logger.error('Erro ao obter info do Redis:', error);
      return null;
    }
  }

  /**
   * Ping no Redis
   */
  async ping() {
    if (!this.isReady()) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Erro no ping do Redis:', error);
      return false;
    }
  }
}

// Singleton instance
const redisService = new RedisService();

// Conectar automaticamente
redisService.connect().catch(error => {
  logger.error('Erro ao conectar com Redis:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await redisService.disconnect();
  process.exit(0);
});

module.exports = redisService;