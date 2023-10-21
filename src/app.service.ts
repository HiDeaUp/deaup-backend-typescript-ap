import * as path from 'path';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getVersion(): string {
    const baseDir = process.cwd() + '/';
    const pathToPackage = path.join(baseDir, 'package.json');
    const { version } = JSON.parse(fs.readFileSync(pathToPackage).toString());

    return version;
  }
}
