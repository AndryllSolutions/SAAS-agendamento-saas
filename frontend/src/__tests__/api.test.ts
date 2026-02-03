/**
 * API Service Tests
 * Test that API service matches backend responses
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import axios from 'axios'
import { authService, clientService, serviceService, productService } from '@/services/api'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as any

describe('API Service - Frontend Backend Synergy', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Auth Service', () => {
    it('should format login request correctly', async () => {
      const mockResponse = {
        data: {
          access_token: 'token123',
          refresh_token: 'refresh123',
          token_type: 'bearer',
        },
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await authService.login('test@example.com', 'password123')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      )

      expect(result.data).toHaveProperty('access_token')
      expect(result.data).toHaveProperty('refresh_token')
      expect(result.data.token_type).toBe('bearer')
    })
  })

  describe('Client Service', () => {
    it('should format client list response correctly', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            full_name: 'Test Client',
            email: 'client@test.com',
            phone: '11999999999',
          },
        ],
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await clientService.list()

      expect(result.data).toBeInstanceOf(Array)
      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('full_name')
      expect(result.data[0]).toHaveProperty('email')
    })

    it('should format create client request correctly', async () => {
      const mockResponse = {
        data: {
          id: 1,
          full_name: 'New Client',
          email: 'new@test.com',
        },
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const clientData = {
        full_name: 'New Client',
        email: 'new@test.com',
        phone: '11999999999',
        company_id: 1,
      }

      const result = await clientService.create(clientData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/clients'),
        clientData,
        expect.any(Object)
      )

      expect(result.data).toHaveProperty('id')
      expect(result.data.full_name).toBe('New Client')
    })
  })

  describe('Service Service', () => {
    it('should format service response correctly', async () => {
      const mockResponse = {
        data: {
          id: 1,
          name: 'Test Service',
          description: 'Description',
          duration: 60,
          price: 100.0,
        },
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await serviceService.get(1)

      expect(result.data).toHaveProperty('id')
      expect(result.data).toHaveProperty('name')
      expect(result.data).toHaveProperty('duration')
      expect(result.data).toHaveProperty('price')
      expect(typeof result.data.price).toBe('number')
    })
  })

  describe('Product Service', () => {
    it('should format product response correctly', async () => {
      const mockResponse = {
        data: {
          id: 1,
          name: 'Test Product',
          price: 50.0,
          cost: 30.0,
          stock: 100,
        },
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await productService.get(1)

      expect(result.data).toHaveProperty('id')
      expect(result.data).toHaveProperty('name')
      expect(result.data).toHaveProperty('price')
      expect(result.data).toHaveProperty('cost')
      expect(result.data).toHaveProperty('stock')
      expect(typeof result.data.price).toBe('number')
    })
  })
})

