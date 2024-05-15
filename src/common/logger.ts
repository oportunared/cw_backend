import Pino from 'pino' 
import dayjs from 'dayjs';

const log = Pino ({
    name: "oportuna-backend-mlm",
    level: "debug",
    prettyPrint: true,
    base: {
        pid: false,
    },
    timestamp: () => `,"time":"${dayjs().format()}"`
});

export default log;