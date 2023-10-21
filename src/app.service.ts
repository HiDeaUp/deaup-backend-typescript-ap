import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getVersion(): string {
    const version = '1.0.0';

    return version;
  }
}
