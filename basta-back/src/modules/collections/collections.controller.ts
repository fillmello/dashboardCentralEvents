import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Put,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateCollectionDto } from 'src/common/dtos/collection/create.dto';
import { UpdateCollectionDto } from 'src/common/dtos/collection/update.dto';
import { CollectionQueryDto } from 'src/common/dtos/collection/query.dto';
import {
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Roles(Role.ADMIN)
@Controller('collection')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  findAll(@Query() query: CollectionQueryDto) {
    return this.collectionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.collectionsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.collectionsService.delete(id);
  }

  @Put(':id/product/:productId')
  addProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.collectionsService.addProduct(id, productId);
  }

  @Delete(':id/product/:productId')
  removeProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.collectionsService.removeProduct(id, productId);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.collectionsService.uploadImage(id, file);
  }
}
