import { executeQuery, sql } from "./config.js";

// adding or updating values
export const updateConfigQuery = async (id, max_concurrent_tasks, isolation_level) => {
    const updateQuery = async () => {
        const result = sql`
        INSERT INTO public.configuration (id, max_concurrent_tasks, isolation_level)
        VALUES (1, ${max_concurrent_tasks}, ${isolation_level})
        ON CONFLICT (id)
        DO UPDATE SET
        max_concurrent_tasks =${max_concurrent_tasks},
        isolation_level = ${isolation_level}`;
        return result;
    };
    const response = await executeQuery(updateQuery)
    return response
}

// adding task to Db
export const addTasks = async (type, payload, retry_config) => {
    try {
        const addQuery = async () => {
            const result = await sql`
            INSERT INTO public.tasks (type, payload, retry_config)
            VALUES (${type}, ${payload}, ${retry_config})
            RETURNING id`;
            return result;
        };
        const response = await executeQuery(addQuery)
        return response
    } catch (err) {
        console.log(err);
    }
}

// get config details
export const getConfigDetails = async () => {
    const getConfig = async () => {
        const result = await sql`
        SELECT * FROM public.configuration WHERE id=1
        `
        return result
    }
    const response = await executeQuery(getConfig)
    return response
}

// get all task details
export const getAllTasks = async () => {
    const allTasks = async () => {
        const result = await sql`
     SELECT * FROM public.tasks WHERE active=true ORDER BY created_at ASC;
    `
        return result
    }
    const response = await executeQuery(allTasks)
    return response
}

// update the active status
export const updateActiveStatus = async (id) => {
    const updateTaskStatus = async () => {
        const result = await sql`
        UPDATE public.tasks SET active=false WHERE id=${id} 
        `;
        return result
    }
    const response = await executeQuery(updateTaskStatus)
    return response
}