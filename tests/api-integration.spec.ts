import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

/**
 * These tests focus exclusively on the API layer, bypassing the UI.
 * They verify data integrity, AI integration, and core business logic.
 */
test.describe('Hotel Management System - API Integration Tests', () => {

  // 1. Database Seeding API
  test('POST /api/seed should populate the database', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/seed`, {
      data: {
        guestCount: 5,
        roomCount: 2,
        bookingCount: 5,
        calendarCount: 10
      }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toMatch(/seeded successfully/i);
  });

  // 2. Dynamic Pricing API (Rule-based & AI-ready)
  test('GET /api/pricing should return valid price multipliers', async ({ request }) => {
    // We use 'demo-id' which is handled in our route to find any room if not seeded with specific IDs
    const today = new Date().toISOString().split('T')[0];
    const response = await request.get(`${BASE_URL}/api/pricing`, {
      params: {
        roomId: 'demo-id',
        date: today
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Verify schema structure
    expect(body).toHaveProperty('dynamicPrice');
    expect(body).toHaveProperty('basePrice');
    expect(body.factors).toHaveProperty('occupancyRate');
    
    // Check if logic produced a valid number
    expect(typeof body.dynamicPrice).toBe('number');
    expect(body.dynamicPrice).toBeGreaterThan(0);
  });

  // 3. Occupancy Analytics API
  test('GET /api/analytics/occupancy should return 7-day forecast', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/analytics/occupancy`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBe(7); // It should return 7 days of forecast
    
    const firstDay = body[0];
    expect(firstDay).toHaveProperty('date');
    expect(firstDay).toHaveProperty('occupancy');
    expect(typeof firstDay.occupancy).toBe('number');
  });

  // 4. Guest Intelligence / Segmentation API (Groq Integration)
  test('GET /api/analytics/guest-prediction should return inferred segments', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/analytics/guest-prediction`);
    
    // If Groq key is missing, it still returns fallback data
    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(Array.isArray(body)).toBeTruthy();
    if (body.length > 0) {
      const guest = body[0];
      expect(guest).toHaveProperty('name');
      expect(guest).toHaveProperty('predictedSegment');
      expect(guest).toHaveProperty('loyaltyScore');
      expect(guest.loyaltyScore).toBeGreaterThanOrEqual(0);
      expect(guest.loyaltyScore).toBeLessThanOrEqual(100);
    }
  });

});
