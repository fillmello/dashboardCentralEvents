import {
  Body,
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Put,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateProductDto } from 'src/common/dtos/product/create.dto';
import { UpdateProductDto } from 'src/common/dtos/product/update.dto';
import { ProductQueryDto } from 'src/common/dtos/product/query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Roles(Role.ADMIN)
@Controller('product')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  getAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }

  @Post(':id/image/front')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFrontImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.productsService.uploadFrontImage(id, file);
  }

  @Post(':id/image/back')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadBackImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.productsService.uploadBackImage(id, file);
  }

  @Post(':id/image/additional')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async addAdditionalImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.productsService.addAdditionalImage(id, file);
  }

  @Delete(':id/image/additional')
  removeAdditionalImage(
    @Param('id', ParseIntPipe) id: number,
    @Body('url') url: string,
  ) {
    if (!url) throw new BadRequestException('No url provided');
    return this.productsService.removeAdditionalImage(id, url);
  }
}
