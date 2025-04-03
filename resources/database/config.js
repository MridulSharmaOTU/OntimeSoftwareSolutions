// config.js in resources/database
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path for the metadata CSV.
const ABSOLUTE_METADATA_PATH = process.env.METADATA_PATH || path.resolve(__dirname, 'metadataGames.csv');

// Absolute path for the images folder.
const ABSOLUTE_IMAGES_PATH = process.env.IMAGES_PATH || path.resolve(__dirname, "../images");

export { ABSOLUTE_METADATA_PATH, ABSOLUTE_IMAGES_PATH };