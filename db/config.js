import dotenv from 'dotenv'; dotenv.config();
import { neon } from '@neondatabase/serverless'
export const sql = neon(`${process.env.DATABASE_URL}`);

export const connectToDb = async () => {
    try {
        console.log('Setting up the database...');
        const response = await sql`SELECT version()`;
        const { version } = response[0];
        
        // creating favourites table
        await sql`
        CREATE TABLE IF NOT EXISTS public.configuration (
        id BIGSERIAL PRIMARY KEY,
        max_concurrent_tasks BIGINT NOT NULL,
        isolation_level TEXT CHECK (isolation_level IN ('strict', 'flexible'))
        );
        `;

        // creating task table to store task values
        await sql`
        CREATE TABLE IF NOT EXISTS public.tasks (
            id BIGSERIAL PRIMARY KEY,
            type TEXT NOT NULL,
            payload JSONB NOT NULL,
            retry_config JSONB NOT NULL,
            active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        `;

        console.log('Data base connection successfull', version);
    } catch (err) {
        console.error('Error connecting to the database:', err);
        throw err;
    }
}

//for executing all the querys
export const executeQuery = async (query) => {
    try {
      const result = await query();
      console.log(result,'result is this');
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      return {error:ture,message:'something went wrong'}
    }
  };