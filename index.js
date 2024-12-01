import express ,{Router} from 'express'
import cors from 'cors'
import morgan from 'morgan';
import helmet from 'helmet';
import routes from './routes/index.js'
import { connectToDb } from './db/config.js';

const app = express();
const router = Router();
app.use(express.json());
app.use(cors());
app.use(helmet())
app.use(morgan('dev'))
app.use(express.urlencoded({extended:true}))
routes(app,router)

app.listen(3000, () => {
    console.log('Task Queue Manager running on port 3000');
});

connectToDb();