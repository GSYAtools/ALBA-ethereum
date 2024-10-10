module.exports = {
  // Especifica los directorios
  contracts_directory: './contracts',
  migrations_directory: './migrations',
  test_directory: './test',

  // Configura las redes
  networks: {
    // Red de desarrollo local (Ganache)
    development: {
      host: "127.0.0.1",     // Localhost
      port: 8545,            // Puerto estándar de Ganache
      network_id: "*",       // Cualquier red
      gas: 6721975,          // Límite de gas
      gasPrice: 20000000000  // 20 gwei
    },
    
    // Puedes agregar más redes aquí si las necesitas en el futuro
  },

  // Configura los compiladores
  compilers: {
    solc: {
      version: "0.8.13",    // Versión del compilador de Solidity
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  // Configuración de la consola de Truffle (opcional)
  console: {
    require: [
      // Puedes agregar módulos que quieras cargar automáticamente en la consola
    ]
  },

  // Plugins (opcional)
  plugins: [
    // Puedes agregar plugins de Truffle aquí
  ],

  // Configuración de mocha para pruebas (opcional)
  mocha: {
    timeout: 100000
  }
};
