import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import { JOKE_API_URL } from './telegram.constants';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;
  private readonly greetings: string[] = ['hello', 'hi', 'hey'];

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.bot = new TelegramBot(token, { polling: true });
    this.bot.on('message', (msg) => this.handleMessage(msg));
    this.logger.log('Telegram bot has been initialized');
  }

  private async handleMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const text = msg.text?.toLowerCase();

    this.logger.log(`Received message: ${text} from chatId: ${chatId}`);

    if (text && this.isGreeting(text)) {
      const response = await this.getFunnyStatement();
      this.bot.sendMessage(chatId, response);
    } else {
      this.bot.sendMessage(
        chatId,
        "I only respond to greetings like 'hello', 'hi', or 'hey'.",
      );
    }
  }

  private isGreeting(text: string): boolean {
    return this.greetings.some((greeting) => text.includes(greeting));
  }

  private async getFunnyStatement(): Promise<string> {
    try {
      const response = await axios.get(JOKE_API_URL); // instead of returning predefined statements im returning jokes from public API
      if (response.data && response.data.joke) {
        return response.data.joke;
      } else {
        return "I couldn't think of a joke right now. Try again later!";
      }
    } catch (error) {
      this.logger.error('Failed to fetch a joke', error);
      return "I couldn't think of a joke right now. Try again later!";
    }
  }
}
