import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TelegramService', () => {
  let service: TelegramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegramService, ConfigService],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a funny statement from the API', async () => {
    const joke = 'This is a test joke';
    mockedAxios.get.mockResolvedValueOnce({ data: { joke } });

    const response = await service['getFunnyStatement']();
    expect(response).toBe(joke);
  });

  it('should handle API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    const response = await service['getFunnyStatement']();
    expect(response).toBe(
      "I couldn't think of a joke right now. Try again later!",
    );
  });

  it('should recognize a greeting', () => {
    expect(service['isGreeting']('hello')).toBe(true);
    expect(service['isGreeting']('hi')).toBe(true);
    expect(service['isGreeting']('hey')).toBe(true);
    expect(service['isGreeting']('howdy')).toBe(false);
  });
});
