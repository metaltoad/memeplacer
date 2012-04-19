 # The project name. (one word: no spaces, dashes, or underscores)
set :application, "memeplacer"

# List the Drupal multi-site folders.  Use "default" if no multi-sites are installed.
# set :domains, ["example.metaltoad.com", "example2.metaltoad.com"]
set :domains, ["default"]

# Set the repository type and location to deploy from.
set :scm, :git
set :repository,  "git@github.com:metaltoad/#{application}.git"

# Use a remote cache to speed things up
set :deploy_via, :remote_cache
ssh_options[:user] = 'deploy'

# Multistage support - see config/deploy/[STAGE].rb for specific configs
set :default_stage, "prod"
set :stages, %w(prod)

# Generally don't need sudo for this deploy setup
set :use_sudo, false

# This allows the sudo command to work if you do need it
default_run_options[:pty] = true
