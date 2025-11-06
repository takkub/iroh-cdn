import {
  Controller, Get, Post, Delete, Param, UploadedFile, UseInterceptors, Res, HttpException, HttpStatus, Body, Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import type { Express } from 'express';
import { AssetsService } from './assets.service';
import { irohGetStream } from './iroh';

function filenameFn(_: any, file: Express.Multer.File, cb: (e: any, fileName?: string) => void) {
  const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(null, unique + extname(file.originalname));
}

@Controller('assets')
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({ destination: '/tmp', filename: filenameFn }),
    limits: {
      fileSize: 1024 * 1024 * 1024 * 1024, // 1TB (1024GB)
      fieldSize: 1024 * 1024 * 1024, // 1GB field size
      fields: 1000,
      files: 1
    }
  }))
  async create(@UploadedFile() file: Express.Multer.File, @Body('uploader') uploader?: string) {
    if (!file) throw new HttpException('file required', HttpStatus.BAD_REQUEST);
    return this.assets.createFromPath(file, uploader);
  }

  @Get()
  async list() {
    return this.assets.list();
  }

  @Get(':cid')
  async meta(@Param('cid') cid: string) {
    const asset = await this.assets.findByCid(cid);
    if (!asset) throw new HttpException('not found', HttpStatus.NOT_FOUND);
    return asset;
  }

  @Get(':cid/content')
  async stream(
    @Param('cid') cid: string,
    @Query('download') download: string,
    @Query('filename') filename: string,
    @Res() res: Response
  ) {
    const asset = await this.assets.findByCid(cid).catch(() => null);
    const contentType = asset?.mime || 'application/octet-stream';
    const displayFilename = filename || asset?.filename || 'download';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-CID', cid);

    // Set Content-Disposition to force download with correct filename
    if (download) {
      res.setHeader('Content-Disposition', `attachment; filename="${displayFilename}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${displayFilename}"`);
    }

    const p = irohGetStream(cid);
    p.stdout.pipe(res);
    p.stderr.on('data', d => console.error('[iroh get]', d.toString()));
    p.on('close', (code) => {
      if (code !== 0) {
        if (!res.headersSent) {
          res.status(502).end('Bad gateway (iroh get failed)');
        } else {
          res.end();
        }
      }
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.assets.delete(id);
    return { success: true };
  }

  @Get('stats/storage')
  async getStorageStats() {
    return this.assets.getStorageStats();
  }
}
