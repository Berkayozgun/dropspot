module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@prisma/client/runtime/library$': '<rootDir>/node_modules/@prisma/client/runtime/library',
    '^@prisma/client/runtime/(.*)$': '<rootDir>/node_modules/@prisma/client/runtime/$1',
    '@prisma/client': '<rootDir>/generated/prisma',
  },
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/*.test.ts',
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
    '^.+\\.js$': 'babel-jest', // Eğer JS dosyalarınız varsa
    '^.+\\.tsx?$': 'ts-jest', // Hem .ts hem de .tsx dosyalarını işler
    '^.+\\.(ts|tsx|js|jsx|json)$ (generated/prisma)': 'ts-jest', // Generated Prisma Client dosyalarını işler
  },
};
