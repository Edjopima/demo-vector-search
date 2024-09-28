import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'words' })
export class Word {
  @Prop({ type: SchemaTypes.ObjectId, ref: Word.name })
  _id: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  embedding: number[];
}

export const WordSchema = SchemaFactory.createForClass(Word);

export type WordDocument = Word & Document;
