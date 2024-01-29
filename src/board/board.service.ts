import { BoardRepository } from './board.repository';
import { Injectable } from '@nestjs/common';
import { Board } from './entity/board.entity';

@Injectable()
export class BoardService {
  constructor(private boardRepository: BoardRepository) {}

  async createBoard(userId: number, contents: string, fromDate: Date) {
    await this.boardRepository.saveBoard(userId, contents, fromDate);
  }
  async findAll(): Promise<Board[]> {
    return await this.boardRepository.findAll();
  }

  async findById(userId: number): Promise<Board[]> {
    return await this.boardRepository.findByID(userId);
  }

  async updateBoard(userId: number, boardId: number, contents: string) {
    await this.boardRepository.updateBoard(userId, boardId, contents);
  }

  async deleteBoard(userId: number, boardId: number) {
    await this.boardRepository.deleteBoard(userId, boardId);
  }
}
