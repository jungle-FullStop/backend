import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { FirebaseCloudMessageService } from './firebase.service';
import { PushMessageDto, SaveTokenDto } from './dto/firebase.dto';

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
  @Post('/')
  async sendPushNotification(@Body() pushMessageDto: PushMessageDto) {
    console.log('요청받음');
    const accessToken = await this.fierbaseService.getAccessToken();
    try {
      const targetToken = await this.fierbaseService.getTargetToken(
        pushMessageDto.memberId,
      );
      const message = {
        message: {
          token: targetToken,
          notification: {
            title: pushMessageDto.body
              ? `${pushMessageDto.title}님이 응원합니다!`
              : `${pushMessageDto.title}님이 콕 찔렀습니다!`,
            body: pushMessageDto.body,
            image: 'https://images.app.goo.gl/uFEEuHyWJFFreQxJ7', // 이미지 URL 추가
          },
          data: {
            style: '테스트',
          },
        },
      };
      console.log('메세지 보내기 전');
      return await this.fierbaseService.sendMessage(message, accessToken);
    } catch (error) {
      console.error('Error Sending message: ', error.response);
      throw error;
    }
  }
}

//   @Get('/:userId')
//   async sendPushNotification(@Param('userId') userId: number) {
//     const accessToken = await this.fierbaseService.getAccessToken();
//     try {
//       const targetToken = await this.fierbaseService.getTargetToken(userId);
//       const message = {
//         message: {
//           token: targetToken,
//           notification: {
//             title: '콕',
//             body: '찌르기.',
//             image: 'https://ibb.co/WtGKK8R', // 이미지 URL 추가
//           },
//           data: {
//             style: '테스트',
//           },
//         },
//       };
//       return await this.fierbaseService.sendMessage(message, accessToken);
//     } catch (error) {
//       console.error('Error Sending message: ', error.response);
//       throw error;
//     }
//   }
// }
