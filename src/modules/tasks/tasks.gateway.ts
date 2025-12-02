import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({

    cors: {
        origin: "http://localhost:3000",
        credentials: true
    },
    namespace: '/'
})
export class TasksGateway implements OnGatewayConnection {

    @WebSocketServer()
    server: Server;

    handleConnection(socket: any) {
        console.log(' Client connected:', socket.id);
    }

    // Emit event task created
    emitTaskCreated(task: any) {
        this.server.emit('task:created', task);
    }

    // phát sự kiện update
    emitTaskUpdated(task: any) {
        this.server.emit('task:updated', task); // Tên sự kiện là 'task:updated'
    }

    // phát sự kiện delete
    emitTaskDeleted(id: string) {
        this.server.emit('task:deleted', { _id: id }); // Tên sự kiện là 'task:deleted'
    }
}
