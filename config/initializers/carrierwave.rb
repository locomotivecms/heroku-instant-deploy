CarrierWave.configure do |config|

  config.cache_dir = File.join(Rails.root, 'tmp', 'uploads')

  case Rails.env.to_sym

  when :development
    config.storage = :file
    config.root = File.join(Rails.root, 'public')

  when :production
    # the following configuration works for Amazon S3
    config.storage          = :fog
    config.fog_credentials  = {
      provider:                 'AWS',
      aws_access_key_id:        ENV['S3_KEY_ID'],
      aws_secret_access_key:    ENV['S3_SECRET_KEY'],
      region:                   ENV['S3_BUCKET_REGION']
    }
    config.fog_directory    = ENV['S3_BUCKET_NAME']

    # Put your CDN host below instead
    if ENV['S3_ASSET_HOST_URL'].present?
      config.asset_host = ENV['S3_ASSET_HOST_URL']
    elsif ENV['S3_BUCKET_REGION'].present?
      config.asset_host = "s3-#{ENV['S3_BUCKET_REGION']}.amazonaws.com"
    else
      config.asset_host = 's3.amazonaws.com'
    end

  else
    # settings for the local filesystem
    config.storage = :file
    config.root = File.join(Rails.root, 'public')
  end

end
