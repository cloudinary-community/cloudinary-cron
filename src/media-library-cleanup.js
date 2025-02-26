require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const CLOUD_CONFIGS = [
  {
    cloud_name: process.env.ASTRO_CLOUDINARY_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.ASTRO_CLOUDINARY_CLOUDINARY_API_KEY,
    api_secret: process.env.ASTRO_CLOUDINARY_CLOUDINARY_API_SECRET
  },
  {
    cloud_name: process.env.COLBYCLOUD_APPS_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.COLBYCLOUD_APPS_CLOUDINARY_API_KEY,
    api_secret: process.env.COLBYCLOUD_APPS_CLOUDINARY_API_SECRET
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
    cloud_name: process.env.NUXT_CLOUDINARY_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NUXT_CLOUDINARY_CLOUDINARY_API_KEY,
    api_secret: process.env.NUXT_CLOUDINARY_CLOUDINARY_API_SECRET
  },
  {
    cloud_name: process.env.SVELTE_CLOUDINARY_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.SVELTE_CLOUDINARY_CLOUDINARY_API_KEY,
    api_secret: process.env.SVELTE_CLOUDINARY_CLOUDINARY_API_SECRET
  },
];

(async function run() {
  for ( let i = 0, configsLength = CLOUD_CONFIGS.length; i < configsLength; i++ ) {
    const config = CLOUD_CONFIGS[i];
    console.log(`---- Begin ${config.cloud_name} ----`);

    cloudinary.config(config);

    const moderations = await getAllModerations();

    if ( Array.isArray(moderations) ) {
      await deleteModerations(moderations);
    }

    if ( Array.isArray(config.directoriesToClear) ) {
      await clearDirectoriesByPrefixes(config.directoriesToClear);
    }

    console.log(`---- End ${config.cloud_name} ----`);
  }
})();

/**
 * getAllModerations
 */

async function getAllModerations() {
  try {
    const moderations = await Promise.all(['image', 'raw', 'video'].map(async type => {
      const results = await cloudinary.api.resources_by_moderation('manual', 'pending', {
        max_results: 500,
        resource_type: type
      });

      return results.resources;
    }));

    return moderations.flat();
  } catch(e) {
    console.log(`Failed to get all moderations: ${e.message || e.error?.message}`);
  }
}

/**
 * deleteModerations
 */

async function deleteModerations(moderations) {

  const moderationsByType = moderations.reduce((accum, curr) => {
    if ( !accum[curr.resource_type] ) {
      accum[curr.resource_type] = [];
    }
    accum[curr.resource_type].push(curr);
    return accum;
  }, {});

  try {
    await Promise.all(Object.keys(moderationsByType).map(async resourceType => {
      const moderations = moderationsByType[resourceType];

      if ( moderations.length > 0 ) {
        console.log(`Deleting ${moderations.length} moderations...`);

        const resourceIds = moderations.map(({ public_id }) => public_id);
        const results = await cloudinary.api.delete_resources(resourceIds, {
          resource_type: resourceType
        });

        const deletedIds = Object.keys(results.deleted);

        if ( deletedIds.length !== moderations.length ) {
          const notDeleted = deletedIds.filter(id => !moderations.includes(id));
          console.log(`IDs ${notDeleted.join(', ')} not deleted.`);
        }
      } else {
        console.log('No moderations to delete...');
      }

    }));
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
