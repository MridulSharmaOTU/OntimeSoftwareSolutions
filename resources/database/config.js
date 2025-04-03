// config.js in resources/database
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment variable if provided, otherwise compute the absolute path.
const ABSOLUTE_METADATA_PATH = process.env.METADATA_PATH || path.resolve(__dirname, 'metadataGames.csv');

export { ABSOLUTE_METADATA_PATH };