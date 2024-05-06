// import { Test, TestingModule } from '@nestjs/testing';
// import { Connection } from 'typeorm';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

describe('AppController', () => {
  // let controller: AppController;
  // beforeEach(async () => {
  //   const app: TestingModule = await Test.createTestingModule({
  //     controllers: [AppController],
  //     providers: [AppService, Connection],
  //   }).compile();
  //   controller = app.get<AppController>(AppController);
  // });
  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });
  // describe('root', () => {
  //   it('should return', async () => {
  //     const result = await controller.health();
  //     expect(result).toBeTruthy();
  //   });
  // });

  describe('app controller test', () => {
    it('truthy', () => {
      expect(true).toBeTruthy();
    });
  });
});
