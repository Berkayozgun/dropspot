import request from 'supertest';
import app from '../../index'; // Express uygulamanızı import edin

describe('Drop Integration Tests', () => {
  it('GET /drops should return an empty array initially', async () => {
    const res = await request(app).get('/drops');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });
});
