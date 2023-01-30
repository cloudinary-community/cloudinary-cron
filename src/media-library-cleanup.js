require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const CLOUD_CONFIGS = [
  {
    cloud_name: process.env.COLBYCLOUD_MEDIA_JAMS_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.COLBYCLOUD_MEDIA_JAMS_CLOUDINARY_API_KEY,
    api_secret: process.env.COLBYCLOUD_MEDIA_JAMS_CLOUDINARY_API_SECRET,
    directoriesToClear: [
      'mediajams/qr/'
    ]
  },
  {
    cloud_name: process.env.COLBYCLOUD_EXAMPLES_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.COLBYCLOUD_EXAMPLES_CLOUDINARY_API_KEY,
    api_secret: process.env.COLBYCLOUD_EXAMPLES_CLOUDINARY_API_SECRET
  },
  {
    cloud_name: process.env.NEXT_CLOUDINARY_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_CLOUDINARY_CLOUDINARY_API_KEY,
    api_secret: process.env.NEXT_CLOUDINARY_CLOUDINARY_API_SECRET
  },
  {
    cloud_name: process.env.SPACEJELLY_TUTORIALS_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.SPACEJELLY_TUTORIALS_CLOUDINARY_API_KEY,
    api_secret: process.env.SPACEJELLY_TUTORIALS_CLOUDINARY_API_SECRET
  },

];

(async function run() {
  for ( let i = 0, configsLength = CLOUD_CONFIGS.length; i < configsLength; i++ ) {
    const config = CLOUD_CONFIGS[i];
    console.log(`---- Begin ${config.cloud_name} ----`);

    cloudinary.config(config);

    await deleteModerations();

    if ( Array.isArray(config.directoriesToClear) ) {
      await clearDirectoriesByPrefixes(config.directoriesToClear);
    }

    console.log(`---- End ${config.cloud_name} ----`);
  }
})();

/**
 * deleteModerations
 */

async function deleteModerations() {
  try {
    const moderations = await cloudinary.api.resources_by_moderation('manual', 'pending', { max_results: 500 });
    const moderationIds = moderations.resources.map(({ public_id }) => public_id);

    if ( moderationIds.length > 0 ) {
      console.log(`Deleting ${moderations.resources.length} moderations...`);

      const results = await cloudinary.api.delete_resources(moderationIds);
      const deletedIds = Object.keys(results.deleted);

      if ( deletedIds.length !== moderationIds.length ) {
        const notDeleted = deletedIds.filter(id => !moderationIds.includes(id));
        console.log(`IDs ${notDeleted.join(', ')} not deleted.`);
      }
    } else {
      console.log('No moderations to delete...');
    }
  } catch(e) {
    console.log(`Failed to delete all moderations: ${e.message}`);
  }
}

/**
 * clearDirectoriesByPrefix
 */

async function clearDirectoriesByPrefixes(prefixes = []) {
  const prefixesLength = prefixes.length;

  if ( prefixesLength === 0 ) {
    console.log('No directories to clear...');
    return;
  }

  console.log(`Clearing ${prefixesLength} directories...`);

  try {
    for ( let i = 0; i < prefixesLength; i++ ) {
      const prefix = prefixes[i];
      await cloudinary.api.delete_resources_by_prefix(prefix);
    }
  } catch(e) {
    console.log(`Failed to clear all directories: ${e.message}`);
  }
}
