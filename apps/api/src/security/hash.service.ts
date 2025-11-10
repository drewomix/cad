import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

@Injectable()
export class HashService {
  hash(value: string) {
    return argon2.hash(value);
  }

  verify(hash: string, value: string) {
    return argon2.verify(hash, value);
  }
}
