import { Injectable } from '@nestjs/common';

import { version } from '@/package.json';

@Injectable()
export class AppService {
  getVersion(): string {
    // Read version from package.json
    return version;
  }
}
