import { HttpException } from '@nestjs/common';
import EnvironmentService from './environment.service';

describe('EnvironmentService', () => {
  beforeEach(() => {
    jest.resetModules(); // Reset modules before each test to ensure a clean state
  });

  // it('should throw an exception if environment variable does not exist', () => {
  //   expect(() => EnvironmentService.getEnv('NON_EXISTING_VARIABLE')).toThrow(HttpException);
  // });

  it('should retrieve DATABASE_HOST environment variable', () => {
    process.env.DATABASE_HOST = 'localhost';
    expect(EnvironmentService.DATABASE_HOST()).toBe('localhost');
  });

  it('should parse DATABASE_PORT environment variable as number', () => {
    process.env.DATABASE_PORT = '5432'; // Assuming it's a valid port number
    expect(EnvironmentService.DATABASE_PORT()).toBe(5432);
  });
});
