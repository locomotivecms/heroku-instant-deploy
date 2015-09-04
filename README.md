# [LocomotiveCMS](https://github.com/locomotivecms/engine) on [Heroku](http://heroku.com)

LocomotiveCMS is designed to save your time and help you focus on what matters: front-end technology, standard development process and no learning time for your client. Visit the project's website at <http://locomotivecms.com/>, or read the docs on <http://doc.locomotivecms.com/>.

## Deploying on Heroku

To get your own LocomotiveCMS running on Heroku, click the button below:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/locomotivecms/heroku-instant-deploy)

Follow the steps and you will be up and running in no time!

### Things you should know

- After deployment, visit the admin area at `YOURAPPNAME.herokuapp.com/locomotive` to set up your blog.

- Your blog will be publicly accessible at `YOURAPPNAME.herokuapp.com`.

- To make changes to your Ghost blog (like adding a theme to the `/content` directory, for instance), clone your blog locally using the [Heroku Toolbelt](https://toolbelt.heroku.com/):

  ```sh
  heroku git:clone --app YOURAPPNAME
  ```

### What do I put in the deployment and environment variable fields?

- **HEROKU_APP_NAME (required)**. Pick a name for your application.

- **HEROKU_API_KEY (required)**. The API key of your user. You can find it here: <https://devcenter.heroku.com/articles/authentication>.

- **S3_ACCESS_KEY_ID (required)**. Create or put in your S3 Access Key ID: <http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html>

- **S3_ACCESS_SECRET_KEY (required)**. Create or put in your S3 Access Secret Key: <http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html>

- **S3_BUCKET_NAME (required)**. The value you chose when creating a bucket on S3.

- **S3_BUCKET_REGION (required)**. Pick the region you selected when setting up AmazonS3 <https://locomotive-v3.readme.io/docs/heroku#set-up-amazon-s3>.

- **S3_BUCKET_REGION (optional)**. Optional custom CDN asset host url.

#### Using with file uploads disabled

Heroku app filesystems [aren’t meant for permanent storage](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem), so file uploads are disabled by default when using this repository to deploy a Ghost blog to Heroku. If you’re using Ghost on Heroku with S3 file uploads disabled, you should leave all environment variables beginning with `S3_…` blank.

#### Configuring S3 file uploads

To configure S3 file storage, create an S3 bucket on Amazon AWS, and then specify the following details as environment variables on the Heroku deployment page (or add these environment variables to your app after deployment via the Heroku dashboard):

- `S3_ACCESS_KEY_ID` and `S3_ACCESS_SECRET_KEY`: **Required if using S3 uploads**. These fields are the AWS key/secret pair needed to authenticate with Amazon S3. You must have granted this keypair sufficient permissions on the S3 bucket in question in order for S3 uploads to work.

- `S3_BUCKET_NAME`: **Required if using S3 uploads**. This is the name you gave to your S3 bucket.

- `S3_BUCKET_REGION`: **Required if using S3 uploads**. Specify the region the bucket has been created in, using slug format (e.g. `us-east-1`, `eu-west-1`). A full list of S3 regions is [available here](http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region).

- `S3_ASSET_HOST`: Optional, even if using S3 uploads. Use this variable to specify the S3 bucket URL in virtual host style, path style or using a custom domain. See [this page](http://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html) for details.

Once your app is up and running with these variables in place, you should be able to upload images via the Ghost interface and they’ll be stored in Amazon S3. :sparkles:

### How this works

This repository is essentially a minimal web application that specifies [Ghost as a dependency](https://github.com/TryGhost/Ghost/wiki/Using-Ghost-as-an-NPM-module), and makes a deploy button available.

## Problems?

If you have problems using your instance of Ghost, you should check the [official documentation](http://support.ghost.org/) or open an issue on [the official issue tracker](https://github.com/TryGhost/Ghost/issues). If you discover an issue with the deployment process provided by *this repository*, then [open an issue here](https://github.com/cobyism/ghost-on-heroku).

## License

Released under the [MIT license](./LICENSE), just like the Ghost project itself.
