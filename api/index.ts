
import express from 'express';
import ghRouter from './controllers/github'

const app: express.Application = express();
const router: express.Router = express.Router();


const ghRoutes: express.Router = ghRouter;
// const bbRoutes: express.Router = require('./controllers/bitbucket');
// const glRoutes: express.Router = require('./controllers/gitlab');


router.use('/github', ghRoutes);
// router.use('/bitbucket', bbRoutes);
// router.use('/gitlab', glRoutes);

app.use(router);
// app.use(cookieParser())

module.exports = {
   path: '/api',
   handler: app
}



