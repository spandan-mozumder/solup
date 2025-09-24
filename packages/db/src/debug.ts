import { prismaClient } from './index'

async function main() {
  const cols = await prismaClient.$queryRaw<any[]>`SELECT column_name FROM information_schema.columns WHERE table_name='Validator';`;
  console.log(cols);
  const validators = await prismaClient.validator.findMany();
  console.log(validators);
}
main().then(()=>process.exit(0));