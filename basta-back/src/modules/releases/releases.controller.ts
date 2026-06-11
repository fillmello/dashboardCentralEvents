import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ReleasesService } from './releases.service';
import { CreateReleaseDto } from 'src/common/dtos/release/create.dto';
import { UpdateReleaseDto } from 'src/common/dtos/release/update.dto';
import { UpdateProductReleaseDto } from 'src/common/dtos/release/update-item.dto';
import { ReleaseQueryDto } from 'src/common/dtos/release/query.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('release')
export class ReleasesController {
  constructor(private releasesService: ReleasesService) {}

  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() query: ReleaseQueryDto) {
    return this.releasesService.findAll(query);
  }

  @Public()
  @Get('active')
  findActive() {
    return this.releasesService.findActive();
  }

  @Public()
  @Get('active/item/:id')
  findActiveItem(@Param('id', ParseIntPipe) id: number) {
    return this.releasesService.findItemActive(id);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.releasesService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateReleaseDto) {
    return this.releasesService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReleaseDto) {
    return this.releasesService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.releasesService.delete(id);
  }

  @Roles(Role.ADMIN)
  @Put('item/:id')
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductReleaseDto,
  ) {
    return this.releasesService.updateItem(id, dto);
  }

  @Roles(Role.ADMIN)
  @Post('item/:id/image/front')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadItemFrontImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.releasesService.uploadItemFrontImage(id, file);
  }

  @Roles(Role.ADMIN)
  @Post('item/:id/image/back')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadItemBackImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.releasesService.uploadItemBackImage(id, file);
  }

  @Roles(Role.ADMIN)
  @Post('item/:id/image/additional')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  addItemAdditionalImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.releasesService.addItemAdditionalImage(id, file);
  }

  @Roles(Role.ADMIN)
  @Delete('item/:id/image/additional')
  removeItemAdditionalImage(
    @Param('id', ParseIntPipe) id: number,
    @Body('url') url: string,
  ) {
    if (!url) throw new BadRequestException('No url provided');
    return this.releasesService.removeItemAdditionalImage(id, url);
  }
}
