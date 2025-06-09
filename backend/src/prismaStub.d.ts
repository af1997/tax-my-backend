export class PrismaClient {
  [key: string]: any;
  $executeRaw(...args: any[]): Promise<any>;
  $queryRaw<T = any>(...args: any[]): Promise<T>;
}
declare module "@prisma/client" {
  export { PrismaClient };
}
