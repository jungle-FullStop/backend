import { BoardRepository } from './board.repository';
import { Injectable } from '@nestjs/common';
import { Board } from './entity/board.entity';

@Injectable()
export class BoardService {
  constructor(private boardRepository: BoardRepository) {}

  async createBoard(userId: number, contents: string) {
    await this.boardRepository.save({
      userId: userId,
      contents: contents,
      timestamp: new Date(),
    });
  }
  async findAll(): Promise<Board[]> {
    return await this.boardRepository.find();
  }

  async findById(userId: number): Promise<Board[]> {
    return await this.boardRepository.find({
      where: { userId: userId },
    });
  }

  async updateBoard(userId: number, boardId: number, contents: string) {
    await this.boardRepository.update(
      { userId: userId, id: boardId },
      { contents: contents },
    );
  }

  async deleteBoard(userId: number, boardId: number) {
    await this.boardRepository.delete({ userId: userId, id: boardId });
  }
}
