import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OpenAI } from 'openai';
import { Word, WordDocument } from './word';

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name);
  private openai: OpenAI;
  constructor(@InjectModel(Word.name) private wordModel: Model<WordDocument>) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
  }

  async findAll(): Promise<WordDocument[]> {
    return this.wordModel.find({}, { _id: 1, text: 1 });
  }

  async findAllWithEmbedding(): Promise<WordDocument[]> {
    return this.wordModel.find({}, { _id: 1, text: 1, embedding: 1 });
  }

  async findById(id: string): Promise<WordDocument> {
    return this.wordModel.findById(id);
  }

  async vectorSearch(query: string): Promise<WordDocument[]> {
    this.logger.log(`VECTOR SEARCH FOR QUERY: ${query}`);
    const embedding = await this.getEmbedding(query);

    const words = await this.wordModel.aggregate([
      {
        $vectorSearch: {
          queryVector: embedding,
          path: 'embedding',
          numCandidates: 1000,
          limit: 5,
          index: 'word-embeddings',
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    this.logger.log(`WORDS: ${JSON.stringify(words)}`);

    return words;
  }

  async create(text: string): Promise<WordDocument> {
    this.logger.log(`CREATING WORD: ${text}`);
    const embedding = await this.getEmbedding(text);
    const word = await this.wordModel.create({
      _id: new Types.ObjectId(),
      text,
      embedding,
    });
    return word;
  }

  async getEmbedding(text: string) {
    this.logger.log(`GETTING EMBEDDING FOR TEXT: ${text}`);
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    this.logger.log(`RESPONSE: ${JSON.stringify(response)}`);
    this.logger.log(`EMBEDDING: ${response.data[0].embedding}`);

    return response.data[0].embedding;
  }
}
