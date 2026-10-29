import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindTasksDto } from './dto/find-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './task.entity';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let repository: jest.Mocked<
    Pick<
      Repository<TaskEntity>,
      'create' | 'save' | 'find' | 'findOneBy' | 'preload' | 'delete'
    >
  >;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(TaskEntity),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('creates a task', async () => {
    const createTaskDto: CreateTaskDto = {
      title: 'Learn NestJS',
      category: 'Backend',
      description: 'Learn controllers and services',
    };
    const task = { id: 'task-id', ...createTaskDto } as TaskEntity;
    repository.create.mockReturnValue(task);
    repository.save.mockResolvedValue(task);

    await expect(service.create(createTaskDto)).resolves.toBe(task);
    expect(repository.create).toHaveBeenCalledWith(createTaskDto);
    expect(repository.save).toHaveBeenCalledWith(task);
  });

  it('filters tasks by completion state and category', async () => {
    const query: FindTasksDto = {
      isCompleted: 'true',
      category: 'Backend',
    };
    repository.find.mockResolvedValue([]);

    await service.findAll(query);

    expect(repository.find).toHaveBeenCalledWith({
      where: { isCompleted: true, category: 'Backend' },
    });
  });

  it('throws NotFoundException when a task does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      new NotFoundException('Tasks with ID missing-id not found'),
    );
  });

  it('updates an existing task', async () => {
    const updateTaskDto: UpdateTaskDto = { isCompleted: true };
    const task = { id: 'task-id', ...updateTaskDto } as TaskEntity;
    repository.preload.mockResolvedValue(task);
    repository.save.mockResolvedValue(task);

    await expect(service.update('task-id', updateTaskDto)).resolves.toBe(task);
    expect(repository.preload).toHaveBeenCalledWith({
      id: 'task-id',
      ...updateTaskDto,
    });
  });

  it('throws NotFoundException when deleting a missing task', async () => {
    repository.delete.mockResolvedValue({ affected: 0, raw: [] });

    await expect(service.remove('missing-id')).rejects.toThrow(
      new NotFoundException('Tasks with ID missing-id not found'),
    );
  });
});
