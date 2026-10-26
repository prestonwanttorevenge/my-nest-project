import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const post = this.postRepository.create(createPostDto);
    return this.postRepository.save(post);
  }

  async findAll() {
    return this.postRepository.find();
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postRepository.preload({ id, ...updatePostDto });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return this.postRepository.save(post);
  }

  async remove(id: string) {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return this.postRepository.softRemove(post);
  }
}
