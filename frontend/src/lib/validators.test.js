import { describe, it, expect } from 'vitest';
import { passwordSchema, loginSchema } from './validators';
describe('password policy',()=>{
 it('requires eight characters with a letter and digit for new passwords',()=>{
  for(const value of ['short1','abcdefgh','12345678'])expect(passwordSchema.safeParse(value).success).toBe(false);
  expect(passwordSchema.safeParse('Letters1').success).toBe(true);
 });
 it('does not reject existing shorter passwords at login',()=>{
  expect(loginSchema.safeParse({email:'old@example.com',password:'legacy'}).success).toBe(true);
 });
});
