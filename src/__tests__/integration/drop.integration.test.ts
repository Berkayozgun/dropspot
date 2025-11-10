import request from 'supertest';
import app from '../../index'; // Express uygulamamızı import et
import { PrismaClient, Role } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

describe('Drop API Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminUserId: string;
  let regularUserId: string;

  beforeAll(async () => {
    // Veritabanını temizle
    await prisma.drop.deleteMany();
    await prisma.user.deleteMany();

    // Test admin kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('adminpassword', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: Role.ADMIN,
      },
    });
    adminUserId = adminUser.id;
    adminToken = jwt.sign({ userId: adminUser.id, email: adminUser.email, role: adminUser.role }, JWT_SECRET, { expiresIn: '1h' });

    // Test normal kullanıcısı oluştur
    const regularHashedPassword = await bcrypt.hash('userpassword', 10);
    const regularUser = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: regularHashedPassword,
        name: 'Regular User',
        role: Role.USER,
      },
    });
    regularUserId = regularUser.id;
    userToken = jwt.sign({ userId: regularUser.id, email: regularUser.email, role: regularUser.role }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    // Test verilerini temizle
    await prisma.drop.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  let dropId: string;

  it('should allow an admin to create a new drop', async () => {
    const response = await request(app)
      .post('/admin/drops')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Drop 1',
        description: 'This is a test drop',
        price: 100,
        stock: 10,
        releaseDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        claimWindowStart: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        claimWindowEnd: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test Drop 1');
    dropId = response.body.id;
  });

  it('should prevent a regular user from creating a drop', async () => {
    const response = await request(app)
      .post('/admin/drops')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Unauthorized Drop',
        description: 'Should not be created',
        price: 50,
        stock: 5,
        releaseDate: new Date().toISOString(),
        claimWindowStart: new Date().toISOString(),
        claimWindowEnd: new Date().toISOString(),
      });

    expect(response.status).toBe(403);
  });

  it('should allow anyone to get all drops', async () => {
    const response = await request(app).get('/drops');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].id).toBe(dropId);
  });

  it('should allow an admin to update a drop', async () => {
    const updatedName = 'Updated Test Drop';
    const response = await request(app)
      .put(`/admin/drops/${dropId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: updatedName,
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updatedName);
  });

  it('should prevent a regular user from updating a drop', async () => {
    const response = await request(app)
      .put(`/admin/drops/${dropId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Attempted Update',
      });

    expect(response.status).toBe(403);
  });

  it('should allow an admin to delete a drop', async () => {
    const response = await request(app)
      .delete(`/admin/drops/${dropId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);

    // Verify the drop is deleted
    const getResponse = await request(app).get('/drops');
    expect(getResponse.body).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: dropId })]));
  });

  it('should prevent a regular user from deleting a drop', async () => {
    // Create a new drop for deletion attempt
    const newDropResponse = await request(app)
      .post('/admin/drops')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Another Drop for Deletion',
        description: 'Another test drop',
        price: 200,
        stock: 5,
        releaseDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        claimWindowStart: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        claimWindowEnd: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      });
    const anotherDropId = newDropResponse.body.id;

    const response = await request(app)
      .delete(`/admin/drops/${anotherDropId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);

    // Clean up the created drop
    await request(app)
      .delete(`/admin/drops/${anotherDropId}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });
});
