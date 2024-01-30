import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';
import { FirebaseCloudMessageService } from './firebase.service';
import { SaveTokenDto } from './firebase.dto';

@Controller('push')
export class FirebaseController {
  constructor(private readonly fierbaseService: FirebaseCloudMessageService) {}

  @Post('/token')
  async saveToken(@Body() saveTokenDto: SaveTokenDto, @Res() res: Response) {
    try {
      await this.fierbaseService.saveToken(saveTokenDto);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Token saved successfully' });
    } catch (error) {
      // 클라이언트에게 실패 응답을 보냄
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @Get('/:userId')
  async sendPushNotification(@Param('userId') userId: number) {
    const accessToken = await this.fierbaseService.getAccessToken();
    try {
      const targetToken = await this.fierbaseService.getTargetToken(userId);
      const message = {
        message: {
          token: targetToken,
          notification: {
            title: 'TIL',
            body: '레츠고.',
          },
          data: {
            style: '테스트',
          },
        },
      };
      const response = await axios.post(
        'https://fcm.googleapis.com/v1/projects/fullstop-bfe10/messages:send',
        message,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log('Successfully sent message: ', response.data);
      return response.data;
    } catch (error) {
      console.error('Error Sending message: ', error.response);
      throw error;
    }
  }
}
