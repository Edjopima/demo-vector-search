import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { WordDocument } from './word';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getWords(): Promise<WordDocument[]> {
    return this.appService.findAll();
  }

  @Get('embedding')
  async getWordsWithEmbedding(): Promise<WordDocument[]> {
    return this.appService.findAllWithEmbedding();
  }

  @Get(':id')
  async getWord(@Param('id') id: string): Promise<WordDocument> {
    return this.appService.findById(id);
  }

  @Get('search/:query')
  async vectorSearch(@Param('query') query: string): Promise<WordDocument[]> {
    return this.appService.vectorSearch(query);
  }

  @Post()
  async createWord(@Body('word') word: string): Promise<WordDocument> {
    return this.appService.create(word);
  }
}
