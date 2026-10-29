import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindTasksDto } from './dto/find-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    const task = this.tasksRepository.create(createTaskDto);
    return this.tasksRepository.save(task);
  }

  async findAll(query: FindTasksDto): Promise<TaskEntity[]> {
    const where: Partial<TaskEntity> = {};

    if (query.isCompleted !== undefined) {
      where.isCompleted = query.isCompleted === 'true';
    }

    if (query.category !== undefined) {
      where.category = query.category;
    }

    return this.tasksRepository.find({ where });
  }

  async findOne(id: string): Promise<TaskEntity> {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Tasks with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.tasksRepository.preload({ id, ...updateTaskDto });
    if (!task) {
      throw new NotFoundException(`Tasks with ID ${id} not found`);
    }
    return this.tasksRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tasksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tasks with ID ${id} not found`);
    }
  }
}
