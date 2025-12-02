import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ default: '' })
    description: string;

    @Prop({ enum: ['todo', 'doing', 'done'], default: 'todo' })
    status: string;

    @Prop()
    assignee: string; // user id

    @Prop()
    dueDate: Date;

    @Prop()
    createdAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
