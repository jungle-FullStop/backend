import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import axios from 'axios';
import { UsersRepository } from 'src/users/users.repository';
import { SaveTokenDto } from './dto/firebase.dto';

@Injectable()
export class FirebaseCloudMessageService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async sendMessage(
    message: {
      message: {
        token: string;
        notification: { title: string; body: string; image: string };
        data: { style: string };
      };
    },
    accessToken: string,
  ) {
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
  }
  catch(error) {
    console.error('Error Sending message: ', error.response);
    throw error;
  }

  async saveToken(token: SaveTokenDto): Promise<string> {
    return await this.usersRepository.saveToken(token);
  }

  async getTargetToken(userId: number): Promise<string> {
    const targetToken = await this.usersRepository.findTargetToken(userId);
    if (!targetToken) {
      throw new Error('Method not implemented.');
    }
    return targetToken.firebaseToken;
  }

  async getAccessToken(): Promise<string> {
    // const path = require('path');
    // // const firebaseConfigPath = './serviceAccountKey.json';
    // const firebaseConfigPath = path.resolve(
    //   __dirname,
    //   '..',
    //   'serviceAccountKey.json',
    // );

    // const serviceAccount = JSON.parse(
    //   readFileSync(firebaseConfigPath, 'utf-8'),

    // const { client_email, private_key } = serviceAccount;
    const jwtClient = new google.auth.JWT(
      'firebase-adminsdk-vyp48@fullstop-bfe10.iam.gserviceaccount.com',
      null,
      '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDCaRQtL2F5dlK1\ngfHh1DlYYTbjd5KzVIDJCw8jcHe6k3XW61Bn3alkKLgvbXOEAt55LsCnNzmEGio7\niZ2ciSBCpQTe+UU3Qg3+QQ58/E6ZM+xKp+FP14NLh5ZqOW29UQylYqtFkgY53w1X\nZ4K04mqpUYoIrTeaqgUo7yBd5ujkH9mAXAkB8JDVkIhbH0JAIO/wbitgO/Q6Zplv\nkzVCzFoL4PaAOUbMOoDj9tYss+X89ybKxgS2z5o9EfMs8rviY6wqdU0bvJc6GK7f\nvsrM1zze6v16CP0phRTrgsLxg/NhF4InlLAf4ETC5VI6RyVwrF/EDXu1YaRCvMap\n5haC1giNAgMBAAECggEAAOwsu1YpOUFVfSUDt9Wg/AliEExF9vHkto+F394tw0Xl\n3kI5nHSR1DbZQOhdDvhQg/Sz11dMv5K8NpIdnFuOOqK71i8KpAt9M4KthexQlyuG\n6IfJau6T4ezfyttA6RAUZkiElYzu2KF1V7/W//K/HNSVOhtQUzyRT7NqzOdGnaaC\n6J8Zx3Lk1RQXeNVIRxOj5uINoW+AWhvD4gjj6y0aYYBM6APkr5OrndeicmUkhtd/\nF3YrSeEiuf3roOnodYmmeUhyIY6ef6SAfZjmF9TdNbRGIAWR5e0OMp+GLSJX0/6H\nQ0AxvA7+ItxC76hrEp2XX1EOPMf1N3H0OgeKU3kRIQKBgQD8HL39Tiil1A1CQDmo\nDV8awUukoK+qnPUzx41lCON01iQvcAkBwi9LO9wJdKA6c+T9qYghXck9NvJ7aFZT\nZQ3mjQHCVr+EFnY8Vnuje7Q8V18BpLZThFJ4y6FldKEEXD7qQdhVmck6/WOJurzE\n/6tLTvhmZP2tq/GAwLsqpoi/FQKBgQDFaIxuBzA6DRl1FikCcWJdZX/xWwPRwZCv\nFN2EcQsCWJJ2InZ7zakYbKGO9VPwsWLiX5Yrvr8S1dj9QUnJQSeqgYfHriVdAeKL\nJinkCmGHDvf1ATNy6Lv5Z7kyJGG64fr0RasUWQqH1aSF46xZAVUNH/IOCkMKA08/\nVtaq0hnBmQKBgDPTNLr9dh2gmZkk2rVRClvVoFcXMQVBfqZGPyqlyRwbaRTXUwKp\niE9O3sySzN03NbtvPiyduuB6ix4TNKuv+kuKcPIiIvxkIaoFnSTeKQ6+ZylPUquY\nZ9utAGB6uR7MV6KQJohyNIuLywpk+KkGZY/1i9qAqCUrU1nERLVfxnyBAoGARbwT\n935ElA0ylAD7BajmFZYYZzs+kydso9ycEAAa4n5FZsPv1PYmqMEfJTAWse0HwG4B\nz3w3ZUDzwSsCFL0WdQ4C2A/1lPBohb06iRr9rscj4oHFGe+LD6SLcGIXv/u6OfYu\nZCa8KJXY4480v9BPqi5BxKHtYqkeooJbnMZRYOkCgYBs+TJnjYR+Od85wbHqIyYF\n5jgeP9EqV0eHNjYzHJVp85YZKZxZePUbeiNzt1ReoMH9srW2KqmKNNYDZ1kgBKmd\nJFLjMVoyg5fPbj2Cl2sVaewfPBaMbR6PikCINP7oHAfcRPGqSkIixeXUSeiqFqIc\n50MLOv4AmeslsQRvNYlvig==\n-----END PRIVATE KEY-----\n',
      'https://www.googleapis.com/auth/cloud-platform',
    );
    return await new Promise<string>((resolve, reject) => {
      jwtClient.authorize((err, tokens) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens.access_token);
      });
    });
  }
}
