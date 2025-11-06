import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { irohAdd, irohDelete } from './iroh';
import { promises as fs } from 'node:fs';
import { extname } from 'node:path';
import type { Express } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function guessMimeByExt(name: string) {
  const e = extname(name).toLowerCase();
  const map: Record<string, string> = {
    // Images
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    
    // Videos
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.wmv': 'video/x-ms-wmv',
    '.flv': 'video/x-flv',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.m4v': 'video/x-m4v',

    // Audio
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',

    // Documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.rtf': 'application/rtf',

    // Archives
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
    '.tar': 'application/x-tar',
    '.gz': 'application/gzip',
    '.bz2': 'application/x-bzip2',

    // Code
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.ts': 'text/typescript',
    '.py': 'text/x-python',
    '.java': 'text/x-java-source',
    '.c': 'text/x-c',
    '.cpp': 'text/x-c++',
    '.sh': 'application/x-sh',

    // Others
    '.apk': 'application/vnd.android.package-archive',
    '.exe': 'application/x-msdownload',
    '.dmg': 'application/x-apple-diskimage',
    '.iso': 'application/x-iso9660-image',
  };
  return map[e] || 'application/octet-stream';
}

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async createFromPath(file: Express.Multer.File, uploader?: string) {
    const { cid } = await irohAdd(file.path);

    // Check if file with this CID already exists
    const existing = await this.prisma.asset.findUnique({ where: { cid } });
    if (existing) {
      // File already exists, just clean up temp file and return existing record
      try { await fs.unlink(file.path); } catch {}
      return { cid, asset: existing, alreadyExists: true };
    }

    const mime = file.mimetype || guessMimeByExt(file.originalname);
    // Decode filename to support Thai and special characters
    // Try to decode, if already encoded it will be decoded, otherwise use as is
    let decodedFilename = file.originalname;
    console.log(decodedFilename)
    try {
      decodedFilename = decodeURIComponent(file.originalname);
        // decodedFilename = decodeURIComponent(escape(file.originalname));
    } catch {
      // If decode fails, use original name
      decodedFilename = file.originalname;
    }

    const asset = await this.prisma.asset.create({
      data: {
        cid,
        filename: decodedFilename,
        mime,
        size: file.size,
        pinned: true,
        uploader,
      }
    });
    // cleanup temp
    try { await fs.unlink(file.path); } catch {}
    return { cid, asset,decodedFilename };
  }

  async list() {
    return this.prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async findByCid(cid: string) {
    return this.prisma.asset.findUnique({ where: { cid } });
  }

  async delete(id: string) {
    // Get asset info first to get the CID
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Delete from Iroh storage
    try {
      await irohDelete(asset.cid);
      console.log(`[delete] Deleted blob ${asset.cid} from Iroh`);
    } catch (error) {
      console.warn(`[delete] Failed to delete blob from Iroh: ${error.message}`);
      // Continue anyway - delete metadata even if blob delete fails
    }

    // Delete metadata from database
    return this.prisma.asset.delete({ where: { id } });
  }

  async getStorageStats() {
    try {
      // Get total database size
      const totalAssets = await this.prisma.asset.count();
      const sizeSum = await this.prisma.asset.aggregate({
        _sum: { size: true }
      });
      const totalSize = sizeSum._sum.size || 0;

      // Get disk usage (df -h)
      const { stdout } = await execAsync('df -h / | tail -1');
      const parts = stdout.trim().split(/\s+/);

      return {
        totalFiles: totalAssets,
        totalSize: totalSize,
        totalSizeGB: (totalSize / 1024 / 1024 / 1024).toFixed(2),
        disk: {
          filesystem: parts[0] || 'unknown',
          size: parts[1] || 'unknown',
          used: parts[2] || 'unknown',
          available: parts[3] || 'unknown',
          usedPercent: parts[4] || 'unknown',
          mounted: parts[5] || '/'
        }
      };
    } catch (error) {
      return {
        totalFiles: 0,
        totalSize: 0,
        totalSizeGB: '0',
        disk: {
          error: error.message
        }
      };
    }
  }
}
