require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.NEXT_CLOUDINARY_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_CLOUDINARY_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_CLOUDINARY_CLOUDINARY_API_SECRET
});

(async function run() {
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
})();