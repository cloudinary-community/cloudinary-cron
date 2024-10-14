# ⏰ Cloudinary Cron

* Delete pending moderations every day

## How it Works

GitHub Actions using cron scheduling run every day performing their scheduled task.

### Clearing Pending Moderations

The media library cleanup function requests all available moderations on a Cloudinary account (to the limit of the Cloudinary API) and deletes those pending moderations.

This is helpful for public demos and libraries that want to allow testing uploads, but not maintaining the files for a long time.

Code: https://github.com/cloudinary-community/cloudinary-cron/blob/main/src/media-library-cleanup.js

To add or update existing moderations, modify the `CLOUD_CONFIGS` array:

https://github.com/cloudinary-community/cloudinary-cron/blob/main/src/media-library-cleanup.js#L4

Add or update the associated environment variables to the GitHub Action workflow:

https://github.com/cloudinary-community/cloudinary-cron/blob/main/.github/workflows/media-library-cleanup.yml#L8

Add or update the environment variables as Actions secrets in the repository settings.

## Running Locally

Create a `.env` file in the root of the project and add any environment variables for scripts you want to test.

Then run the script from the root of the project, for example:

```
node src/media-library-cleanup.js
```
