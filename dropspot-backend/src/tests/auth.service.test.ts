import { PrismaClient, User, Role } from '@prisma/client';
import * as authService from '../services/auth.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// PrismaClient'ı mock'la
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  })),
  Role: {
    USER: 'USER',
    ADMIN: 'ADMIN',
  },
}));

// bcryptjs'i mock'la
jest.mock('bcryptjs');

// jsonwebtoken'ı mock'la
jest.mock('jsonwebtoken');

const prisma = new PrismaClient();

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
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const user = await authService.registerUser('test@example.com', 'password123', 'Test User');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
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
      (prisma.user.create as jest.Mock).mockRejectedValue(new Error('Database error'));

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

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const { user, token } = await authService.loginUser('test@example.com', 'password123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, email: mockUser.email },
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
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

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

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Geçersiz kimlik bilgileri'
      );
    });
  });
});
