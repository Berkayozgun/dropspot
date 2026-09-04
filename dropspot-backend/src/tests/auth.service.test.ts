import { User, Role } from '../../generated/prisma/client';
import * as authService from '../services/auth.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

jest.mock('../../generated/prisma/client', () => {
  const prismaMock = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => prismaMock),
    Role: {
      USER: 'USER',
      ADMIN: 'ADMIN',
    },
    __prismaMock: prismaMock,
  };
});

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const prismaMock = (jest.requireMock('../../generated/prisma/client') as {
  __prismaMock: {
    user: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };
}).__prismaMock;

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      prismaMock.user.create.mockResolvedValue(mockUser);

      const user = await authService.registerUser('test@example.com', 'password123', 'Test User');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword',
          name: 'Test User',
          role: Role.USER,
        },
      });
      expect(user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: Role.USER,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw an error if registration fails', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      prismaMock.user.create.mockRejectedValue(new Error('Database error'));

      await expect(authService.registerUser('fail@example.com', 'password123')).rejects.toThrow('Database error');
    });
  });

  describe('loginUser', () => {
    it('should log in a user successfully and return a token', async () => {
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = 'mockedToken';

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const { user, token } = await authService.loginUser('test@example.com', 'password123');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        expect.any(String),
        { expiresIn: '1h' }
      );
      expect(user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: Role.USER,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(token).toBe(mockToken);
    });

    it('should throw an error for invalid credentials (user not found)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.loginUser('nonexistent@example.com', 'password123')).rejects.toThrow(
        'Geçersiz kimlik bilgileri'
      );
    });

    it('should throw an error for invalid credentials (incorrect password)', async () => {
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Geçersiz kimlik bilgileri'
      );
    });
  });
});
