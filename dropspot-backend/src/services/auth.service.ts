import { PrismaClient, Role } from '../../generated/prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'; // Gerçek projede güvenli bir şekilde yönetilmelidir.

export const registerUser = async (email: string, password_plain: string, name?: string, role: Role = Role.USER) => {
  const hashedPassword = await bcrypt.hash(password_plain, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role, // Role'ü ekle
    },
  });
  // Parolayı geri döndürmemek güvenlik açısından önemlidir.
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const loginUser = async (email: string, password_plain: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Geçersiz kimlik bilgileri');
  }

  const isPasswordValid = await bcrypt.compare(password_plain, user.password);
  if (!isPasswordValid) {
    throw new Error('Geçersiz kimlik bilgileri');
  }

  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  console.log('Generated token:', token); // Token'ı logla
  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};
